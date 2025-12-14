import { useEffect, useState } from 'react';
import { Flame, Music2, RefreshCw } from 'lucide-react';
import { getTopSongs, TopSong } from '../services/api';

export function TopSongsPanel() {
  const [songs, setSongs] = useState<TopSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopSongs();
  }, []);

  const loadTopSongs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTopSongs();
      setSongs(response);
    } catch (err) {
      setError('Erro ao carregar mais tocadas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreTone = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-lime-300';
    if (score >= 55) return 'text-amber-300';
    return 'text-orange-400';
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="dashboard-chip">
            <Flame className="w-4 h-4" />
            Mais tocadas
          </div>
          <h2 className="text-2xl font-bold text-theme mt-3">Hits do momento</h2>
          <p className="text-sm text-theme-muted mt-1">
            As músicas que mais animaram o palco recentemente
          </p>
        </div>
        <button
          onClick={loadTopSongs}
          className="ghost-button"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-karaoke-accent border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-6 text-red-400">
          <p>{error}</p>
          <button
            onClick={loadTopSongs}
            className="mt-2 text-sm underline text-theme"
          >
            Tentar novamente
          </button>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-8 text-theme-muted">
          <Music2 className="w-10 h-10 mx-auto mb-2 opacity-70" />
          <p>Nenhuma reprodução registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {songs.map((song, index) => (
            <div
              key={`${song.song_code}-${song.artist}`}
              className="dashboard-row"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`flex items-center justify-center h-11 w-11 rounded-full text-white font-semibold shadow-lg ${
                    index === 0
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                      : index === 1
                      ? 'bg-gradient-to-br from-sky-500 to-blue-600'
                      : 'bg-gradient-to-br from-emerald-500 to-green-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-theme truncate">{song.song_title}</p>
                  <p className="text-sm text-theme-muted truncate">{song.artist}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-theme">{song.play_count} plays</p>
                <p className={`text-xs font-semibold ${getScoreTone(song.avg_score)}`}>
                  Média {song.avg_score.toFixed(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
