import { useState, useEffect } from 'react';
import { getTopSongs, TopSong } from '../services/api';

interface TopSongsPanelProps {
  onSongSelect?: (songCode: string) => void;
}

export function TopSongsPanel({ onSongSelect }: TopSongsPanelProps) {
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopSongs();
  }, []);

  const loadTopSongs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const songs = await getTopSongs();
      setTopSongs(songs);
    } catch (err) {
      setError('Erro ao carregar músicas populares');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFireEmoji = (playCount: number) => {
    if (playCount >= 10) return '🔥🔥🔥';
    if (playCount >= 5) return '🔥🔥';
    if (playCount >= 3) return '🔥';
    return '✨';
  };

  return (
    <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 border border-pink-500/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🎵 Mais Tocadas
        </h2>
        <span className="text-xs text-pink-300 bg-pink-500/20 px-2 py-1 rounded-full">
          Último mês
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          <p>{error}</p>
          <button
            onClick={loadTopSongs}
            className="mt-2 text-sm text-pink-300 hover:text-white underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : topSongs.length === 0 ? (
        <div className="text-center py-8 text-pink-300">
          <p className="text-3xl mb-2">🎤</p>
          <p>Nenhuma música tocada ainda!</p>
          <p className="text-sm mt-1 text-pink-400">
            Seja o primeiro a cantar!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topSongs.map((song, index) => (
            <div
              key={song.song_code}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-white/10 ${
                index === 0
                  ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30'
                  : 'bg-white/5 border border-white/10'
              }`}
              onClick={() => onSongSelect?.(song.song_code)}
            >
              {/* Position */}
              <div className="text-lg font-bold text-pink-300 w-6 text-center">
                {index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate flex items-center gap-2">
                  {song.song_title}
                  <span className="text-sm">{getFireEmoji(song.play_count)}</span>
                </p>
                <p className="text-sm text-pink-300 truncate">
                  {song.artist}
                </p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-xs text-pink-400">
                  {song.play_count}x tocada{song.play_count > 1 ? 's' : ''}
                </p>
                <p className={`text-sm font-semibold ${getScoreColor(song.avg_score)}`}>
                  média {Math.round(song.avg_score)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-pink-500/20 text-center">
        <p className="text-xs text-pink-400">
          Baseado nas últimas 30 dias de performances
        </p>
      </div>
    </div>
  );
}
