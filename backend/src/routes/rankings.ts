import { Router, Request, Response } from 'express';
import {
  recordSession,
  getDailyRanking,
  getOverallRanking,
  getTopSongsLastMonth,
  getPlayerHistory,
  getTopSingers,
  getTopSingersExtended,
  getEvolutionRanking,
  getHotStreakRanking,
  getGenreSpecialists,
  getRankingByGenre,
  getRankingBySong,
  getAvailableGenres,
} from '../data/database.js';
import { SONG_CATALOG } from '../data/songCatalog.js';

// Criar mapas de gênero e duração a partir do catálogo
function getGenreMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const song of SONG_CATALOG) {
    map.set(song.code, song.genre);
  }
  return map;
}

function getDurationMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const song of SONG_CATALOG) {
    // Converter duração "MM:SS" para segundos
    const parts = song.duration.split(':');
    const minutes = parseInt(parts[0], 10) || 0;
    const seconds = parseInt(parts[1], 10) || 0;
    map.set(song.code, minutes * 60 + seconds);
  }
  return map;
}

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

// Top cantores com tempo total cantando (Liga dos Incansáveis estendida)
rankingsRoutes.get('/top-singers-extended', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const durationMap = getDurationMap();
    const topSingers = getTopSingersExtended(limit, durationMap);
    res.json(topSingers);
  } catch (error) {
    console.error('Erro ao buscar top cantores estendido:', error);
    res.status(500).json({ error: 'Erro ao buscar top cantores' });
  }
});

// Ranking de Evolução (quem mais melhorou)
rankingsRoutes.get('/evolution', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const evolution = getEvolutionRanking(limit);
    res.json(evolution);
  } catch (error) {
    console.error('Erro ao buscar ranking de evolução:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking de evolução' });
  }
});

// Hot Streak (maior sequência de scores >= 80)
rankingsRoutes.get('/hot-streak', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const streaks = getHotStreakRanking(limit);
    res.json(streaks);
  } catch (error) {
    console.error('Erro ao buscar hot streaks:', error);
    res.status(500).json({ error: 'Erro ao buscar hot streaks' });
  }
});

// Especialistas por Gênero
rankingsRoutes.get('/genre-specialists', (_req: Request, res: Response) => {
  try {
    const genreMap = getGenreMap();
    const specialists = getGenreSpecialists(genreMap);
    res.json(specialists);
  } catch (error) {
    console.error('Erro ao buscar especialistas:', error);
    res.status(500).json({ error: 'Erro ao buscar especialistas' });
  }
});

// Gêneros disponíveis
rankingsRoutes.get('/genres', (_req: Request, res: Response) => {
  try {
    const genreMap = getGenreMap();
    const genres = getAvailableGenres(genreMap);
    res.json(genres);
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    res.status(500).json({ error: 'Erro ao buscar gêneros' });
  }
});

// Ranking por gênero
rankingsRoutes.get('/by-genre/:genre', (req: Request, res: Response) => {
  try {
    const genre = decodeURIComponent(req.params.genre);
    const limit = parseInt(req.query.limit as string) || 10;
    const genreMap = getGenreMap();
    const ranking = getRankingByGenre(genre, genreMap, limit);
    res.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking por gênero:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking por gênero' });
  }
});

// Ranking por música específica
rankingsRoutes.get('/by-song/:songCode', (req: Request, res: Response) => {
  try {
    const songCode = req.params.songCode;
    const limit = parseInt(req.query.limit as string) || 10;
    const ranking = getRankingBySong(songCode, limit);

    // Adicionar info da música
    const song = SONG_CATALOG.find(s => s.code === songCode);
    res.json({
      song: song ? { code: song.code, title: song.song, artist: song.artist, genre: song.genre } : null,
      ranking,
    });
  } catch (error) {
    console.error('Erro ao buscar ranking por música:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking por música' });
  }
});
