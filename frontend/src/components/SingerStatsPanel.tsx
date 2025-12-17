import { useEffect, useState } from 'react';
import { User, Music, Heart, Trophy, RefreshCw } from 'lucide-react';
import { getAllPlayers, getPlayerStats, PlayerStats } from '../services/api';

export function SingerStatsPanel() {
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerStats(selectedPlayer);
    } else {
      setStats(null);
    }
  }, [selectedPlayer]);

  const loadPlayers = async () => {
    setIsLoadingPlayers(true);
    setError(null);
    try {
      const response = await getAllPlayers();
      setPlayers(response);
    } catch (err) {
      setError('Erro ao carregar lista de cantores');
      console.error(err);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  const loadPlayerStats = async (playerName: string) => {
    setIsLoadingStats(true);
    setError(null);
    try {
      const response = await getPlayerStats(playerName);
      setStats(response);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getTone = (avgScore: number) => {
    if (avgScore >= 85) return 'text-emerald-400';
    if (avgScore >= 70) return 'text-lime-300';
    if (avgScore >= 55) return 'text-amber-300';
    return 'text-orange-400';
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="dashboard-chip">
            <User className="w-4 h-4" />
            Perfil do Cantor
          </div>
          <h2 className="text-2xl font-bold text-theme mt-3">Estatísticas Pessoais</h2>
          <p className="text-sm text-theme-muted mt-1">
            Veja o perfil musical de cada cantor
          </p>
        </div>
        {selectedPlayer && (
          <button
            onClick={() => loadPlayerStats(selectedPlayer)}
            className="ghost-button"
            disabled={isLoadingStats}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        )}
      </div>

      {/* Dropdown de seleção */}
      <div className="mb-6 relative z-10">
        <label className="block text-sm font-medium text-theme-muted mb-2">
          Selecione um cantor:
        </label>
        {isLoadingPlayers ? (
          <div className="flex items-center gap-2 text-theme-muted">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Carregando cantores...
          </div>
        ) : (
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-theme focus:outline-none focus:ring-2 focus:ring-karaoke-accent/50 transition-all"
          >
            <option value="" className="bg-gray-900">Escolha um cantor...</option>
            {players.map((player) => (
              <option key={player} value={player} className="bg-gray-900">
                {player}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="text-center py-4 text-red-400">
          <p>{error}</p>
        </div>
      )}

      {isLoadingStats ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-karaoke-accent border-t-transparent"></div>
        </div>
      ) : stats ? (
        <div className="space-y-4 relative z-10">
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold text-theme">{stats.total_sessions}</p>
              <p className="text-xs text-theme-muted">vezes cantou</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Music className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className={`text-2xl font-bold ${getTone(stats.avg_score)}`}>
                {stats.avg_score.toFixed(1)}
              </p>
              <p className="text-xs text-theme-muted">média geral</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <p className="text-sm font-bold text-theme truncate" title={stats.favorite_genre || 'N/A'}>
                {stats.favorite_genre || 'N/A'}
              </p>
              <p className="text-xs text-theme-muted">gênero favorito</p>
            </div>
          </div>

          {/* Top 3 músicas */}
          <div>
            <h3 className="text-sm font-semibold text-theme-muted mb-3 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Top 3 Músicas Favoritas
            </h3>
            <div className="space-y-2">
              {stats.top_songs.map((song, index) => (
                <div key={song.song_code} className="dashboard-row">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full text-white text-sm font-semibold ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                          : 'bg-gradient-to-br from-amber-600 to-orange-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-theme truncate">{song.song_title}</p>
                      <p className="text-xs text-theme-muted truncate">{song.artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-theme">{song.play_count}x</p>
                    <p className={`text-xs ${getTone(song.avg_score)}`}>
                      Média {song.avg_score.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
              {stats.top_songs.length === 0 && (
                <p className="text-center text-theme-muted py-4">
                  Nenhuma música registrada ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : !selectedPlayer ? (
        <div className="text-center py-8 text-theme-muted">
          <User className="w-10 h-10 mx-auto mb-2 opacity-70" />
          <p>Selecione um cantor para ver suas estatísticas</p>
        </div>
      ) : null}
    </div>
  );
}
