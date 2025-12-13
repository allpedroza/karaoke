import { Router, Request, Response } from 'express';
import { evaluateWithClaude } from '../services/claude.js';

export const evaluationRoutes = Router();

interface EvaluateRequest {
  transcription: string;
  songTitle: string;
  artist: string;
  originalLyrics?: string;
}

evaluationRoutes.post('/evaluate', async (req: Request<object, object, EvaluateRequest>, res: Response) => {
  try {
    const { transcription, songTitle, artist, originalLyrics } = req.body;

    if (!transcription || !songTitle || !artist) {
      res.status(400).json({
        message: 'Campos obrigatórios: transcription, songTitle, artist',
      });
      return;
    }

    console.log(`📝 Avaliando performance de: ${songTitle} - ${artist}`);
    console.log(`📄 Transcrição: ${transcription.substring(0, 100)}...`);

    const evaluation = await evaluateWithClaude({
      transcription,
      songTitle,
      artist,
      originalLyrics,
    });

    res.json(evaluation);
  } catch (error) {
    console.error('Erro na avaliação:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Erro ao avaliar performance',
    });
  }
});
