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
    status TEXT DEFAULT 'completed',
    sync_offset REAL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_melody_maps_song_code ON melody_maps(song_code);
`);

// Migration: Add sync_offset column if it doesn't exist
try {
  db.exec(`ALTER TABLE melody_maps ADD COLUMN sync_offset REAL DEFAULT 0`);
  console.log('✅ Added sync_offset column to melody_maps table');
} catch {
  // Column already exists, ignore
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

export interface TopSingerExtended extends TopSinger {
  total_singing_time_seconds: number;
}

export interface EvolutionEntry {
  player_name: string;
  first_avg: number;
  last_avg: number;
  improvement: number;
  total_sessions: number;
}

export interface HotStreakEntry {
  player_name: string;
  streak_count: number;
  best_score_in_streak: number;
  streak_avg: number;
}

export interface GenreSpecialist {
  genre: string;
  player_name: string;
  avg_score: number;
  sessions_count: number;
  title: string;
}

export interface GenreRankingEntry {
  player_name: string;
  song_title: string;
  artist: string;
  score: number;
  created_at: string;
  genre: string;
}

export interface SongRankingEntry {
  player_name: string;
  score: number;
  created_at: string;
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

// Top cantores com tempo total cantando (usa o catálogo de músicas)
export function getTopSingersExtended(limit: number = 10, songDurations: Map<string, number>): TopSingerExtended[] {
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
      MAX(created_at) as last_played,
      GROUP_CONCAT(song_code) as song_codes
    FROM sessions s
    GROUP BY player_name
    ORDER BY sessions_count DESC, avg_score DESC
    LIMIT ?
  `);

  const results = stmt.all(limit) as (TopSinger & { song_codes: string })[];

  return results.map(row => {
    const songCodes = row.song_codes.split(',');
    let totalTime = 0;
    for (const code of songCodes) {
      totalTime += songDurations.get(code) || 0;
    }
    return {
      player_name: row.player_name,
      sessions_count: row.sessions_count,
      avg_score: row.avg_score,
      last_song_title: row.last_song_title,
      last_artist: row.last_artist,
      last_played: row.last_played,
      total_singing_time_seconds: totalTime,
    };
  });
}

// Evolução: cantores que mais melhoraram (últimos 5 vs primeiros 5)
export function getEvolutionRanking(limit: number = 10): EvolutionEntry[] {
  // Buscar todos os jogadores com pelo menos 10 sessões
  const playersStmt = db.prepare(`
    SELECT player_name, COUNT(*) as total
    FROM sessions
    GROUP BY player_name
    HAVING total >= 10
  `);

  const players = playersStmt.all() as { player_name: string; total: number }[];

  const evolutionData: EvolutionEntry[] = [];

  for (const player of players) {
    // Primeiros 5
    const firstStmt = db.prepare(`
      SELECT AVG(score) as avg_score
      FROM (
        SELECT score FROM sessions
        WHERE player_name = ?
        ORDER BY created_at ASC
        LIMIT 5
      )
    `);
    const firstResult = firstStmt.get(player.player_name) as { avg_score: number };

    // Últimos 5
    const lastStmt = db.prepare(`
      SELECT AVG(score) as avg_score
      FROM (
        SELECT score FROM sessions
        WHERE player_name = ?
        ORDER BY created_at DESC
        LIMIT 5
      )
    `);
    const lastResult = lastStmt.get(player.player_name) as { avg_score: number };

    const improvement = lastResult.avg_score - firstResult.avg_score;

    evolutionData.push({
      player_name: player.player_name,
      first_avg: Math.round(firstResult.avg_score * 10) / 10,
      last_avg: Math.round(lastResult.avg_score * 10) / 10,
      improvement: Math.round(improvement * 10) / 10,
      total_sessions: player.total,
    });
  }

  // Ordenar por melhoria e retornar top N
  return evolutionData
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, limit);
}

// Hot Streak: maior sequência de scores acima de 80
export function getHotStreakRanking(limit: number = 10): HotStreakEntry[] {
  // Buscar todos os jogadores
  const playersStmt = db.prepare(`
    SELECT DISTINCT player_name FROM sessions
  `);

  const players = playersStmt.all() as { player_name: string }[];

  const streakData: HotStreakEntry[] = [];

  for (const player of players) {
    // Buscar todas as sessões do jogador ordenadas por data
    const sessionsStmt = db.prepare(`
      SELECT score FROM sessions
      WHERE player_name = ?
      ORDER BY created_at ASC
    `);

    const sessions = sessionsStmt.all(player.player_name) as { score: number }[];

    let maxStreak = 0;
    let currentStreak = 0;
    let streakScores: number[] = [];
    let bestStreakScores: number[] = [];

    for (const session of sessions) {
      if (session.score >= 80) {
        currentStreak++;
        streakScores.push(session.score);

        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          bestStreakScores = [...streakScores];
        }
      } else {
        currentStreak = 0;
        streakScores = [];
      }
    }

    if (maxStreak >= 2) {
      const bestScore = Math.max(...bestStreakScores);
      const avgScore = bestStreakScores.reduce((a, b) => a + b, 0) / bestStreakScores.length;

      streakData.push({
        player_name: player.player_name,
        streak_count: maxStreak,
        best_score_in_streak: bestScore,
        streak_avg: Math.round(avgScore * 10) / 10,
      });
    }
  }

  // Ordenar por tamanho do streak e retornar top N
  return streakData
    .sort((a, b) => b.streak_count - a.streak_count || b.streak_avg - a.streak_avg)
    .slice(0, limit);
}

