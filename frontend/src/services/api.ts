import { PerformanceEvaluation, KaraokeVideo } from '../types';

const API_BASE = '/api';

export async function evaluatePerformance(
  transcription: string,
  songTitle: string,
  artist: string,
  originalLyrics?: string
): Promise<PerformanceEvaluation> {
  const response = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcription,
      songTitle,
      artist,
      originalLyrics,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao avaliar performance');
  }

  return response.json();
}

export async function searchKaraokeVideos(query: string): Promise<KaraokeVideo[]> {
  const response = await fetch(`${API_BASE}/videos/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar vídeos');
  }

  return response.json();
}

export async function getPopularKaraokeVideos(): Promise<KaraokeVideo[]> {
  const response = await fetch(`${API_BASE}/videos/popular`);

  if (!response.ok) {
    throw new Error('Erro ao buscar vídeos populares');
  }

  return response.json();
}

export async function getLyrics(songTitle: string, artist: string): Promise<string> {
  const response = await fetch(
    `${API_BASE}/lyrics?song=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(artist)}`
  );

  if (!response.ok) {
    return '';
  }

  const data = await response.json();
  return data.lyrics || '';
}
