import { Router, Request, Response } from 'express';

export const videosRoutes = Router();

interface KaraokeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  artist: string;
  song: string;
}

// Lista de vídeos de karaokê populares
const POPULAR_VIDEOS: KaraokeVideo[] = [
  {
    id: 'pXRviuL6vMY',
    title: 'Evidências - Chitãozinho e Xororó (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/pXRviuL6vMY/mqdefault.jpg',
    duration: '4:32',
    artist: 'Chitãozinho e Xororó',
    song: 'Evidências',
  },
  {
    id: '1jQFdz0FClE',
    title: 'Anunciação - Alceu Valença (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/1jQFdz0FClE/mqdefault.jpg',
    duration: '4:18',
    artist: 'Alceu Valença',
    song: 'Anunciação',
  },
  {
    id: 'hbzGGrHLUxw',
    title: 'Let It Be - Beatles (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/hbzGGrHLUxw/mqdefault.jpg',
    duration: '4:03',
    artist: 'Beatles',
    song: 'Let It Be',
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody - Queen (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
    duration: '5:55',
    artist: 'Queen',
    song: 'Bohemian Rhapsody',
  },
  {
    id: 'YkgkThdzX-8',
    title: 'Shallow - Lady Gaga (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/YkgkThdzX-8/mqdefault.jpg',
    duration: '3:35',
    artist: 'Lady Gaga',
    song: 'Shallow',
  },
  {
    id: 'RBumgq5yVrA',
    title: 'Perfect - Ed Sheeran (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/RBumgq5yVrA/mqdefault.jpg',
    duration: '4:23',
    artist: 'Ed Sheeran',
    song: 'Perfect',
  },
];

// Buscar vídeos populares
videosRoutes.get('/popular', (_req: Request, res: Response) => {
  res.json(POPULAR_VIDEOS);
});

// Buscar vídeos por query
videosRoutes.get('/search', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();

  if (!query) {
    res.json(POPULAR_VIDEOS);
    return;
  }

  const filtered = POPULAR_VIDEOS.filter(
    video =>
      video.title.toLowerCase().includes(query) ||
      video.artist.toLowerCase().includes(query) ||
      video.song.toLowerCase().includes(query)
  );

  res.json(filtered.length > 0 ? filtered : POPULAR_VIDEOS);
});
