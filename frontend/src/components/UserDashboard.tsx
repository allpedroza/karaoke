import { useState } from 'react';
import {
  Mic2,
  CreditCard,
  History,
  Settings,
  Crown,
  Music,
  TrendingUp,
  Calendar,
  ChevronRight,
  RefreshCw,
  Star,
  Trophy,
} from 'lucide-react';
import { User, CreditTransaction } from '../types';

interface UserDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onNavigateToApp: () => void;
  onNavigateToPricing: () => void;
}

// Mock performance history
const mockHistory = [
  { id: '1', songTitle: 'Evidências', artist: 'Chitãozinho & Xororó', score: 87, date: '2024-03-10T15:30:00' },
  { id: '2', songTitle: 'Ai Se Eu Te Pego', artist: 'Michel Teló', score: 92, date: '2024-03-09T20:15:00' },
  { id: '3', songTitle: 'Lepo Lepo', artist: 'Psirico', score: 78, date: '2024-03-08T18:45:00' },
  { id: '4', songTitle: 'Trem Bala', artist: 'Ana Vilela', score: 95, date: '2024-03-07T21:00:00' },
  { id: '5', songTitle: 'Shallow', artist: 'Lady Gaga', score: 88, date: '2024-03-06T19:30:00' },
];

const mockTransactions: CreditTransaction[] = [
  { id: 't1', userId: '1', type: 'usage', amount: -1, description: 'Evidências - Chitãozinho & Xororó', createdAt: '2024-03-10T15:30:00' },
  { id: 't2', userId: '1', type: 'usage', amount: -1, description: 'Ai Se Eu Te Pego - Michel Teló', createdAt: '2024-03-09T20:15:00' },
  { id: 't3', userId: '1', type: 'purchase', amount: 50, description: 'Renovação - Plano Pessoal', createdAt: '2024-03-01T00:00:00' },
  { id: 't4', userId: '1', type: 'usage', amount: -1, description: 'Lepo Lepo - Psirico', createdAt: '2024-03-08T18:45:00' },
  { id: 't5', userId: '1', type: 'bonus', amount: 5, description: 'Bônus de boas-vindas', createdAt: '2024-02-15T10:00:00' },
];

type TabType = 'overview' | 'history' | 'credits' | 'settings';

