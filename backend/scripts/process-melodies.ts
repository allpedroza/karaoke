/**
 * Script para processar melody maps de todas as músicas pendentes
 *
 * Uso:
 *   npx tsx scripts/process-melodies.ts
 *   npx tsx scripts/process-melodies.ts --single SONG_CODE
 */

import { SONG_CATALOG, getSongByCode } from '../src/data/songCatalog.js';
import {
  hasMelodyMap,
  saveMelodyMap,
  isMelodyMapProcessing,
  markMelodyMapProcessing,
  deleteMelodyMap,
  MelodyNote,
} from '../src/data/database.js';

const MELODY_SERVICE_URL = process.env.MELODY_SERVICE_URL || 'http://localhost:8000';

interface MelodyServiceNote {
  start: number;
  end: number;
  note: string;
  frequency: number;
  confidence: number;
}

interface MelodyServiceResponse {
  song_code: string;
  song_title?: string | null;
  duration: number;
  notes: MelodyServiceNote[];
  processed_at: string;
}

async function checkMelodyService(): Promise<boolean> {
  try {
    const response = await fetch(`${MELODY_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function processSong(songCode: string): Promise<boolean> {
  const song = getSongByCode(songCode);

  if (!song) {
    console.error(`❌ Música não encontrada: ${songCode}`);
    return false;
  }

  if (!song.OriginalSongId) {
    console.warn(`⚠️ [${songCode}] Não tem OriginalSongId configurado`);
    return false;
  }

  if (hasMelodyMap(songCode)) {
    console.log(`✅ [${songCode}] Melody map já existe`);
    return true;
  }

  if (isMelodyMapProcessing(songCode)) {
    console.log(`⏳ [${songCode}] Já está sendo processado`);
    return false;
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${song.OriginalSongId}`;
  const songTitle = `${song.song} - ${song.artist}`;

  console.log(`🎵 [${songCode}] Processando: ${songTitle}`);
  console.log(`   URL: ${youtubeUrl}`);

  markMelodyMapProcessing(songCode);

  try {
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
      throw new Error(`Erro no serviço: ${error}`);
    }

    const result = await response.json() as MelodyServiceResponse;

    // Mapeia o formato do Python para o formato do backend
    const notes: MelodyNote[] = result.notes.map((note: MelodyServiceNote) => ({
      time: note.start,
      duration: note.end - note.start,
      note: note.note,
      frequency: note.frequency,
      confidence: note.confidence,
    }));

    saveMelodyMap(songCode, songTitle, result.duration, notes);

    console.log(`✅ [${songCode}] Processado! ${notes.length} notas, ${result.duration.toFixed(1)}s`);
    return true;

  } catch (error) {
    deleteMelodyMap(songCode);
    console.error(`❌ [${songCode}] Erro:`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  console.log('\n🎵 CantaAI - Processador de Melody Maps\n');
  console.log(`   Melody Service: ${MELODY_SERVICE_URL}\n`);

  // Verifica se o melody service está rodando
  const serviceOk = await checkMelodyService();
  if (!serviceOk) {
    console.error('❌ Melody Service não está respondendo!');
    console.error('   Inicie o serviço:');
    console.error('   cd melody-service && source venv/bin/activate && python main.py\n');
    process.exit(1);
  }
  console.log('✅ Melody Service está rodando\n');

  // Verifica se é processamento de uma única música
  const args = process.argv.slice(2);
  if (args.includes('--single') || args.includes('-s')) {
    const songIndex = args.indexOf('--single') !== -1
      ? args.indexOf('--single') + 1
      : args.indexOf('-s') + 1;
    const songCode = args[songIndex];

    if (!songCode) {
      console.error('❌ Código da música não informado');
      console.error('   Uso: npx tsx scripts/process-melodies.ts --single CODIGO');
      process.exit(1);
    }

    await processSong(songCode);
    return;
  }

  // Processa todas as músicas pendentes
  const songsToProcess = SONG_CATALOG.filter(
    song => song.OriginalSongId && !hasMelodyMap(song.code) && !isMelodyMapProcessing(song.code)
  );

  const alreadyProcessed = SONG_CATALOG.filter(
    song => song.OriginalSongId && hasMelodyMap(song.code)
  );

  console.log('📊 Estatísticas:');
  console.log(`   Total com OriginalSongId: ${SONG_CATALOG.filter(s => s.OriginalSongId).length}`);
  console.log(`   Já processadas: ${alreadyProcessed.length}`);
  console.log(`   Pendentes: ${songsToProcess.length}\n`);

  if (alreadyProcessed.length > 0) {
    console.log('✅ Músicas já processadas:');
    alreadyProcessed.forEach(song => {
      console.log(`   [${song.code}] ${song.song} - ${song.artist}`);
    });
    console.log('');
  }

  if (songsToProcess.length === 0) {
    console.log('🎉 Todas as músicas já foram processadas!\n');
    return;
  }

  console.log('🎵 Músicas a processar:');
  songsToProcess.forEach((song, i) => {
    console.log(`   ${i + 1}. [${song.code}] ${song.song} - ${song.artist}`);
  });
  console.log('');

  let processed = 0;
  let failed = 0;

  for (const song of songsToProcess) {
    console.log(`\n[${'━'.repeat(50)}]`);
    console.log(`Processando ${processed + failed + 1}/${songsToProcess.length}...\n`);

    const success = await processSong(song.code);
    if (success) {
      processed++;
    } else {
      failed++;
    }

    // Delay entre processamentos para não sobrecarregar
    if (processed + failed < songsToProcess.length) {
      console.log('\n⏳ Aguardando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n${'═'.repeat(52)}`);
  console.log('📊 Resultado Final:');
  console.log(`   ✅ Processadas: ${processed}`);
  console.log(`   ❌ Falharam: ${failed}`);
  console.log(`${'═'.repeat(52)}\n`);
}

main().catch(console.error);
