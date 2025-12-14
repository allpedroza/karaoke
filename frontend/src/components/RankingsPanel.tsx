import { useState, useEffect } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
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
    <div className="dashboard-card">
      <div className="flex items-start justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="dashboard-chip">
            <Trophy className="w-4 h-4" />
            Rankings
          </div>
          <h2 className="text-2xl font-bold text-theme mt-3">Clube dos campeões</h2>
          <p className="text-sm text-theme-muted mt-1">Veja quem brilhou no microfone</p>
        </div>
        <button
          onClick={loadRankings}
          className="ghost-button"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="flex gap-2 mb-5 relative z-10">
        <button
          onClick={() => setActiveTab('daily')}
          className={`tab-button ${activeTab === 'daily' ? 'tab-button--active' : ''}`}
        >
          📅 Hoje
        </button>
        <button
          onClick={() => setActiveTab('overall')}
          className={`tab-button ${activeTab === 'overall' ? 'tab-button--active' : ''}`}
        >
          🌟 Geral
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-karaoke-accent border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          <p>{error}</p>
          <button
            onClick={loadRankings}
            className="mt-2 text-sm text-theme underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : currentRanking.length === 0 ? (
        <div className="text-center py-8 text-theme-muted">
          <p className="text-3xl mb-2">🎤</p>
          <p>Nenhuma performance registrada ainda!</p>
          <p className="text-sm mt-1">Seja o primeiro a entrar no ranking!</p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {currentRanking.map((entry, index) => (
            <div
              key={`${entry.player_name}-${entry.created_at}`}
              className="dashboard-row"
              style={{
                background:
                  index === 0
                    ? 'linear-gradient(90deg, rgba(250,204,21,0.15), rgba(234,179,8,0.05))'
                    : index === 1
                    ? 'linear-gradient(90deg, rgba(148,163,184,0.18), rgba(148,163,184,0.06))'
                    : index === 2
                    ? 'linear-gradient(90deg, rgba(249,115,22,0.16), rgba(251,146,60,0.06))'
                    : undefined,
                borderColor:
                  index === 0
                    ? 'rgba(250,204,21,0.4)'
                    : index === 1
                    ? 'rgba(148,163,184,0.35)'
                    : index === 2
                    ? 'rgba(249,115,22,0.4)'
                    : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-xl font-semibold w-10 text-center text-theme">
                  {getMedalEmoji(index)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-theme truncate">{entry.player_name}</p>
                  <p className="text-sm text-theme-muted truncate">
                    {entry.song_title} - {entry.artist}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-bold text-lg ${getScoreColor(entry.score)}`}>
                  {entry.score}
                </p>
                <p className="text-xs text-theme-muted">{formatDate(entry.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-theme text-center relative z-10">
        <p className="text-xs text-theme-muted">
          {activeTab === 'daily'
            ? 'Ranking diário reinicia à meia-noite'
            : 'Melhores performances de todos os tempos'}
        </p>
      </div>
    </div>
  );
}
