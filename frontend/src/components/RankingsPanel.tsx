import { useState, useEffect } from 'react';
import { getDailyRanking, getOverallRanking, RankingEntry } from '../services/api';

type RankingTab = 'daily' | 'overall';

export function RankingsPanel() {
  const [activeTab, setActiveTab] = useState<RankingTab>('daily');
  const [dailyRanking, setDailyRanking] = useState<RankingEntry[]>([]);
  const [overallRanking, setOverallRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [daily, overall] = await Promise.all([
        getDailyRanking(),
        getOverallRanking(),
      ]);
      setDailyRanking(daily);
      setOverallRanking(overall);
    } catch (err) {
      setError('Erro ao carregar rankings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentRanking = activeTab === 'daily' ? dailyRanking : overallRanking;

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${position + 1}º`;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🏆 Rankings
        </h2>
        <button
          onClick={loadRankings}
          className="text-purple-300 hover:text-white text-sm flex items-center gap-1 transition-colors"
          disabled={isLoading}
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'daily'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-purple-200 hover:bg-white/20'
          }`}
        >
          📅 Hoje
        </button>
        <button
          onClick={() => setActiveTab('overall')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'overall'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-purple-200 hover:bg-white/20'
          }`}
        >
          🌟 Geral
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          <p>{error}</p>
          <button
            onClick={loadRankings}
            className="mt-2 text-sm text-purple-300 hover:text-white underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : currentRanking.length === 0 ? (
        <div className="text-center py-8 text-purple-300">
          <p className="text-3xl mb-2">🎤</p>
          <p>Nenhuma performance registrada ainda!</p>
          <p className="text-sm mt-1 text-purple-400">
            Seja o primeiro a entrar no ranking!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentRanking.map((entry, index) => (
            <div
              key={`${entry.player_name}-${entry.created_at}`}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30'
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border border-gray-400/30'
                  : index === 2
                  ? 'bg-gradient-to-r from-orange-600/20 to-amber-700/20 border border-orange-600/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {/* Position */}
              <div className="text-2xl w-10 text-center">
                {getMedalEmoji(index)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {entry.player_name}
                </p>
                <p className="text-sm text-purple-300 truncate">
                  {entry.song_title} - {entry.artist}
                </p>
              </div>

              {/* Score & Time */}
              <div className="text-right">
                <p className={`font-bold text-lg ${getScoreColor(entry.score)}`}>
                  {entry.score}
                </p>
                <p className="text-xs text-purple-400">
                  {formatDate(entry.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-purple-500/20 text-center">
        <p className="text-xs text-purple-400">
          {activeTab === 'daily'
            ? 'Rankings resetam à meia-noite'
            : 'Melhores performances de todos os tempos'}
        </p>
      </div>
    </div>
  );
}
