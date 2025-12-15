import { useState } from 'react';
import {
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  Search,
  Plus,
  RefreshCw,
  Download,
  Filter,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { User, Purchase, CreditTransaction } from '../types';

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

// Mock data for demonstration
const mockUsers: User[] = [
  { id: '1', name: 'Maria Santos', email: 'maria@email.com', role: 'user', credits: 45, plan: 'personal', planCredits: 50, createdAt: '2024-01-15' },
  { id: '2', name: 'João Pereira', email: 'joao@email.com', role: 'user', credits: 2, plan: 'free', planCredits: 2, createdAt: '2024-02-10' },
  { id: '3', name: 'Ana Costa', email: 'ana@email.com', role: 'user', credits: 38, plan: 'personal', planCredits: 50, createdAt: '2024-01-20' },
  { id: '4', name: 'Carlos Lima', email: 'carlos@email.com', role: 'user', credits: 0, plan: 'free', planCredits: 2, createdAt: '2024-03-01' },
  { id: '5', name: 'Paula Souza', email: 'paula@empresa.com', role: 'user', credits: 150, plan: 'custom', planCredits: 200, createdAt: '2024-01-05' },
];

const mockPurchases: Purchase[] = [
  { id: 'p1', userId: '1', userName: 'Maria Santos', userEmail: 'maria@email.com', plan: 'personal', amount: 29.90, credits: 50, status: 'completed', createdAt: '2024-03-10T14:30:00' },
  { id: 'p2', userId: '3', userName: 'Ana Costa', userEmail: 'ana@email.com', plan: 'personal', amount: 29.90, credits: 50, status: 'completed', createdAt: '2024-03-09T10:15:00' },
  { id: 'p3', userId: '5', userName: 'Paula Souza', userEmail: 'paula@empresa.com', plan: 'custom', amount: 299.00, credits: 200, status: 'completed', createdAt: '2024-03-08T09:00:00' },
  { id: 'p4', userId: '2', userName: 'João Pereira', userEmail: 'joao@email.com', plan: 'personal', amount: 29.90, credits: 50, status: 'pending', createdAt: '2024-03-07T16:45:00' },
];

const mockTransactions: CreditTransaction[] = [
  { id: 't1', userId: '1', type: 'usage', amount: -1, description: 'Música: Evidências - Chitãozinho & Xororó', createdAt: '2024-03-10T15:30:00' },
  { id: 't2', userId: '1', type: 'purchase', amount: 50, description: 'Plano Pessoal - Março 2024', createdAt: '2024-03-10T14:30:00' },
  { id: 't3', userId: '3', type: 'usage', amount: -1, description: 'Música: Ai Se Eu Te Pego - Michel Teló', createdAt: '2024-03-10T12:00:00' },
  { id: 't4', userId: '5', type: 'admin_grant', amount: 50, description: 'Bônus promocional', createdAt: '2024-03-09T10:00:00' },
  { id: 't5', userId: '2', type: 'usage', amount: -1, description: 'Música: Lepo Lepo - Psirico', createdAt: '2024-03-08T20:00:00' },
];

type TabType = 'overview' | 'users' | 'purchases' | 'credits';

export function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [showCreditModal, setShowCreditModal] = useState(false);

  // Stats
  const totalUsers = mockUsers.length;
  const totalRevenue = mockPurchases.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);
  const totalCreditsDistributed = mockPurchases.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.credits, 0);
  const activeSubscriptions = mockUsers.filter(u => u.plan !== 'free').length;

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCredits = () => {
    if (!selectedUser || !creditAmount) return;
    // In real app, this would call an API
    console.log(`Adding ${creditAmount} credits to user ${selectedUser.id}`);
    setShowCreditModal(false);
    setCreditAmount('');
    setSelectedUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'purchases', label: 'Compras', icon: CreditCard },
    { id: 'credits', label: 'Créditos', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-theme">Painel Administrativo</h1>
            <p className="text-theme-muted">
              Bem-vindo, {currentUser.name}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="ghost-button">
              <Download className="w-4 h-4" />
              Exportar
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total de Usuários', value: totalUsers, icon: Users, color: 'text-blue-500' },
                { label: 'Receita Total', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-green-500' },
                { label: 'Créditos Distribuídos', value: totalCreditsDistributed, icon: CreditCard, color: 'text-purple-500' },
                { label: 'Assinaturas Ativas', value: activeSubscriptions, icon: TrendingUp, color: 'text-orange-500' },
              ].map((stat, index) => (
                <div key={index} className="dashboard-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-theme-muted text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-theme mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-theme-secondary ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Purchases */}
              <div className="dashboard-card">
                <h3 className="font-bold text-theme mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[var(--color-accent)]" />
                  Compras Recentes
                </h3>
                <div className="space-y-3">
                  {mockPurchases.slice(0, 4).map(purchase => (
                    <div key={purchase.id} className="dashboard-row">
                      <div className="flex-1">
                        <p className="font-medium text-theme">{purchase.userName}</p>
                        <p className="text-sm text-theme-muted">
                          Plano {purchase.plan === 'personal' ? 'Pessoal' : purchase.plan === 'custom' ? 'Empresarial' : 'Gratuito'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[var(--color-accent)]">{formatCurrency(purchase.amount)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          purchase.status === 'completed'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {purchase.status === 'completed' ? 'Concluída' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="dashboard-card">
                <h3 className="font-bold text-theme mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[var(--color-accent)]" />
                  Transações de Créditos
                </h3>
                <div className="space-y-3">
                  {mockTransactions.slice(0, 4).map(transaction => (
                    <div key={transaction.id} className="dashboard-row">
                      <div className="flex-1">
                        <p className="font-medium text-theme">{transaction.description}</p>
                        <p className="text-sm text-theme-muted">
                          {transaction.type === 'usage' ? 'Uso' : transaction.type === 'purchase' ? 'Compra' : 'Bônus Admin'}
                        </p>
                      </div>
                      <p className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar usuários..."
                  className="input-field pl-10"
                />
              </div>
              <button className="ghost-button">
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
            </div>

            {/* Users Table */}
            <div className="dashboard-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Usuário</th>
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Plano</th>
                    <th className="text-center py-3 px-4 text-theme-muted font-medium">Créditos</th>
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Criado em</th>
                    <th className="text-right py-3 px-4 text-theme-muted font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-theme/50 last:border-0 hover:bg-theme-secondary/30">
                      <td className="py-3 px-4">
                        <p className="font-medium text-theme">{user.name}</p>
                        <p className="text-sm text-theme-muted">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.plan === 'personal'
                            ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                            : user.plan === 'custom'
                            ? 'bg-purple-500/20 text-purple-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {user.plan === 'personal' ? 'Pessoal' : user.plan === 'custom' ? 'Empresarial' : 'Gratuito'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-theme">{user.credits}</span>
                        <span className="text-theme-muted">/{user.planCredits}</span>
                      </td>
                      <td className="py-3 px-4 text-theme-muted">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowCreditModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-theme-secondary text-theme-muted hover:text-[var(--color-accent)]"
                            title="Gerenciar créditos"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-theme-secondary text-theme-muted hover:text-theme"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div className="dashboard-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Usuário</th>
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Plano</th>
                    <th className="text-right py-3 px-4 text-theme-muted font-medium">Valor</th>
                    <th className="text-center py-3 px-4 text-theme-muted font-medium">Créditos</th>
                    <th className="text-center py-3 px-4 text-theme-muted font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPurchases.map(purchase => (
                    <tr key={purchase.id} className="border-b border-theme/50 last:border-0 hover:bg-theme-secondary/30">
                      <td className="py-3 px-4 font-mono text-sm text-theme-muted">
                        {purchase.id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-theme">{purchase.userName}</p>
                        <p className="text-sm text-theme-muted">{purchase.userEmail}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.plan === 'personal'
                            ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                            : purchase.plan === 'custom'
                            ? 'bg-purple-500/20 text-purple-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {purchase.plan === 'personal' ? 'Pessoal' : purchase.plan === 'custom' ? 'Empresarial' : 'Gratuito'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-theme">
                        {formatCurrency(purchase.amount)}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-theme">
                        {purchase.credits}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.status === 'completed'
                            ? 'bg-green-500/20 text-green-500'
                            : purchase.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {purchase.status === 'completed' ? 'Concluída' : purchase.status === 'pending' ? 'Pendente' : 'Reembolsada'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-theme-muted">
                        {formatDate(purchase.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="dashboard-card">
                <p className="text-theme-muted text-sm">Total Distribuído (Mês)</p>
                <p className="text-2xl font-bold text-theme mt-1">{totalCreditsDistributed}</p>
                <p className="text-sm text-green-500 mt-2">+15% vs mês anterior</p>
              </div>
              <div className="dashboard-card">
                <p className="text-theme-muted text-sm">Total Utilizado (Mês)</p>
                <p className="text-2xl font-bold text-theme mt-1">
                  {Math.abs(mockTransactions.filter(t => t.type === 'usage').reduce((acc, t) => acc + t.amount, 0))}
                </p>
                <p className="text-sm text-blue-500 mt-2">Taxa de uso: 68%</p>
              </div>
              <div className="dashboard-card">
                <p className="text-theme-muted text-sm">Bônus Concedidos</p>
                <p className="text-2xl font-bold text-theme mt-1">
                  {mockTransactions.filter(t => t.type === 'admin_grant').reduce((acc, t) => acc + t.amount, 0)}
                </p>
                <p className="text-sm text-purple-500 mt-2">3 usuários beneficiados</p>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="dashboard-card overflow-x-auto">
              <h3 className="font-bold text-theme mb-4">Histórico de Transações</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Descrição</th>
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Tipo</th>
                    <th className="text-right py-3 px-4 text-theme-muted font-medium">Créditos</th>
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-theme/50 last:border-0 hover:bg-theme-secondary/30">
                      <td className="py-3 px-4">
                        <p className="text-theme">{transaction.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'usage'
                            ? 'bg-red-500/20 text-red-500'
                            : transaction.type === 'purchase'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-purple-500/20 text-purple-500'
                        }`}>
                          {transaction.type === 'usage' ? 'Uso' : transaction.type === 'purchase' ? 'Compra' : 'Bônus'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </td>
                      <td className="py-3 px-4 text-theme-muted">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Credit Modal */}
        {showCreditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="dashboard-card max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-theme">Gerenciar Créditos</h3>
                <button
                  onClick={() => {
                    setShowCreditModal(false);
                    setSelectedUser(null);
                    setCreditAmount('');
                  }}
                  className="text-theme-muted hover:text-theme"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-theme-muted mb-1">Usuário</p>
                <p className="font-bold text-theme">{selectedUser.name}</p>
                <p className="text-sm text-theme-muted">{selectedUser.email}</p>
                <p className="mt-2 text-sm">
                  Créditos atuais: <span className="font-bold text-theme">{selectedUser.credits}</span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-theme mb-2">
                  Quantidade de créditos
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="Ex: 10"
                  className="input-field"
                />
                <p className="text-xs text-theme-muted mt-1">
                  Use valores negativos para remover créditos
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreditModal(false);
                    setSelectedUser(null);
                    setCreditAmount('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCredits}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
