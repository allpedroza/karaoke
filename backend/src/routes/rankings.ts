import { Router, Request, Response } from 'express';
import {
  recordSession,
  getDailyRanking,
  getOverallRanking,
  getTopSongsLastMonth,
  getPlayerHistory,
  getTopSingers,
  getAllPlayers,
  getPlayerStats,
} from '../data/database.js';
import { getSongByCode } from '../data/songCatalog.js';

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

// Top cantores por número de sessões
rankingsRoutes.get('/top-singers', (_req: Request, res: Response) => {
  try {
    const topSingers = getTopSingers(5);
    res.json(topSingers);
  } catch (error) {
    console.error('Erro ao buscar top cantores:', error);
    res.status(500).json({ error: 'Erro ao buscar top cantores' });
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

// Listar todos os jogadores
rankingsRoutes.get('/players', (_req: Request, res: Response) => {
  try {
    const players = getAllPlayers();
    res.json(players);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    res.status(500).json({ error: 'Erro ao buscar jogadores' });
  }
});

// Estatísticas detalhadas de um jogador
rankingsRoutes.get('/player/:name/stats', (req: Request, res: Response) => {
  try {
    const stats = getPlayerStats(req.params.name);

    if (!stats) {
      res.status(404).json({ error: 'Jogador não encontrado' });
      return;
    }

    // Calcular gênero favorito baseado nas músicas mais cantadas
    const genreCount: Record<string, number> = {};

    // Buscar todas as sessões do jogador para contar gêneros
    const history = getPlayerHistory(req.params.name, 100);
    for (const session of history) {
      const song = getSongByCode(session.song_code);
      if (song) {
        genreCount[song.genre] = (genreCount[song.genre] || 0) + 1;
      }
    }

    // Encontrar gênero mais frequente
    let favoriteGenre: string | null = null;
    let maxCount = 0;
    for (const [genre, count] of Object.entries(genreCount)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteGenre = genre;
      }
    }

    res.json({
      ...stats,
      favorite_genre: favoriteGenre,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do jogador:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});
