import { Router, Request, Response } from 'express';
import { evaluateWithClaude, PitchStats } from '../services/claude.js';
import { getSongByCode } from '../data/songCatalog.js';

export const evaluationRoutes = Router();

interface EvaluateRequest {
  transcription: string;
  songCode: string;
  pitchStats?: PitchStats | null;
}

evaluationRoutes.post('/evaluate', async (req: Request<object, object, EvaluateRequest>, res: Response) => {
  try {
    const { transcription, songCode, pitchStats } = req.body;

    if (!transcription || !songCode) {
      res.status(400).json({
        error: 'Campos obrigatórios: transcription, songCode',
      });
      return;
    }

    // Buscar música no catálogo
    const song = getSongByCode(songCode);
    if (!song) {
      res.status(404).json({
        error: `Música com código ${songCode} não encontrada no catálogo`,
      });
      return;
    }

    console.log(`🎤 Avaliando performance de: [${song.code}] ${song.song} - ${song.artist}`);
    console.log(`📄 Transcrição (${transcription.length} chars): "${transcription.substring(0, 100)}..."`);
    if (pitchStats) {
      console.log(`🎵 Pitch: estabilidade=${pitchStats.pitchStability}%, precisão=${pitchStats.pitchAccuracy}%, notas=[${pitchStats.notesDetected.slice(0, 5).join(', ')}...]`);
    }

    const evaluation = await evaluateWithClaude({
      transcription,
      songCode: song.code,
      songTitle: song.song,
      artist: song.artist,
      language: song.language,
      pitchStats: pitchStats || undefined,
    });

    console.log(`✅ Score: ${evaluation.overallScore}/100`);

    res.json(evaluation);
  } catch (error) {
    console.error('❌ Erro na avaliação:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro ao avaliar performance',
    });
  }
});
