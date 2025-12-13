import { useState } from 'react';
import { Header } from './components/Header';
import { VideoSearch } from './components/VideoSearch';
import { KaraokePlayer } from './components/KaraokePlayer';
import { ResultsView } from './components/ResultsView';
import { KaraokeVideo, PerformanceEvaluation, AppState } from './types';
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

  const handleFinishSinging = async (transcription: string) => {
    if (!state.selectedVideo) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const evaluation = await evaluatePerformance(
        transcription,
        state.selectedVideo.song,
        state.selectedVideo.artist
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
    <div className="min-h-screen bg-karaoke-bg">
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
              <h2 className="text-4xl font-bold text-white mb-4">
                Bem-vindo ao <span className="text-karaoke-accent">Karaoke AI</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Escolha uma música, cante junto com o vídeo e receba uma avaliação
                personalizada da sua performance usando inteligência artificial.
              </p>
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
      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Karaoke AI - Avaliação de performance por IA generativa</p>
          <p className="mt-1">Powered by Claude AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
