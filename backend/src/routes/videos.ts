import { Router, Request, Response } from 'express';
import { SONG_CATALOG, getSongByCode, searchSongs, getSongsByLanguage, KaraokeSong } from '../data/songCatalog.js';

export const videosRoutes = Router();

// Converter KaraokeSong para formato do frontend
function toVideoFormat(song: KaraokeSong) {
  return {
    id: song.youtubeId,
    code: song.code,
    title: `${song.song} - ${song.artist} (Karaokê)`,
    thumbnail: `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`,
    artist: song.artist,
    song: song.song,
    language: song.language,
    genre: song.genre,
    duration: song.duration,
  };
}

// Listar todas as músicas
videosRoutes.get('/catalog', (_req: Request, res: Response) => {
  const videos = SONG_CATALOG.map(toVideoFormat);
  res.json(videos);
});

// Buscar músicas populares (primeiras 8)
videosRoutes.get('/popular', (_req: Request, res: Response) => {
  const popular = SONG_CATALOG.slice(0, 8).map(toVideoFormat);
  res.json(popular);
});

// Buscar música por código
videosRoutes.get('/code/:code', (req: Request, res: Response) => {
  const song = getSongByCode(req.params.code);
  if (!song) {
    res.status(404).json({ error: 'Música não encontrada' });
    return;
  }
  res.json(toVideoFormat(song));
});

// Buscar músicas por query
videosRoutes.get('/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';

  if (!query.trim()) {
    res.json(SONG_CATALOG.map(toVideoFormat));
    return;
  }

  const results = searchSongs(query).map(toVideoFormat);
  res.json(results);
});

// Buscar músicas por idioma
videosRoutes.get('/language/:lang', (req: Request, res: Response) => {
  const lang = req.params.lang as 'pt-BR' | 'en' | 'es';
  const songs = getSongsByLanguage(lang).map(toVideoFormat);
  res.json(songs);
});
