import { Router, Request, Response } from 'express';
import {
  getMelodyMap,
  hasMelodyMap,
  listMelodyMaps,
  saveMelodyMap,
  deleteMelodyMap,
  markMelodyMapProcessing,
  isMelodyMapProcessing,
  updateMelodySyncOffset,
  MelodyNote,
} from '../data/database.js';
import { getSongByCode, SONG_CATALOG } from '../data/songCatalog.js';
import {
  processAllPendingMelodies,
  getMelodyProcessingStats,
  isMelodyServiceAvailable,
} from '../services/melodyService.js';

const router = Router();

// URL do serviço de extração de melodia (Python)
const MELODY_SERVICE_URL = process.env.MELODY_SERVICE_URL || 'http://localhost:8000';

// Interface para resposta do serviço de melodia (formato Python)
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
  total_notes?: number;
  processed_at: string;
}

// ============================================
// ROTAS ESTÁTICAS (devem vir ANTES de /:songCode)
// ============================================

// GET /api/melody - Listar todas as músicas com melody map
router.get('/', (_req: Request, res: Response) => {
  const melodyMaps = listMelodyMaps();
  res.json(melodyMaps);
});

// GET /api/melody/stats - Estatísticas de processamento
router.get('/stats', (_req: Request, res: Response) => {
  const stats = getMelodyProcessingStats();
  res.json(stats);
});

// GET /api/melody/service-status - Status do serviço Python
router.get('/service-status', async (_req: Request, res: Response) => {
  const available = await isMelodyServiceAvailable();
  res.json({
    available,
    url: MELODY_SERVICE_URL,
  });
});

// GET /api/melody/available - Listar músicas que podem ser processadas (têm OriginalSongId)
router.get('/available', (_req: Request, res: Response) => {
  const available = SONG_CATALOG
    .filter(song => song.OriginalSongId !== null)
    .map(song => ({
      code: song.code,
      song: song.song,
      artist: song.artist,
      hasOriginal: true,
      hasMelodyMap: hasMelodyMap(song.code),
      isProcessing: isMelodyMapProcessing(song.code),
    }));

  res.json(available);
});

// POST /api/melody/batch - Processar todas as músicas pendentes
router.post('/batch', async (req: Request, res: Response) => {
  const { maxConcurrent = 2, delayMs = 5000 } = req.body;

  // Verifica se o serviço está disponível
  const available = await isMelodyServiceAvailable();
  if (!available) {
    res.status(503).json({
      error: 'Serviço de melodia não está disponível',
      url: MELODY_SERVICE_URL,
    });
    return;
  }

  console.log('🚀 Iniciando batch processing de melodias...');

  // Processa em background para não travar a resposta
  processAllPendingMelodies(maxConcurrent, delayMs)
    .then((result) => {
      console.log('✅ Batch processing concluído:', result);
    })
    .catch((error) => {
      console.error('❌ Erro no batch processing:', error);
    });

  const stats = getMelodyProcessingStats();

  res.json({
    message: 'Batch processing iniciado em background',
    pending: stats.pending,
    maxConcurrent,
    delayMs,
  });
});

// POST /api/melody/sync - Sincronizar com o melody-service Python
router.post('/sync', async (_req: Request, res: Response) => {
  try {
    // Busca lista de melodias disponíveis no serviço Python
    const listResponse = await fetch(`${MELODY_SERVICE_URL}/melodies`);

    // Se o endpoint /melodies não existir, busca do cache diretamente
    if (!listResponse.ok) {
      // Tenta buscar melodias individualmente das músicas que têm OriginalSongId
      const songsWithOriginal = SONG_CATALOG.filter(s => s.OriginalSongId);
      let imported = 0;
      let skipped = 0;
      let errors = 0;

      for (const song of songsWithOriginal) {
        try {
          // Pula se já existe no backend
          if (hasMelodyMap(song.code)) {
            skipped++;
            continue;
          }

          // Busca do melody-service
          const melodyResponse = await fetch(`${MELODY_SERVICE_URL}/melody/${song.code}`);
          if (!melodyResponse.ok) {
            continue; // Não existe no serviço Python
          }

          const melodyData = await melodyResponse.json() as MelodyServiceResponse;

          // Mapeia o formato do Python para o formato do backend
          const notes: MelodyNote[] = melodyData.notes.map(note => ({
            time: note.start,
            duration: note.end - note.start,
            note: note.note,
            frequency: note.frequency,
            confidence: note.confidence,
          }));

          // Salva no banco
          saveMelodyMap(
            song.code,
            melodyData.song_title || `${song.song} - ${song.artist}`,
            melodyData.duration,
            notes
          );

          imported++;
          console.log(`✅ Sync: Importado ${song.code} - ${song.song}`);
        } catch (err) {
          errors++;
          console.error(`❌ Sync: Erro ao importar ${song.code}:`, err);
        }
      }

      res.json({
        message: 'Sincronização concluída',
        imported,
        skipped,
        errors,
      });
      return;
    }

    res.json({ message: 'Sync completed' });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({ error: 'Erro ao sincronizar com melody-service' });
  }
});

