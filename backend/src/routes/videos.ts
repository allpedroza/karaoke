import { Router, Request, Response } from 'express';
import { SONG_CATALOG, getSongByCode, searchSongs, getSongsByLanguage, KaraokeSong, addSongToCatalog, getNextCode } from '../data/songCatalog.js';
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

// Obter o próximo código disponível
videosRoutes.get('/next-code', (_req: Request, res: Response) => {
  const nextCode = getNextCode();
  res.json({ code: nextCode });
});

// Adicionar nova música ao catálogo
videosRoutes.post('/add', async (req: Request, res: Response) => {
  try {
    const { youtubeId, artist, song, language, genre, duration } = req.body;

    // Validações
    if (!youtubeId || !artist || !song || !language || !genre || !duration) {
      res.status(400).json({
        error: 'Todos os campos são obrigatórios',
        required: ['youtubeId', 'artist', 'song', 'language', 'genre', 'duration']
      });
      return;
    }

    // Validar formato do YouTube ID
    if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      res.status(400).json({ error: 'ID do YouTube inválido' });
      return;
    }

    // Validar formato de duração (MM:SS)
    if (!/^\d{1,2}:\d{2}$/.test(duration)) {
      res.status(400).json({ error: 'Formato de duração inválido. Use MM:SS' });
      return;
    }

    // Validar idioma
    if (!['pt-BR', 'en', 'es'].includes(language)) {
      res.status(400).json({ error: 'Idioma inválido. Use pt-BR, en ou es' });
      return;
    }

    // Verificar se o YouTube ID já existe
    const existingSong = SONG_CATALOG.find(s => s.youtubeId === youtubeId);
    if (existingSong) {
      res.status(409).json({
        error: 'Esta música já existe no catálogo',
        existingCode: existingSong.code
      });
      return;
    }

    // Adicionar música ao catálogo
    const newSong: KaraokeSong = {
      code: getNextCode(),
      song: song.trim(),
      artist: artist.trim(),
      youtubeId: youtubeId.trim(),
      OriginalSongId: null,
      language: language as 'pt-BR' | 'en' | 'es',
      duration: duration.trim(),
      genre: genre.trim(),
    };

    const success = await addSongToCatalog(newSong);

    if (success) {
      res.status(201).json({
        message: 'Música adicionada com sucesso!',
        song: toVideoFormat(newSong)
      });
    } else {
      res.status(500).json({ error: 'Erro ao salvar música no catálogo' });
    }
  } catch (error) {
    console.error('Erro ao adicionar música:', error);
    res.status(500).json({ error: 'Erro interno ao adicionar música' });
  }
});
