import { useState } from 'react';
import { Header } from './components/Header';
import { VideoSearch } from './components/VideoSearch';
import { KaraokePlayer } from './components/KaraokePlayer';
import { ResultsView } from './components/ResultsView';
import { KaraokeVideo, AppState, PerformanceData } from './types';
import { evaluatePerformance } from './services/api';

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'home',
    selectedVideo: null,
    evaluation: null,
    isLoading: false,
    error: null,
  });

  const handleVideoSelect = (video: KaraokeVideo) => {
    setState(prev => ({
      ...prev,
      currentView: 'karaoke',
      selectedVideo: video,
      evaluation: null,
      error: null,
    }));
  };

  const handleFinishSinging = async (data: PerformanceData) => {
    if (!state.selectedVideo) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Usar o código da música e dados de pitch para avaliação
      const evaluation = await evaluatePerformance(
        data.transcription,
        state.selectedVideo.code,
        data.pitchStats
      );

      setState(prev => ({
        ...prev,
        currentView: 'results',
        evaluation,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error evaluating performance:', error);
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

  return (
    <div className="min-h-screen bg-theme transition-colors duration-300">
      <Header onHomeClick={handleGoHome} />

      <main className="container mx-auto px-4 py-8">
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

        {/* Home View */}
        {state.currentView === 'home' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <img src="/cantai_logo.png" alt="CantAI" className="h-32 mx-auto mb-4" />
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

            <VideoSearch onVideoSelect={handleVideoSelect} />
          </div>
        )}

        {/* Karaoke View */}
        {state.currentView === 'karaoke' && state.selectedVideo && (
          <KaraokePlayer
            video={state.selectedVideo}
            onFinish={handleFinishSinging}
            onBack={handleGoHome}
            isEvaluating={state.isLoading}
          />
        )}

        {/* Results View */}
        {state.currentView === 'results' && state.evaluation && state.selectedVideo && (
          <ResultsView
            evaluation={state.evaluation}
            video={state.selectedVideo}
            onTryAgain={handleTryAgain}
            onNewSong={handleGoHome}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-theme py-6 mt-12 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center text-theme-secondary text-sm">
          <p>CantAI - Karaokê com avaliação por IA generativa</p>
          <p className="mt-1">Powered by Claude AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
