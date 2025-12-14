import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar banco de dados na pasta data
const dbPath = path.join(__dirname, '../../karaoke.db');
const db = new Database(dbPath);

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    song_code TEXT NOT NULL,
    song_title TEXT NOT NULL,
    artist TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date(created_at));
  CREATE INDEX IF NOT EXISTS idx_sessions_song ON sessions(song_code);
  CREATE INDEX IF NOT EXISTS idx_sessions_score ON sessions(score DESC);
`);

export interface SessionRecord {
  id: number;
  player_name: string;
  song_code: string;
  song_title: string;
  artist: string;
  score: number;
  created_at: string;
}

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

const TIMEZONE_OFFSET = '-3 hours';

// Registrar uma sessão
export function recordSession(
  playerName: string,
  songCode: string,
  songTitle: string,
  artist: string,
  score: number
): SessionRecord {
  const stmt = db.prepare(`
    INSERT INTO sessions (player_name, song_code, song_title, artist, score)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(playerName, songCode, songTitle, artist, score);

  return {
    id: result.lastInsertRowid as number,
    player_name: playerName,
    song_code: songCode,
    song_title: songTitle,
    artist: artist,
    score: score,
    created_at: new Date().toISOString(),
  };
}

// Ranking do dia (Top 5)
export function getDailyRanking(limit: number = 5): RankingEntry[] {
  const stmt = db.prepare(`
    SELECT player_name, song_title, artist, score, created_at
    FROM sessions
    WHERE date(created_at, ?) = date('now', ?)
    ORDER BY score DESC
    LIMIT ?
  `);

  return stmt.all(TIMEZONE_OFFSET, TIMEZONE_OFFSET, limit) as RankingEntry[];
}

// Ranking geral (Top 5)
export function getOverallRanking(limit: number = 5): RankingEntry[] {
  const stmt = db.prepare(`
    SELECT player_name, song_title, artist, score, created_at
    FROM sessions
    ORDER BY score DESC
    LIMIT ?
  `);

  return stmt.all(limit) as RankingEntry[];
}

// Top músicas do último mês
export function getTopSongsLastMonth(limit: number = 5): TopSong[] {
  const stmt = db.prepare(`
    SELECT
      song_code,
      song_title,
      artist,
      COUNT(*) as play_count,
      ROUND(AVG(score), 1) as avg_score
    FROM sessions
    WHERE datetime(created_at, ?) >= datetime('now', '-30 days', ?)
    GROUP BY song_code
    ORDER BY play_count DESC
    LIMIT ?
  `);

  return stmt.all(TIMEZONE_OFFSET, TIMEZONE_OFFSET, limit) as TopSong[];
}

// Histórico de um jogador
export function getPlayerHistory(playerName: string, limit: number = 10): SessionRecord[] {
  const stmt = db.prepare(`
    SELECT *
    FROM sessions
    WHERE player_name = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(playerName, limit) as SessionRecord[];
}

export default db;
