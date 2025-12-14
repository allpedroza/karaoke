import { useEffect, useState } from 'react';
import { Mic2, Users, RefreshCw } from 'lucide-react';
import { getTopSingers, TopSinger } from '../services/api';

export function TopSingersPanel() {
  const [singers, setSingers] = useState<TopSinger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopSingers();
  }, []);

  const loadTopSingers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTopSingers();
      setSingers(response);
    } catch (err) {
      setError('Erro ao carregar top cantores');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTone = (avgScore: number) => {
    if (avgScore >= 85) return 'text-emerald-400';
    if (avgScore >= 70) return 'text-lime-300';
    if (avgScore >= 55) return 'text-amber-300';
    return 'text-orange-400';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="dashboard-chip">
            <Users className="w-4 h-4" />
            Top Cantores
          </div>
          <h2 className="text-2xl font-bold text-theme mt-3">Liga dos incansáveis</h2>
          <p className="text-sm text-theme-muted mt-1">
            Quem mais subiu ao palco para cantar
          </p>
        </div>
        <button
          onClick={loadTopSingers}
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
            onClick={loadTopSingers}
            className="mt-2 text-sm underline text-theme"
          >
            Tentar novamente
          </button>
        </div>
      ) : singers.length === 0 ? (
        <div className="text-center py-8 text-theme-muted">
          <Mic2 className="w-10 h-10 mx-auto mb-2 opacity-70" />
          <p>Nenhum cantor registrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {singers.map((singer, index) => (
            <div key={singer.player_name} className="dashboard-row">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`flex items-center justify-center h-11 w-11 rounded-full text-white font-semibold shadow-lg ${
                    index === 0
                      ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600'
                      : index === 1
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-br from-amber-500 to-orange-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-theme truncate">{singer.player_name}</p>
                  <p className="text-sm text-theme-muted truncate">
                    Última: {singer.last_song_title} - {singer.last_artist}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-theme">{singer.sessions_count} sessões</p>
                <p className={`text-xs font-semibold ${getTone(singer.avg_score)}`}>
                  Média {singer.avg_score.toFixed(1)} · {formatDate(singer.last_played)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