// ============================================
// ROTAS DINÂMICAS (devem vir DEPOIS das estáticas)
// ============================================

// GET /api/melody/:songCode/exists - Verificar se melody map existe
router.get('/:songCode/exists', (req: Request, res: Response) => {
  const { songCode } = req.params;

  const exists = hasMelodyMap(songCode);
  const processing = isMelodyMapProcessing(songCode);

  res.json({ exists, processing });
});

// PUT /api/melody/:songCode/sync-offset - Atualizar offset de sincronização
router.put('/:songCode/sync-offset', (req: Request, res: Response) => {
  const { songCode } = req.params;
  const { syncOffset } = req.body;

  if (typeof syncOffset !== 'number') {
    res.status(400).json({ error: 'syncOffset deve ser um número' });
    return;
  }

  // Verifica se melody map existe
  if (!hasMelodyMap(songCode)) {
    res.status(404).json({ error: 'Melody map não encontrado para esta música' });
    return;
  }

  const updated = updateMelodySyncOffset(songCode, syncOffset);

  if (updated) {
    console.log(`🔄 Sync offset atualizado: [${songCode}] = ${syncOffset}s`);
    res.json({ success: true, songCode, syncOffset });
  } else {
    res.status(500).json({ error: 'Erro ao atualizar sync offset' });
  }
});

// POST /api/melody/:songCode/process - Processar melodia de uma música
router.post('/:songCode/process', async (req: Request, res: Response) => {
  const { songCode } = req.params;

  // Verifica se a música existe no catálogo
  const song = getSongByCode(songCode);
  if (!song) {
    res.status(404).json({ error: 'Música não encontrada no catálogo' });
    return;
  }

  // Verifica se tem URL original
  if (!song.OriginalSongId) {
    res.status(400).json({ error: 'Música não possui URL original configurada' });
    return;
  }

  // Verifica se já está processando
  if (isMelodyMapProcessing(songCode)) {
    res.status(409).json({ error: 'Música já está sendo processada' });
    return;
  }

  // Verifica se já existe
  if (hasMelodyMap(songCode)) {
    res.status(409).json({ error: 'Melody map já existe para esta música', exists: true });
    return;
  }

  // Marca como processando
  markMelodyMapProcessing(songCode);

  const youtubeUrl = `https://www.youtube.com/watch?v=${song.OriginalSongId}`;

  try {
    // Chama o serviço de extração de melodia
    const response = await fetch(`${MELODY_SERVICE_URL}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        youtube_url: youtubeUrl,
        song_code: songCode,
        song_title: `${song.song} - ${song.artist}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro no serviço de melodia: ${error}`);
    }

    const result = await response.json() as MelodyServiceResponse;

    // Mapeia o formato do Python para o formato do backend
    const notes: MelodyNote[] = result.notes.map(note => ({
      time: note.start,
      duration: note.end - note.start,
      note: note.note,
      frequency: note.frequency,
      confidence: note.confidence,
    }));

    // Salva no banco de dados
    const melodyMap = saveMelodyMap(
      songCode,
      `${song.song} - ${song.artist}`,
      result.duration,
      notes
    );

    console.log(`✅ Melody map processado: [${songCode}] ${song.song} - ${song.artist} (${result.notes.length} notas)`);

    res.json(melodyMap);
  } catch (error) {
    // Remove o status de processando em caso de erro
    deleteMelodyMap(songCode);

    console.error(`❌ Erro ao processar melody map [${songCode}]:`, error);
    res.status(500).json({
      error: 'Erro ao processar melodia',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// GET /api/melody/:songCode - Obter melody map de uma música
router.get('/:songCode', (req: Request, res: Response) => {
  const { songCode } = req.params;

  const melodyMap = getMelodyMap(songCode);

  if (!melodyMap) {
    res.status(404).json({ error: 'Melody map não encontrado para esta música' });
    return;
  }

  res.json(melodyMap);
});

// POST /api/melody/:songCode - Salvar melody map diretamente (para importação manual)
router.post('/:songCode', (req: Request, res: Response) => {
  const { songCode } = req.params;
  const { duration, notes, song_title } = req.body;

  if (!duration || !notes || !Array.isArray(notes)) {
    res.status(400).json({ error: 'Campos obrigatórios: duration, notes (array)' });
    return;
  }

  const melodyMap = saveMelodyMap(songCode, song_title || null, duration, notes);

  console.log(`✅ Melody map salvo manualmente: [${songCode}] (${notes.length} notas)`);

  res.status(201).json(melodyMap);
});

// DELETE /api/melody/:songCode - Deletar melody map
router.delete('/:songCode', (req: Request, res: Response) => {
  const { songCode } = req.params;

  const deleted = deleteMelodyMap(songCode);

  if (!deleted) {
    res.status(404).json({ error: 'Melody map não encontrado' });
    return;
  }

  console.log(`🗑️ Melody map deletado: [${songCode}]`);

  res.json({ message: 'Melody map deletado com sucesso' });
});

export default router;
