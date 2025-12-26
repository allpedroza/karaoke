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

  CREATE TABLE IF NOT EXISTS melody_maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_code TEXT NOT NULL UNIQUE,
    song_title TEXT,
    duration REAL NOT NULL,
    notes TEXT NOT NULL,
    total_notes INTEGER NOT NULL,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'completed'
  );

  CREATE INDEX IF NOT EXISTS idx_melody_maps_song_code ON melody_maps(song_code);
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

export interface TopSinger {
  player_name: string;
  sessions_count: number;
  avg_score: number;
  last_song_title: string;
  last_artist: string;
  last_played: string;
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

// Jogadores que mais cantam
export function getTopSingers(limit: number = 5): TopSinger[] {
  const stmt = db.prepare(`
    SELECT
      player_name,
      COUNT(*) as sessions_count,
      ROUND(AVG(score), 1) as avg_score,
      (
        SELECT song_title
        FROM sessions s2
        WHERE s2.player_name = s.player_name
        ORDER BY s2.created_at DESC
        LIMIT 1
      ) as last_song_title,
      (
        SELECT artist
        FROM sessions s3
        WHERE s3.player_name = s.player_name
        ORDER BY s3.created_at DESC
        LIMIT 1
      ) as last_artist,
      MAX(created_at) as last_played
    FROM sessions s
    GROUP BY player_name
    ORDER BY sessions_count DESC, avg_score DESC
    LIMIT ?
  `);

  return stmt.all(limit) as TopSinger[];
}

// --- MELODY MAPS ---

export interface MelodyNote {
  start: number;
  end: number;
  note: string;
  frequency: number;
  confidence: number;
}

export interface MelodyMap {
  id: number;
  song_code: string;
  song_title: string | null;
  duration: number;
  notes: MelodyNote[];
  total_notes: number;
  processed_at: string;
  status: string;
}

interface MelodyMapRow {
  id: number;
  song_code: string;
  song_title: string | null;
  duration: number;
  notes: string; // JSON string
  total_notes: number;
  processed_at: string;
  status: string;
}

// Salvar melody map
export function saveMelodyMap(
  songCode: string,
  songTitle: string | null,
  duration: number,
  notes: MelodyNote[]
): MelodyMap {
  const notesJson = JSON.stringify(notes);

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO melody_maps (song_code, song_title, duration, notes, total_notes, status)
    VALUES (?, ?, ?, ?, ?, 'completed')
  `);

  const result = stmt.run(songCode, songTitle, duration, notesJson, notes.length);

  return {
    id: result.lastInsertRowid as number,
    song_code: songCode,
    song_title: songTitle,
    duration,
    notes,
    total_notes: notes.length,
    processed_at: new Date().toISOString(),
    status: 'completed',
  };
}

// Obter melody map por código da música
export function getMelodyMap(songCode: string): MelodyMap | null {
  const stmt = db.prepare(`
    SELECT * FROM melody_maps WHERE song_code = ?
  `);

  const row = stmt.get(songCode) as MelodyMapRow | undefined;

  if (!row) return null;

  return {
    ...row,
    notes: JSON.parse(row.notes) as MelodyNote[],
  };
}

// Verificar se melody map existe
export function hasMelodyMap(songCode: string): boolean {
  const stmt = db.prepare(`
    SELECT 1 FROM melody_maps WHERE song_code = ? AND status = 'completed'
  `);

  return stmt.get(songCode) !== undefined;
}

// Listar todas as músicas com melody map
export function listMelodyMaps(): { song_code: string; song_title: string | null; total_notes: number; processed_at: string }[] {
  const stmt = db.prepare(`
    SELECT song_code, song_title, total_notes, processed_at
    FROM melody_maps
    WHERE status = 'completed'
    ORDER BY processed_at DESC
  `);

  return stmt.all() as { song_code: string; song_title: string | null; total_notes: number; processed_at: string }[];
}

// Deletar melody map
export function deleteMelodyMap(songCode: string): boolean {
  const stmt = db.prepare(`
    DELETE FROM melody_maps WHERE song_code = ?
  `);

  const result = stmt.run(songCode);
  return result.changes > 0;
}

// Marcar como processando (para evitar duplicação)
export function markMelodyMapProcessing(songCode: string): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO melody_maps (song_code, duration, notes, total_notes, status)
    VALUES (?, 0, '[]', 0, 'processing')
  `);

  stmt.run(songCode);
}

// Verificar se está processando
export function isMelodyMapProcessing(songCode: string): boolean {
  const stmt = db.prepare(`
    SELECT 1 FROM melody_maps WHERE song_code = ? AND status = 'processing'
  `);

  return stmt.get(songCode) !== undefined;
}

export default db;
