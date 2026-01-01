import { PerformanceEvaluation, KaraokeVideo, PitchStats, MelodyMap } from '../types';

const API_BASE = '/api';

export async function evaluatePerformance(
  transcription: string,
  songCode: string,
  pitchStats: PitchStats | null,
  recordingDuration?: number
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
      recordingDuration,
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

// ============================================
// RANKINGS E SESSÕES
// ============================================

export interface RankingEntry {
  player_name: string;
  song_title: string;
  artist: string;
  score: number;
  created_at: string;
}

export interface TopSong {
  song_code: string;
  song_title: string;
  artist: string;
  play_count: number;
  avg_score: number;
}

export interface TopSinger {
  player_name: string;
  sessions_count: number;
  avg_score: number;
  last_song_title: string;
  last_artist: string;
  last_played: string;
}

export interface SessionRecord {
  id: number;
  player_name: string;
  song_code: string;
  song_title: string;
  artist: string;
  score: number;
  created_at: string;
}

// Registrar uma sessão
export async function recordSession(
  playerName: string,
  songCode: string,
  songTitle: string,
  artist: string,
  score: number
): Promise<SessionRecord> {
  const response = await fetch(`${API_BASE}/rankings/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, songCode, songTitle, artist, score }),
  });

  if (!response.ok) {
    throw new Error('Erro ao registrar sessão');
  }

  return response.json();
}

// Ranking do dia
export async function getDailyRanking(): Promise<RankingEntry[]> {
  const response = await fetch(`${API_BASE}/rankings/daily`);
  if (!response.ok) throw new Error('Erro ao buscar ranking diário');
  return response.json();
}

// Ranking geral
export async function getOverallRanking(): Promise<RankingEntry[]> {
  const response = await fetch(`${API_BASE}/rankings/overall`);
  if (!response.ok) throw new Error('Erro ao buscar ranking geral');
  return response.json();
}

// Top músicas do mês
export async function getTopSongs(): Promise<TopSong[]> {
  const response = await fetch(`${API_BASE}/rankings/top-songs`);
  if (!response.ok) throw new Error('Erro ao buscar top músicas');
  return response.json();
}

// Top cantores por número de sessões
export async function getTopSingers(): Promise<TopSinger[]> {
  const response = await fetch(`${API_BASE}/rankings/top-singers`);
  if (!response.ok) throw new Error('Erro ao buscar top cantores');
  return response.json();
}

// ============================================
// MELODY MAPS (Pitch Bar)
// ============================================

// Buscar melody map de uma música
export async function getMelodyMap(songCode: string): Promise<MelodyMap | null> {
  const response = await fetch(`${API_BASE}/melody/${songCode}`);

  if (response.status === 404) {
    return null; // Melody map ainda não existe
  }

  if (!response.ok) {
    throw new Error('Erro ao buscar melody map');
  }

  return response.json();
}

// Salvar offset de sincronização de um melody map
export async function saveMelodySyncOffset(songCode: string, syncOffset: number): Promise<boolean> {
  const response = await fetch(`${API_BASE}/melody/${songCode}/sync-offset`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ syncOffset }),
  });

  if (!response.ok) {
    throw new Error('Erro ao salvar sync offset');
  }

  return true;
}

// ============================================
// QUEUE (Fila de Músicas)
// ============================================

export interface QueueItemAPI {
  id: string;
  songCode: string;
  songTitle: string;
  artist: string;
  thumbnail: string;
  singerName: string;
  addedAt: string;
}

export interface QueueResponse {
  queue: QueueItemAPI[];
  count: number;
  maxSize: number;
}

export interface AddToQueueResponse {
  item: QueueItemAPI;
  position: number;
  message: string;
}

// Buscar fila atual
export async function getQueue(): Promise<QueueResponse> {
  const response = await fetch(`${API_BASE}/queue`);
  if (!response.ok) throw new Error('Erro ao buscar fila');
  return response.json();
}

// Adicionar música à fila
export async function addToQueue(songCode: string, singerName: string): Promise<AddToQueueResponse> {
  const response = await fetch(`${API_BASE}/queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ songCode, singerName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao adicionar à fila');
  }

  return response.json();
}

// Remover música da fila
export async function removeFromQueue(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/queue/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Erro ao remover da fila');
}

// Pegar próxima música da fila
export async function getNextFromQueue(): Promise<{ item: QueueItemAPI; remainingCount: number } | null> {
  const response = await fetch(`${API_BASE}/queue/next`, {
    method: 'POST',
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Erro ao pegar próxima música');

  return response.json();
}
