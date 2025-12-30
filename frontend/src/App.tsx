import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { VideoSearch } from './components/VideoSearch';
import { KaraokePlayer } from './components/KaraokePlayer';
import { ResultsView } from './components/ResultsView';
import { PlayerNameModal } from './components/PlayerNameModal';
import { RankingsPanel } from './components/RankingsPanel';
import { TopSongsPanel } from './components/TopSongsPanel';
import { TopSingersPanel } from './components/TopSingersPanel';
import { KaraokeVideo, AppState, PerformanceData, QueueItem } from './types';
import {
  evaluatePerformance,
  recordSession,
  getQueueStatus,
  updatePlaybackStatus,
  getNextFromQueue,
  QueueItemAPI,
} from './services/api';
import { startDrumRollLoop, playScoreSound, stopAllSounds } from './services/soundEffects';

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'home',
    selectedVideo: null,
    evaluation: null,
    isLoading: false,
    error: null,
  });
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingVideo, setPendingVideo] = useState<KaraokeVideo | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [songQueue, setSongQueue] = useState<QueueItem[]>([]);
  const [remoteQueueCount, setRemoteQueueCount] = useState(0);

  // Ref para controlar se está tocando (evita loops de polling)
  const isPlayingRef = useRef(false);
  const lastQueueVersionRef = useRef(0);

  const MAX_QUEUE_SIZE = 5;

  // Converter QueueItemAPI para KaraokeVideo
  const queueItemToVideo = useCallback((item: QueueItemAPI): KaraokeVideo => ({
    id: item.youtubeId, // YouTube video ID para o player
    code: item.songCode,
    title: item.songTitle,
    thumbnail: item.thumbnail,
    artist: item.artist,
    song: item.songTitle,
    language: 'pt-BR',
    genre: '',
    duration: '',
  }), []);

  // Iniciar reprodução de uma música da fila remota
  const playFromRemoteQueue = useCallback(async () => {
    try {
      const result = await getNextFromQueue();
      if (result) {
        const video = queueItemToVideo(result.item);
        setPlayerName(result.item.singerName);
        isPlayingRef.current = true;

        // Notificar backend que está tocando
        await updatePlaybackStatus(true, result.item);

        setState(prev => ({
          ...prev,
          currentView: 'karaoke',
          selectedVideo: video,
          evaluation: null,
          error: null,
        }));
      }
    } catch (error) {
      console.error('Erro ao iniciar música da fila:', error);
    }
  }, [queueItemToVideo]);

  // Polling da fila remota (home e karaoke views)
  useEffect(() => {
    if (state.currentView !== 'home' && state.currentView !== 'karaoke') return;

    const checkQueue = async () => {
      try {
        const status = await getQueueStatus();
        setRemoteQueueCount(status.count);

        // Se a fila mudou e tem itens, e não está tocando nada (apenas na home)
        if (status.version !== lastQueueVersionRef.current) {
          lastQueueVersionRef.current = status.version;

          // Se tem músicas na fila e nada está tocando, iniciar (apenas na home)
          if (state.currentView === 'home' && status.count > 0 && !status.playback.isPlaying && !isPlayingRef.current) {
            console.log('🎵 Nova música na fila - iniciando reprodução automática');
            playFromRemoteQueue();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar fila:', error);
      }
    };

    // Verificar imediatamente
    checkQueue();

    // Polling a cada 2 segundos
    const interval = setInterval(checkQueue, 2000);
    return () => clearInterval(interval);
  }, [state.currentView, playFromRemoteQueue]);

  // Atualizar status quando sair do karaoke
  useEffect(() => {
    if (state.currentView === 'home') {
      isPlayingRef.current = false;
      updatePlaybackStatus(false).catch(() => {});
    }
  }, [state.currentView]);

  // Quando seleciona um vídeo, mostra o modal de nome primeiro
  const handleVideoSelect = (video: KaraokeVideo) => {
    setPendingVideo(video);
    setShowNameModal(true);
  };

  // Quando confirma o nome, vai para o karaokê
  const handleNameConfirm = async (name: string) => {
    if (!pendingVideo) return;

    setPlayerName(name);
    setShowNameModal(false);
    isPlayingRef.current = true;

    // Notificar backend que está tocando
    const currentSong: QueueItemAPI = {
      id: `local-${Date.now()}`,
      songCode: pendingVideo.code,
      songTitle: pendingVideo.song,
      artist: pendingVideo.artist,
      thumbnail: pendingVideo.thumbnail,
      youtubeId: pendingVideo.id, // video.id é o YouTube ID
      singerName: name,
      addedAt: new Date().toISOString(),
    };
    await updatePlaybackStatus(true, currentSong);

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

  // Tocar próxima música da fila (local ou remota)
  const handlePlayNextFromQueue = async () => {
    // Primeiro, verificar fila local
    if (songQueue.length > 0) {
      const nextItem = songQueue[0];
      setSongQueue(prev => prev.slice(1));
      setPlayerName(nextItem.singerName);
      isPlayingRef.current = true;

      // Notificar backend
      const currentSong: QueueItemAPI = {
        id: `local-${Date.now()}`,
        songCode: nextItem.video.code,
        songTitle: nextItem.video.song,
        artist: nextItem.video.artist,
        thumbnail: nextItem.video.thumbnail,
        youtubeId: nextItem.video.id, // video.id é o YouTube ID
        singerName: nextItem.singerName,
        addedAt: new Date().toISOString(),
      };
      await updatePlaybackStatus(true, currentSong);

      setState(prev => ({
        ...prev,
        currentView: 'karaoke',
        selectedVideo: nextItem.video,
        evaluation: null,
        error: null,
      }));
      return;
    }

    // Se não tem fila local, verificar fila remota
    try {
      const result = await getNextFromQueue();
      if (result) {
        const video = queueItemToVideo(result.item);
        setPlayerName(result.item.singerName);
        isPlayingRef.current = true;

        await updatePlaybackStatus(true, result.item);

        setState(prev => ({
          ...prev,
          currentView: 'karaoke',
          selectedVideo: video,
          evaluation: null,
          error: null,
        }));
        return;
      }
    } catch {
      // Fila remota vazia
    }

    // Nenhuma música na fila
    handleGoHome();
  };

  const handleFinishSinging = async (data: PerformanceData) => {
    if (!state.selectedVideo) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Tocar rufar de tambores em loop enquanto avalia (para quando stopAllSounds é chamado)
    startDrumRollLoop().catch(() => {});

    try {
      // Usar o código da música e dados de pitch para avaliação
      const evaluation = await evaluatePerformance(
        data.transcription,
        state.selectedVideo.code,
        data.pitchStats,
        data.recordingDuration
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

  const handleGoHome = async () => {
    isPlayingRef.current = false;
    await updatePlaybackStatus(false);

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

              {/* Indicador de fila remota */}
              {remoteQueueCount > 0 && (
                <div className="mt-6 p-4 bg-theme-card border border-theme rounded-lg">
                  <p className="text-theme-muted">
                    <span className="font-bold text-theme" style={{ color: 'var(--color-accent)' }}>
                      {remoteQueueCount}
                    </span> música{remoteQueueCount > 1 ? 's' : ''} na fila aguardando...
                  </p>
                </div>
              )}
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
            remoteQueueCount={remoteQueueCount}
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

      {/* Footer */}
      <footer className="border-t border-theme py-6 mt-12 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center text-theme-secondary text-sm">
          <p>CantAI - Karaokê com avaliação por IA generativa</p>
          <p className="mt-1">Powered by Claude AI</p>
        </div>
      </footer>

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
