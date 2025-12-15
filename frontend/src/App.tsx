import { useState } from 'react';
import { Header } from './components/Header';
import { VideoSearch } from './components/VideoSearch';
import { KaraokePlayer } from './components/KaraokePlayer';
import { ResultsView } from './components/ResultsView';
import { PlayerNameModal } from './components/PlayerNameModal';
import { RankingsPanel } from './components/RankingsPanel';
import { TopSongsPanel } from './components/TopSongsPanel';
import { TopSingersPanel } from './components/TopSingersPanel';
import { LandingPage } from './components/LandingPage';
import { PricingPage } from './components/PricingPage';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { KaraokeVideo, AppState, PerformanceData, QueueItem, User } from './types';
import { evaluatePerformance, recordSession } from './services/api';
import { playDrumRoll, playScoreSound, stopAllSounds } from './services/soundEffects';

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'landing',
    selectedVideo: null,
    evaluation: null,
    isLoading: false,
    error: null,
  });
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingVideo, setPendingVideo] = useState<KaraokeVideo | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [songQueue, setSongQueue] = useState<QueueItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'personal' | 'custom' | null>(null);

  const MAX_QUEUE_SIZE = 5;

  // Navigation handlers
  const handleNavigateToLanding = () => {
    setState(prev => ({ ...prev, currentView: 'landing', error: null }));
  };

  const handleNavigateToPricing = () => {
    setState(prev => ({ ...prev, currentView: 'pricing', error: null }));
  };

  const handleNavigateToAuth = (plan?: 'free' | 'personal' | 'custom') => {
    setSelectedPlan(plan || null);
    setState(prev => ({ ...prev, currentView: 'auth', error: null }));
  };

  const handleNavigateToApp = () => {
    setState(prev => ({ ...prev, currentView: 'home', error: null }));
  };

  const handleNavigateToUserDashboard = () => {
    setState(prev => ({ ...prev, currentView: 'user-dashboard', error: null }));
  };

  const handleNavigateToAdminDashboard = () => {
    setState(prev => ({ ...prev, currentView: 'admin-dashboard', error: null }));
  };

  // Auth handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      handleNavigateToAdminDashboard();
    } else {
      handleNavigateToUserDashboard();
    }
  };

  const handleRegister = (user: User) => {
    setCurrentUser(user);
    handleNavigateToUserDashboard();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigateToLanding();
  };

  // Quando seleciona um vídeo, mostra o modal de nome primeiro
  const handleVideoSelect = (video: KaraokeVideo) => {
    setPendingVideo(video);
    setShowNameModal(true);
  };

  // Quando confirma o nome, vai para o karaokê
  const handleNameConfirm = (name: string) => {
    if (!pendingVideo) return;

    setPlayerName(name);
    setShowNameModal(false);
    setState(prev => ({
      ...prev,
      currentView: 'karaoke',
      selectedVideo: pendingVideo,
      evaluation: null,
      error: null,
    }));
    setPendingVideo(null);
  };

  // Quando cancela o modal de nome
  const handleNameCancel = () => {
    setShowNameModal(false);
    setPendingVideo(null);
  };

  // Adicionar música à fila (máximo 5) - agora com nome do cantor
  const handleAddToQueue = (video: KaraokeVideo, singerName: string) => {
    if (songQueue.length >= MAX_QUEUE_SIZE) {
      setState(prev => ({ ...prev, error: 'Fila cheia! Máximo de 5 músicas.' }));
      return false;
    }
    // Evitar mesma música para o mesmo cantor
    if (songQueue.some(item => item.video.code === video.code && item.singerName === singerName)) {
      setState(prev => ({ ...prev, error: 'Esta música já está na fila para este cantor!' }));
      return false;
    }
    setSongQueue(prev => [...prev, { video, singerName }]);
    return true;
  };

  // Remover música da fila por índice
  const handleRemoveFromQueue = (index: number) => {
    setSongQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Tocar próxima música da fila
  const handlePlayNextFromQueue = () => {
    if (songQueue.length === 0) {
      handleGoHome();
      return;
    }
    const nextItem = songQueue[0];
    setSongQueue(prev => prev.slice(1));
    setPlayerName(nextItem.singerName); // Define o nome do cantor da fila
    setState(prev => ({
      ...prev,
      currentView: 'karaoke',
      selectedVideo: nextItem.video,
      evaluation: null,
      error: null,
    }));
  };

  const handleFinishSinging = async (data: PerformanceData) => {
    if (!state.selectedVideo) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Tocar rufar de tambores enquanto avalia
    playDrumRoll(8000).catch(() => {}); // Drum roll longo, será interrompido quando resultado chegar

    try {
      // Usar o código da música e dados de pitch para avaliação
      const evaluation = await evaluatePerformance(
        data.transcription,
        state.selectedVideo.code,
        data.pitchStats
      );

      // Parar drum roll e tocar som baseado na nota
      stopAllSounds();

      setState(prev => ({
        ...prev,
        currentView: 'results',
        evaluation,
        isLoading: false,
      }));

      // Salvar sessão no banco de dados (em background, não bloquear UI)
      if (playerName) {
        recordSession(
          playerName,
          state.selectedVideo.code,
          state.selectedVideo.title,
          state.selectedVideo.artist,
          evaluation.overallScore
        ).catch(err => console.error('Erro ao salvar sessão:', err));
      }

      // Pequeno delay para a transição visual, depois toca o som da nota
      setTimeout(() => {
        playScoreSound(evaluation.overallScore).catch(() => {});
      }, 500);
    } catch (error) {
      console.error('Error evaluating performance:', error);
      stopAllSounds();
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao avaliar performance',
        isLoading: false,
      }));
    }
  };

  const handleTryAgain = () => {
    setState(prev => ({
      ...prev,
      currentView: 'karaoke',
      evaluation: null,
      error: null,
    }));
  };

  const handleGoHome = () => {
    setState({
      currentView: 'home',
      selectedVideo: null,
      evaluation: null,
      isLoading: false,
      error: null,
    });
  };

  // Handle header home click based on auth state
  const handleHeaderHomeClick = () => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        handleNavigateToAdminDashboard();
      } else {
        handleNavigateToUserDashboard();
      }
    } else {
      handleNavigateToLanding();
    }
  };

  // Check if should show simple header (no auth buttons)
  const showSimpleHeader = ['landing', 'pricing', 'auth'].includes(state.currentView);

  return (
    <div className="min-h-screen bg-theme transition-colors duration-300">
      <Header
        onHomeClick={handleHeaderHomeClick}
        showAuthButtons={!showSimpleHeader}
        currentUser={currentUser}
        onLoginClick={() => handleNavigateToAuth()}
        onDashboardClick={() => {
          if (currentUser?.role === 'admin') {
            handleNavigateToAdminDashboard();
          } else {
            handleNavigateToUserDashboard();
          }
        }}
        onLogout={handleLogout}
      />

      <main className={state.currentView === 'landing' ? '' : 'container mx-auto px-4 py-8'}>
        {/* Error Banner */}
        {state.error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4">
            <p className="text-red-400">{state.error}</p>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="text-sm text-red-300 underline mt-2"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Landing Page */}
        {state.currentView === 'landing' && (
          <LandingPage
            onNavigateToPricing={handleNavigateToPricing}
            onNavigateToAuth={() => handleNavigateToAuth()}
            onNavigateToApp={handleNavigateToApp}
          />
        )}

        {/* Pricing Page */}
        {state.currentView === 'pricing' && (
          <PricingPage
            onSelectPlan={(plan) => handleNavigateToAuth(plan)}
            onBack={handleNavigateToLanding}
          />
        )}

        {/* Auth Page */}
        {state.currentView === 'auth' && (
          <AuthPage
            selectedPlan={selectedPlan}
            onBack={selectedPlan ? handleNavigateToPricing : handleNavigateToLanding}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}

        {/* User Dashboard */}
        {state.currentView === 'user-dashboard' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigateToApp={handleNavigateToApp}
            onNavigateToPricing={handleNavigateToPricing}
          />
        )}

        {/* Admin Dashboard */}
        {state.currentView === 'admin-dashboard' && currentUser && (
          <AdminDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        {/* Home View (App) */}
        {state.currentView === 'home' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <img src="/cantai_logo.png" alt="CantAI" className="h-48 md:h-56 mx-auto mb-6" />
              <p className="text-theme-muted text-lg">
                Escolha uma música do catálogo, cante junto com o vídeo e receba uma avaliação
                personalizada da sua performance usando inteligência artificial.
              </p>
              <div className="flex justify-center gap-6 mt-6 text-sm text-theme-muted">
                <span className="flex items-center gap-2">🎵 <strong className="text-theme">Tom</strong></span>
                <span className="flex items-center gap-2">📝 <strong className="text-theme">Letra</strong></span>
                <span className="flex items-center gap-2">🔥 <strong className="text-theme">Energia</strong></span>
              </div>
            </div>

            {/* Layout com catálogo e rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Catálogo de músicas (2/3) */}
              <div className="lg:col-span-2">
                <VideoSearch onVideoSelect={handleVideoSelect} />
              </div>

              {/* Rankings (1/3) */}
              <div className="lg:col-span-1">
                <div className="flex flex-col gap-6">
                  <TopSongsPanel />
                  <RankingsPanel />
                  <TopSingersPanel />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Karaoke View */}
        {state.currentView === 'karaoke' && state.selectedVideo && (
          <KaraokePlayer
            video={state.selectedVideo}
            onFinish={handleFinishSinging}
            onBack={handleGoHome}
            isEvaluating={state.isLoading}
            queue={songQueue}
            onAddToQueue={handleAddToQueue}
            onRemoveFromQueue={handleRemoveFromQueue}
            maxQueueSize={MAX_QUEUE_SIZE}
          />
        )}

        {/* Results View */}
        {state.currentView === 'results' && state.evaluation && state.selectedVideo && (
          <ResultsView
            evaluation={state.evaluation}
            video={state.selectedVideo}
            onTryAgain={handleTryAgain}
            onNewSong={handleGoHome}
            queue={songQueue}
            onPlayNextFromQueue={handlePlayNextFromQueue}
          />
        )}
      </main>

      {/* Footer - hide on landing page */}
      {state.currentView !== 'landing' && (
        <footer className="border-t border-theme py-6 mt-12 transition-colors duration-300">
          <div className="container mx-auto px-4 text-center text-theme-secondary text-sm">
            <p>CantAI - Karaokê com avaliação por IA generativa</p>
            <p className="mt-1">Powered by Claude AI</p>
          </div>
        </footer>
      )}

      {/* Modal de nome do jogador */}
      {pendingVideo && (
        <PlayerNameModal
          isOpen={showNameModal}
          video={pendingVideo}
          onConfirm={handleNameConfirm}
          onCancel={handleNameCancel}
        />
      )}
    </div>
  );
}

export default App;
