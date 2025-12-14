import { PerformanceEvaluation, KaraokeVideo, PitchStats } from '../types';

const API_BASE = '/api';

export async function evaluatePerformance(
  transcription: string,
  songCode: string,
  pitchStats: PitchStats | null
): Promise<PerformanceEvaluation> {
  const response = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcription,
      songCode,
      pitchStats,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao avaliar performance');
  }

  return response.json();
}

export async function getCatalog(): Promise<KaraokeVideo[]> {
  const response = await fetch(`${API_BASE}/videos/catalog`);

  if (!response.ok) {
    throw new Error('Erro ao buscar catálogo');
  }

  return response.json();
}

export async function searchVideos(query: string): Promise<KaraokeVideo[]> {
  const response = await fetch(`${API_BASE}/videos/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar vídeos');
  }

  return response.json();
}

export async function getPopularVideos(): Promise<KaraokeVideo[]> {
  const response = await fetch(`${API_BASE}/videos/popular`);

  if (!response.ok) {
    throw new Error('Erro ao buscar vídeos populares');
  }

  return response.json();
}