// Especialistas por Gênero: melhor média por gênero (mínimo 3 sessões)
export function getGenreSpecialists(genreMap: Map<string, string>): GenreSpecialist[] {
  // Buscar estatísticas por jogador e gênero
  const stmt = db.prepare(`
    SELECT
      player_name,
      song_code,
      ROUND(AVG(score), 1) as avg_score,
      COUNT(*) as sessions_count
    FROM sessions
    GROUP BY player_name, song_code
  `);

  const results = stmt.all() as { player_name: string; song_code: string; avg_score: number; sessions_count: number }[];

  // Agrupar por gênero
  const genreStats = new Map<string, Map<string, { total_score: number; count: number }>>();

  for (const row of results) {
    const genre = genreMap.get(row.song_code);
    if (!genre) continue;

    if (!genreStats.has(genre)) {
      genreStats.set(genre, new Map());
    }

    const playerStats = genreStats.get(genre)!;
    if (!playerStats.has(row.player_name)) {
      playerStats.set(row.player_name, { total_score: 0, count: 0 });
    }

    const stats = playerStats.get(row.player_name)!;
    stats.total_score += row.avg_score * row.sessions_count;
    stats.count += row.sessions_count;
  }

  // Encontrar o melhor de cada gênero (mínimo 3 sessões)
  const specialists: GenreSpecialist[] = [];

  const genreTitles: Record<string, string> = {
    'Samba': 'Mestre do Samba',
    'MPB': 'Voz da MPB',
    'Rock': 'Rockeiro(a) Nato(a)',
    'Rock Nacional': 'Roqueiro(a) Brasileiro(a)',
    'Pagode': 'Rei/Rainha do Pagode',
    'Sertanejo': 'Estrela Sertaneja',
    'Pop': 'Popstar',
    'Axé': 'Rei/Rainha do Axé',
    'Funk': 'MC do Momento',
    'Forró': 'Pé de Serra',
    'Brega': 'Coração Apaixonado',
    'Pop Rock': 'Estrela do Pop Rock',
    'Reggae': 'Vibes de Reggae',
    'Soul': 'Alma de Soul',
    'R&B/Soul': 'Voz de R&B',
  };

  for (const [genre, playerStats] of genreStats) {
    let bestPlayer = '';
    let bestAvg = 0;
    let bestCount = 0;

    for (const [player, stats] of playerStats) {
      if (stats.count >= 3) {
        const avg = stats.total_score / stats.count;
        if (avg > bestAvg || (avg === bestAvg && stats.count > bestCount)) {
          bestPlayer = player;
          bestAvg = avg;
          bestCount = stats.count;
        }
      }
    }

    if (bestPlayer) {
      specialists.push({
        genre,
        player_name: bestPlayer,
        avg_score: Math.round(bestAvg * 10) / 10,
        sessions_count: bestCount,
        title: genreTitles[genre] || `Especialista em ${genre}`,
      });
    }
  }

  return specialists.sort((a, b) => b.avg_score - a.avg_score);
}

// Ranking por gênero
export function getRankingByGenre(genre: string, genreMap: Map<string, string>, limit: number = 10): GenreRankingEntry[] {
  // Filtrar song_codes do gênero
  const songCodes: string[] = [];
  for (const [code, g] of genreMap) {
    if (g.toLowerCase().includes(genre.toLowerCase())) {
      songCodes.push(code);
    }
  }

  if (songCodes.length === 0) return [];

  const placeholders = songCodes.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT player_name, song_title, artist, score, created_at
    FROM sessions
    WHERE song_code IN (${placeholders})
    ORDER BY score DESC
    LIMIT ?
  `);

  const results = stmt.all(...songCodes, limit) as RankingEntry[];

  return results.map(r => ({ ...r, genre }));
}

// Ranking por música específica
export function getRankingBySong(songCode: string, limit: number = 10): SongRankingEntry[] {
  const stmt = db.prepare(`
    SELECT player_name, score, created_at
    FROM sessions
    WHERE song_code = ?
    ORDER BY score DESC
    LIMIT ?
  `);

  return stmt.all(songCode, limit) as SongRankingEntry[];
}

// Listar todos os gêneros disponíveis com contagem
export function getAvailableGenres(genreMap: Map<string, string>): { genre: string; count: number }[] {
  const stmt = db.prepare(`
    SELECT song_code, COUNT(*) as count
    FROM sessions
    GROUP BY song_code
  `);

  const results = stmt.all() as { song_code: string; count: number }[];

  const genreCount = new Map<string, number>();

  for (const row of results) {
    const genre = genreMap.get(row.song_code);
    if (genre) {
      genreCount.set(genre, (genreCount.get(genre) || 0) + row.count);
    }
  }

  return Array.from(genreCount.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
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
  sync_offset: number; // Offset em segundos para sincronizar com vídeo karaokê
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
  sync_offset: number;
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
    INSERT OR REPLACE INTO melody_maps (song_code, song_title, duration, notes, total_notes, status, sync_offset)
    VALUES (?, ?, ?, ?, ?, 'completed', 0)
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
    sync_offset: 0,
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

// Atualizar offset de sincronização de um melody map
export function updateMelodySyncOffset(songCode: string, syncOffset: number): boolean {
  const stmt = db.prepare(`
    UPDATE melody_maps SET sync_offset = ? WHERE song_code = ?
  `);

  const result = stmt.run(syncOffset, songCode);
  return result.changes > 0;
}

// Obter apenas o offset de sincronização
export function getMelodySyncOffset(songCode: string): number {
  const stmt = db.prepare(`
    SELECT sync_offset FROM melody_maps WHERE song_code = ?
  `);

  const row = stmt.get(songCode) as { sync_offset: number } | undefined;
  return row?.sync_offset ?? 0;
}

export default db;
