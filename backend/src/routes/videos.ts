import { Router, Request, Response } from 'express';
import { SONG_CATALOG, getSongByCode, searchSongs, getSongsByLanguage, KaraokeSong } from '../data/songCatalog.js';
import { hasMelodyMap } from '../data/database.js';
import { processMelodyInBackground } from '../services/melodyService.js';

export const videosRoutes = Router();

// Converter KaraokeSong para formato do frontend
function toVideoFormat(song: KaraokeSong, includeMelodyStatus = false) {
  const base = {
    id: song.youtubeId,
    code: song.code,
    title: `${song.song} - ${song.artist} (Karaokê)`,
    thumbnail: `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`,
    artist: song.artist,
    song: song.song,
    language: song.language,
    genre: song.genre,
    duration: song.duration,
    hasOriginal: !!song.OriginalSongId,
  };

  if (includeMelodyStatus) {
    return {
      ...base,
      hasMelodyMap: hasMelodyMap(song.code),
    };
  }

  return base;
}

// Listar todas as músicas
videosRoutes.get('/catalog', (_req: Request, res: Response) => {
  const videos = SONG_CATALOG.map(song => toVideoFormat(song));
  res.json(videos);
});

// Buscar músicas populares (primeiras 8)
videosRoutes.get('/popular', (_req: Request, res: Response) => {
  const popular = SONG_CATALOG.slice(0, 8).map(song => toVideoFormat(song));
  res.json(popular);
});

// Buscar música por código
// Dispara processamento de melodia em background se não existir
videosRoutes.get('/code/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const song = getSongByCode(code);

  if (!song) {
    res.status(404).json({ error: 'Música não encontrada' });
    return;
  }

  // Dispara processamento de melodia em background (não bloqueia a resposta)
  if (song.OriginalSongId && !hasMelodyMap(code)) {
    processMelodyInBackground(code);
  }

  res.json(toVideoFormat(song, true));
});

// Buscar músicas por query
videosRoutes.get('/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';

  if (!query.trim()) {
    res.json(SONG_CATALOG.map(song => toVideoFormat(song)));
    return;
  }

  const results = searchSongs(query).map(song => toVideoFormat(song));
  res.json(results);
});

// Buscar músicas por idioma
videosRoutes.get('/language/:lang', (req: Request, res: Response) => {
  const lang = req.params.lang as 'pt-BR' | 'en' | 'es';
  const songs = getSongsByLanguage(lang).map(song => toVideoFormat(song));
  res.json(songs);
});
