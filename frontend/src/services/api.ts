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

export interface PlayerTopSong {
  song_code: string;
  song_title: string;
  artist: string;
  play_count: number;
  avg_score: number;
}

export interface PlayerStats {
  player_name: string;
  total_sessions: number;
  avg_score: number;
  favorite_genre: string | null;
  top_songs: PlayerTopSong[];
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

// Listar todos os jogadores
export async function getAllPlayers(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/rankings/players`);
  if (!response.ok) throw new Error('Erro ao buscar jogadores');
  return response.json();
}

// Estatísticas detalhadas de um jogador
export async function getPlayerStats(playerName: string): Promise<PlayerStats> {
  const response = await fetch(`${API_BASE}/rankings/player/${encodeURIComponent(playerName)}/stats`);
  if (!response.ok) throw new Error('Erro ao buscar estatísticas do jogador');
  return response.json();
}
