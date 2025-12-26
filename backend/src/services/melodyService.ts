/**
 * Melody Service
 * Gerencia a integração com o microserviço Python de extração de melodia.
 * Processa melodias em background de forma assíncrona.
 */

import {
  saveMelodyMap,
  hasMelodyMap,
  markMelodyMapProcessing,
  isMelodyMapProcessing,
  deleteMelodyMap,
  MelodyNote,
} from '../data/database.js';
import { getSongByCode, SONG_CATALOG } from '../data/songCatalog.js';

// URL do serviço de extração de melodia (Python)
const MELODY_SERVICE_URL = process.env.MELODY_SERVICE_URL || 'http://localhost:8000';

// Interface para resposta do serviço de melodia
interface MelodyServiceResponse {
  song_code: string;
  song_title: string | null;
  duration: number;
  notes: MelodyNote[];
  total_notes: number;
  processed_at: string;
}

// Fila de processamento em memória
const processingQueue: Set<string> = new Set();

/**
 * Verifica se o serviço de melodia está disponível
 */
export async function isMelodyServiceAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${MELODY_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Processa a melodia de uma música em background
 * Não bloqueia - retorna imediatamente e processa em segundo plano
 */
export function processMelodyInBackground(songCode: string): void {
  // Evita processamento duplicado
  if (processingQueue.has(songCode)) {
    console.log(`⏳ [${songCode}] Já está na fila de processamento`);
    return;
  }

  if (hasMelodyMap(songCode)) {
    console.log(`✅ [${songCode}] Melody map já existe`);
    return;
  }

  if (isMelodyMapProcessing(songCode)) {
    console.log(`⏳ [${songCode}] Já está sendo processado`);
    return;
  }

  const song = getSongByCode(songCode);
  if (!song || !song.OriginalSongId) {
    console.log(`⚠️ [${songCode}] Música não encontrada ou sem URL original`);
    return;
  }

  // Adiciona à fila e inicia processamento
  processingQueue.add(songCode);

  // Processo assíncrono - não aguarda
  processAsync(songCode, song.OriginalSongId, `${song.song} - ${song.artist}`)
    .catch((error) => {
      console.error(`❌ [${songCode}] Erro no processamento em background:`, error);
    })
    .finally(() => {
      processingQueue.delete(songCode);
    });

  console.log(`🎵 [${songCode}] Processamento de melodia iniciado em background`);
}

/**
 * Processamento assíncrono interno
 */
async function processAsync(
  songCode: string,
  originalSongId: string,
  songTitle: string
): Promise<void> {
  // Marca como processando no banco
  markMelodyMapProcessing(songCode);

  const youtubeUrl = `https://www.youtube.com/watch?v=${originalSongId}`;

  try {
    // Verifica se o serviço está disponível
    const available = await isMelodyServiceAvailable();
    if (!available) {
      console.log(`⚠️ [${songCode}] Serviço de melodia não disponível, pulando...`);
      deleteMelodyMap(songCode); // Remove status de 'processing'
      return;
    }

    console.log(`🔄 [${songCode}] Chamando serviço de extração de melodia...`);

    const response = await fetch(`${MELODY_SERVICE_URL}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        youtube_url: youtubeUrl,
        song_code: songCode,
        song_title: songTitle,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro no serviço de melodia: ${error}`);
    }

    const result = (await response.json()) as MelodyServiceResponse;

    // Salva no banco de dados
    saveMelodyMap(songCode, songTitle, result.duration, result.notes);

    console.log(
      `✅ [${songCode}] Melody map processado com sucesso! (${result.notes.length} notas, ${result.duration}s)`
    );
  } catch (error) {
    // Remove o status de processando em caso de erro
    deleteMelodyMap(songCode);
    throw error;
  }
}

/**
 * Processa todas as músicas que têm URL original mas não têm melody map
 * Útil para batch processing inicial
 */
export async function processAllPendingMelodies(
  maxConcurrent: number = 2,
  delayMs: number = 5000
): Promise<{ processed: number; failed: number; skipped: number }> {
  const songsToProcess = SONG_CATALOG.filter(
    (song) => song.OriginalSongId && !hasMelodyMap(song.code) && !isMelodyMapProcessing(song.code)
  );

  console.log(`\n🎵 Iniciando batch processing de ${songsToProcess.length} músicas...\n`);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  // Processa em lotes
  for (let i = 0; i < songsToProcess.length; i += maxConcurrent) {
    const batch = songsToProcess.slice(i, i + maxConcurrent);

    const promises = batch.map(async (song) => {
      try {
        await processAsync(song.code, song.OriginalSongId!, `${song.song} - ${song.artist}`);
        processed++;
      } catch (error) {
        console.error(`❌ [${song.code}] Falhou:`, error);
        failed++;
      }
    });

    await Promise.all(promises);

    // Delay entre lotes para não sobrecarregar
    if (i + maxConcurrent < songsToProcess.length) {
      console.log(`⏳ Aguardando ${delayMs / 1000}s antes do próximo lote...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log(`\n✅ Batch processing concluído:`);
  console.log(`   - Processadas: ${processed}`);
  console.log(`   - Falharam: ${failed}`);
  console.log(`   - Puladas: ${skipped}`);

  return { processed, failed, skipped };
}

/**
 * Retorna estatísticas do processamento
 */
export function getMelodyProcessingStats(): {
  total: number;
  withOriginal: number;
  processed: number;
  pending: number;
  processing: number;
} {
  const total = SONG_CATALOG.length;
  const withOriginal = SONG_CATALOG.filter((s) => s.OriginalSongId).length;
  const processed = SONG_CATALOG.filter((s) => hasMelodyMap(s.code)).length;
  const processing = SONG_CATALOG.filter((s) => isMelodyMapProcessing(s.code)).length;
  const pending = withOriginal - processed - processing;

  return { total, withOriginal, processed, pending, processing };
}