export function UserDashboard({ currentUser, onLogout, onNavigateToApp, onNavigateToPricing }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const creditsPercentage = (currentUser.credits / currentUser.planCredits) * 100;
  const averageScore = mockHistory.reduce((acc, h) => acc + h.score, 0) / mockHistory.length;
  const bestScore = Math.max(...mockHistory.map(h => h.score));
  const totalSongs = mockHistory.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const planLabels = {
    free: 'Gratuito',
    personal: 'Pessoal',
    custom: 'Empresarial',
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'credits', label: 'Créditos', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-theme">Olá, {currentUser.name.split(' ')[0]}!</h1>
            <p className="text-theme-muted flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                currentUser.plan === 'personal'
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                  : currentUser.plan === 'custom'
                  ? 'bg-purple-500/20 text-purple-500'
                  : 'bg-gray-500/20 text-gray-500'
              }`}>
                {planLabels[currentUser.plan]}
              </span>
              Membro desde {formatDate(currentUser.createdAt)}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onNavigateToApp} className="btn-primary flex items-center gap-2">
              <Mic2 className="w-4 h-4" />
              Cantar Agora
            </button>
            <button onClick={onLogout} className="btn-secondary">
              Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-theme-secondary text-theme-muted hover:text-theme'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Credits Card - Prominent */}
            <div className="dashboard-card bg-gradient-to-r from-[var(--color-accent)]/20 to-transparent">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-theme-muted mb-1">Créditos Disponíveis</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-theme">{currentUser.credits}</span>
                    <span className="text-xl text-theme-muted">/ {currentUser.planCredits}</span>
                  </div>
                  <div className="w-full max-w-xs mt-4">
                    <div className="h-2 bg-theme-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                        style={{ width: `${creditsPercentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-theme-muted mt-2">
                      Renova em {new Date().getDate() > 15 ? 30 - new Date().getDate() + 1 : 1} dias
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onNavigateToApp}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Music className="w-4 h-4" />
                    Usar Crédito
                  </button>
                  {currentUser.plan === 'free' && (
                    <button
                      onClick={onNavigateToPricing}
                      className="btn-secondary flex items-center justify-center gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      Fazer Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="dashboard-card text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-theme-muted text-sm">Melhor Pontuação</p>
                <p className="text-3xl font-bold text-theme">{bestScore}</p>
              </div>
              <div className="dashboard-card text-center">
                <Star className="w-8 h-8 text-[var(--color-accent)] mx-auto mb-2" />
                <p className="text-theme-muted text-sm">Média de Pontuação</p>
                <p className="text-3xl font-bold text-theme">{averageScore.toFixed(0)}</p>
              </div>
              <div className="dashboard-card text-center">
                <Music className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-theme-muted text-sm">Músicas Cantadas</p>
                <p className="text-3xl font-bold text-theme">{totalSongs}</p>
              </div>
            </div>

            {/* Recent Performances */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-theme flex items-center gap-2">
                  <History className="w-5 h-5 text-[var(--color-accent)]" />
                  Performances Recentes
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-[var(--color-accent)] text-sm font-medium hover:underline flex items-center gap-1"
                >
                  Ver todas
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {mockHistory.slice(0, 3).map(item => (
                  <div key={item.id} className="dashboard-row">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                      <Mic2 className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-theme">{item.songTitle}</p>
                      <p className="text-sm text-theme-muted">{item.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
                      <p className="text-xs text-theme-muted">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade Banner (for free users) */}
            {currentUser.plan === 'free' && (
              <div className="dashboard-card bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Crown className="w-12 h-12" />
                    <div>
                      <h3 className="text-xl font-bold">Quer cantar mais?</h3>
                      <p className="text-white/80">
                        Faça upgrade para o plano Pessoal e tenha 50 músicas por mês!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToPricing}
                    className="bg-white text-[var(--color-accent)] px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors whitespace-nowrap"
                  >
                    Ver Planos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="dashboard-card">
              <h3 className="font-bold text-theme mb-4">Histórico de Performances</h3>
              <div className="space-y-3">
                {mockHistory.map(item => (
                  <div key={item.id} className="dashboard-row">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                      <Mic2 className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-theme">{item.songTitle}</p>
                      <p className="text-sm text-theme-muted">{item.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
                      <p className="text-xs text-theme-muted">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="dashboard-card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-theme-muted text-sm">Seu Plano Atual</p>
                  <h3 className="text-2xl font-bold text-theme flex items-center gap-2">
                    {planLabels[currentUser.plan]}
                    {currentUser.plan !== 'free' && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </h3>
                </div>
                {currentUser.plan !== 'custom' && (
                  <button
                    onClick={onNavigateToPricing}
                    className="btn-secondary text-sm"
                  >
                    {currentUser.plan === 'free' ? 'Fazer Upgrade' : 'Alterar Plano'}
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-theme-muted text-sm mb-2">Créditos Restantes</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-theme">{currentUser.credits}</span>
                    <span className="text-theme-muted">de {currentUser.planCredits}</span>
                  </div>
                  <div className="h-2 bg-theme-secondary rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-[var(--color-accent)] rounded-full"
                      style={{ width: `${creditsPercentage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-theme-muted text-sm mb-2">Próxima Renovação</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
                    <span className="text-theme font-medium">1 de Abril, 2024</span>
                  </div>
                  <p className="text-sm text-theme-muted mt-1">
                    Seus créditos serão renovados automaticamente
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="dashboard-card">
              <h3 className="font-bold text-theme mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[var(--color-accent)]" />
                Histórico de Créditos
              </h3>
              <div className="space-y-3">
                {mockTransactions.map(transaction => (
                  <div key={transaction.id} className="dashboard-row">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.amount > 0
                        ? 'bg-green-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {transaction.amount > 0 ? (
                        <CreditCard className="w-5 h-5 text-green-500" />
                      ) : (
                        <Music className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-theme">{transaction.description}</p>
                      <p className="text-sm text-theme-muted">
                        {transaction.type === 'usage' ? 'Música cantada' :
                         transaction.type === 'purchase' ? 'Compra' : 'Bônus'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                      <p className="text-xs text-theme-muted">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy More Credits (for paid users) */}
            {currentUser.plan !== 'free' && currentUser.credits < 10 && (
              <div className="dashboard-card border-2 border-dashed border-[var(--color-accent)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                  <div>
                    <h3 className="font-bold text-theme">Créditos acabando?</h3>
                    <p className="text-theme-muted">
                      Compre créditos extras para continuar cantando sem esperar a renovação.
                    </p>
                  </div>
                  <button className="btn-primary whitespace-nowrap">
                    Comprar Créditos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            {/* Profile Settings */}
            <div className="dashboard-card">
              <h3 className="font-bold text-theme mb-4">Informações Pessoais</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme mb-1">Nome</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="input-field"
                    disabled
                  />
                  <p className="text-xs text-theme-muted mt-1">O email não pode ser alterado</p>
                </div>
                <button className="btn-primary">Salvar Alterações</button>
              </div>
            </div>

            {/* Password */}
            <div className="dashboard-card">
              <h3 className="font-bold text-theme mb-4">Alterar Senha</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme mb-1">Senha atual</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme mb-1">Nova senha</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme mb-1">Confirmar nova senha</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <button className="btn-secondary">Alterar Senha</button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="dashboard-card border-red-500/30">
              <h3 className="font-bold text-red-500 mb-4">Zona de Perigo</h3>
              <p className="text-theme-muted mb-4">
                Ações irreversíveis para sua conta.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
                  Cancelar Assinatura
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Excluir Conta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
