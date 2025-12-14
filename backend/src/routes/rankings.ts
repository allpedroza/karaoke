import { Router, Request, Response } from 'express';
import {
  recordSession,
  getDailyRanking,
  getOverallRanking,
  getTopSongsLastMonth,
  getPlayerHistory,
} from '../data/database.js';

export const rankingsRoutes = Router();

// Registrar uma sessão de karaokê
rankingsRoutes.post('/session', (req: Request, res: Response) => {
  try {
    const { playerName, songCode, songTitle, artist, score } = req.body;

    if (!playerName || !songCode || !songTitle || !artist || score === undefined) {
      res.status(400).json({ error: 'Campos obrigatórios: playerName, songCode, songTitle, artist, score' });
      return;
    }

    const session = recordSession(playerName, songCode, songTitle, artist, score);
    res.json(session);
  } catch (error) {
    console.error('Erro ao registrar sessão:', error);
    res.status(500).json({ error: 'Erro ao registrar sessão' });
  }
});

// Ranking do dia (Top 5)
rankingsRoutes.get('/daily', (_req: Request, res: Response) => {
  try {
    const ranking = getDailyRanking(5);
    res.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking diário:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// Ranking geral (Top 5)
rankingsRoutes.get('/overall', (_req: Request, res: Response) => {
  try {
    const ranking = getOverallRanking(5);
    res.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking geral:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// Top músicas do mês
rankingsRoutes.get('/top-songs', (_req: Request, res: Response) => {
  try {
    const topSongs = getTopSongsLastMonth(5);
    res.json(topSongs);
  } catch (error) {
    console.error('Erro ao buscar top músicas:', error);
    res.status(500).json({ error: 'Erro ao buscar top músicas' });
  }
});

// Histórico de um jogador
rankingsRoutes.get('/player/:name', (req: Request, res: Response) => {
  try {
    const history = getPlayerHistory(req.params.name, 10);
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});
