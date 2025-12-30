import { useEffect, useState, useCallback, useRef } from 'react';
import { Mic, Play, Pause, Square, RotateCcw, Loader2, Send, Minimize2, Move, ListPlus, GripVertical } from 'lucide-react';
import { KaraokeVideo, PerformanceData, QueueItem } from '../types';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { SongQueueDrawer } from './SongQueueDrawer';
import { SingStarBar } from './SingStarBar';

interface KaraokePlayerProps {
  video: KaraokeVideo;
  onFinish: (data: PerformanceData) => void;
  onBack: () => void;
  isEvaluating: boolean;
  queue: QueueItem[];
  onAddToQueue: (video: KaraokeVideo, singerName: string) => boolean;
  onRemoveFromQueue: (index: number) => void;
  maxQueueSize: number;
  remoteQueueCount?: number;
}

export function KaraokePlayer({
  video,
  onFinish,
  onBack,
  isEvaluating,
  queue,
  onAddToQueue,
  onRemoveFromQueue,
  maxQueueSize,
  remoteQueueCount = 0,
}: KaraokePlayerProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  // Estado para barra de pitch arrastável e redimensionável
  const [pitchBarPosition, setPitchBarPosition] = useState({ x: 20, y: 20 });
  const [pitchBarHeight, setPitchBarHeight] = useState(240); // Dobro do tamanho original
  const [isDragging, setIsDragging] = useState(false);
  const [melodyOffset, setMelodyOffset] = useState(0); // Offset em segundos para sincronizar melodia
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    isRecording,
    isPaused,
    transcription,
    duration,
    pitchStats,
    currentNote,
    currentFrequency,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    error: recordingError,
  } = useAudioRecorder({ language: video.language });

  // Refs para evitar stale closures nos callbacks
  const transcriptionRef = useRef(transcription);
  const pitchStatsRef = useRef(pitchStats);
  const durationRef = useRef(duration);

  useEffect(() => {
    transcriptionRef.current = transcription;
  }, [transcription]);

  useEffect(() => {
    pitchStatsRef.current = pitchStats;
  }, [pitchStats]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Fullscreen handlers
  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  }, []);

  // Callback quando o vídeo termina
  const handleVideoEnded = useCallback(() => {
    if (hasStarted && isRecording && !autoSubmitted) {
      stopRecording();
      setAutoSubmitted(true);
      exitFullscreen();
      setTimeout(() => {
        onFinish({
          transcription: transcriptionRef.current || '',
          pitchStats: pitchStatsRef.current,
          recordingDuration: durationRef.current,
        });
      }, 800);
    }
  }, [hasStarted, isRecording, autoSubmitted, stopRecording, onFinish, exitFullscreen]);

  const {
    isReady,
    isEnded,
    currentTime: videoTime,
    loadVideo,
    play,
    pause,
    playerRef,
  } = useYouTubePlayer({ onVideoEnded: handleVideoEnded });

  useEffect(() => {
    if (isReady) {
      loadVideo(video.id);
    }
  }, [isReady, video.id, loadVideo]);

  // Auto-submit quando vídeo terminar
  useEffect(() => {
    if (isEnded && hasStarted && !isRecording && !autoSubmitted && !isEvaluating) {
      setAutoSubmitted(true);
      exitFullscreen();
      setTimeout(() => {
        onFinish({
          transcription: transcription || '',
          pitchStats,
          recordingDuration: duration,
        });
      }, 500);
    }
  }, [isEnded, hasStarted, isRecording, transcription, pitchStats, duration, autoSubmitted, isEvaluating, onFinish, exitFullscreen]);

  const enterFullscreen = async () => {
    if (containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.log('Fullscreen não suportado:', err);
      }
    }
  };

  // Listener para detectar saída do fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Drag handlers para barra de pitch
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragOffset.current = {
      x: clientX - pitchBarPosition.x,
      y: clientY - pitchBarPosition.y,
    };
  };

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPitchBarPosition({
      x: Math.max(0, clientX - dragOffset.current.x),
      y: Math.max(0, clientY - dragOffset.current.y),
    });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  const handleStart = async () => {
    await startRecording();
    await enterFullscreen();
    play();
    setHasStarted(true);
    setAutoSubmitted(false);
  };

  const handlePause = () => {
    if (isPaused) {
      resumeRecording();
      play();
    } else {
      pauseRecording();
      pause();
    }
  };

  const handleStop = () => {
    stopRecording();
    pause();
    exitFullscreen();
  };

  const handleReset = () => {
    resetRecording();
    setHasStarted(false);
    setAutoSubmitted(false);
  };

  const handleManualSubmit = () => {
    if (!isEvaluating && !autoSubmitted) {
      setAutoSubmitted(true);
      exitFullscreen();
      onFinish({
        transcription: transcription || '',
        pitchStats,
        recordingDuration: duration,
      });
    }
  };

  const hasDataToSubmit = transcription.trim() || (pitchStats && pitchStats.validSamples > 0);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-black flex flex-col'
    : 'max-w-5xl mx-auto space-y-6';

  return (
    <div className={wrapperClass}>
      {/* Header com info do vídeo */}
      {!isFullscreen && (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-karaoke-accent font-mono text-sm">#{video.code}</span>
            <h2 className="text-2xl font-bold text-theme">{video.song}</h2>
            <p className="text-theme-muted">{video.artist}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQueueDrawer(true)}
              className="btn-secondary text-sm flex items-center gap-2"
              disabled={isEvaluating}
            >
              <ListPlus className="w-4 h-4" />
              Fila ({queue.length + remoteQueueCount})
            </button>
            <button onClick={onBack} className="btn-secondary text-sm" disabled={isEvaluating}>
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Container do Player (suporta fullscreen) */}
      <div
        ref={containerRef}
        className={`relative ${isFullscreen ? 'bg-black flex-1 w-full h-full' : ''}`}
      >
        {/* Player do YouTube */}
        <div
          className={`card p-0 overflow-hidden ${
            isFullscreen ? '!rounded-none !border-0 !bg-black h-full' : ''
          }`}
        >
          <div className={`relative w-full ${isFullscreen ? 'h-full min-h-screen' : 'aspect-video'}`}>
            <div ref={playerRef} className="absolute inset-0 w-full h-full bg-black" />
          </div>

          {/* Overlay para bloquear cliques no YouTube quando não iniciado */}
          {!hasStarted && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-not-allowed">
              <div className="text-center text-white">
                <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Clique em "Começar a Cantar" para iniciar</p>
              </div>
            </div>
          )}
        </div>

        {/* Barra SingStar Flutuante (apenas em fullscreen e gravando) */}
        {isFullscreen && isRecording && !isPaused && (
          <div
            className="fixed z-50 bg-black/70 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/20 select-none"
            style={{
              left: pitchBarPosition.x,
              top: pitchBarPosition.y,
              minWidth: '700px',
              maxWidth: '1000px',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            {/* Handle de arrastar */}
            <div
              className="flex items-center gap-2 text-white/70 mb-3 cursor-grab active:cursor-grabbing"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <Move className="w-4 h-4" />
              <span className="text-xs">Mover</span>
              <span className="text-white/40 mx-1">|</span>
              <GripVertical className="w-4 h-4" />
              <span className="text-xs">Redimensionar na borda</span>
              {currentNote && (
                <span className="ml-auto text-lg font-bold text-karaoke-accent">{currentNote}</span>
              )}
            </div>

            {/* Barra SingStar com resize */}
            <SingStarBar
              songCode={video.code}
              currentTime={videoTime}
              userNote={currentNote}
              userFrequency={currentFrequency}
              isRecording={isRecording && !isPaused}
              height={pitchBarHeight}
              onHeightChange={setPitchBarHeight}
              syncOffset={melodyOffset}
              onSyncOffsetChange={setMelodyOffset}
            />
          </div>
        )}

        {/* Controles em Fullscreen */}
        {isFullscreen && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {/* Timer e status */}
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-white font-mono text-2xl">{formatTime(duration)}</span>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowQueueDrawer(true)}
                  className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors relative"
                  title="Adicionar à fila"
                >
                  <ListPlus className="w-6 h-6" />
                  {(queue.length + remoteQueueCount) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-xs flex items-center justify-center">
                      {queue.length + remoteQueueCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handlePause}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                </button>
                <button
                  onClick={handleStop}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <Square className="w-6 h-6" />
                </button>
                <button
                  onClick={exitFullscreen}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <Minimize2 className="w-6 h-6" />
                </button>
              </div>

              {/* Info da música */}
              <div className="text-right text-white">
                <p className="font-semibold">{video.song}</p>
                <p className="text-sm text-white/70">{video.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Drawer da fila em fullscreen (precisa estar dentro do containerRef) */}
        {isFullscreen && (
          <SongQueueDrawer
            isOpen={showQueueDrawer}
            onClose={() => setShowQueueDrawer(false)}
            queue={queue}
            currentSong={video}
            onAddToQueue={onAddToQueue}
            onRemoveFromQueue={onRemoveFromQueue}
            maxQueueSize={maxQueueSize}
            isFullscreen={true}
          />
        )}
      </div>

      {/* Barra SingStar fora do fullscreen */}
      {!isFullscreen && isRecording && !isPaused && (
        <div className="card py-4 bg-black/70 backdrop-blur-md">
          <SingStarBar
            songCode={video.code}
            currentTime={videoTime}
            userNote={currentNote}
            userFrequency={currentFrequency}
            isRecording={isRecording && !isPaused}
            height={pitchBarHeight}
            onHeightChange={setPitchBarHeight}
            syncOffset={melodyOffset}
            onSyncOffsetChange={setMelodyOffset}
          />
        </div>
      )}

      {/* Controles de Gravação (fora do fullscreen) */}
      {!isFullscreen && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isRecording && (
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-theme font-mono text-lg">{formatTime(duration)}</span>
                  {!isPaused && (
                    <div className="flex items-end gap-1 h-8 ml-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-karaoke-accent rounded soundwave-bar"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isRecording && hasStarted && !isEvaluating && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-green-400">
                    <span>Gravação finalizada ({formatTime(duration)})</span>
                  </div>
                  <div className="text-xs text-theme-muted">
                    {transcription.trim() ? `${transcription.split(' ').length} palavras` : ''}
                    {pitchStats && pitchStats.validSamples > 0 && `${transcription.trim() ? ' • ' : ''}${pitchStats.notesDetected.length} notas`}
                    {!transcription.trim() && (!pitchStats || pitchStats.validSamples === 0) && 'Pronto para avaliar'}
                  </div>
                </div>
              )}

              {isEvaluating && (
                <div className="flex items-center gap-3 text-karaoke-accent">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Avaliando sua performance...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!hasStarted ? (
                <button
                  onClick={handleStart}
                  disabled={!isReady || isEvaluating}
                  className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                >
                  <Mic className="w-6 h-6" />
                  Começar a Cantar
                </button>
              ) : (
                <>
                  {isRecording ? (
                    <>
                      <button onClick={handlePause} className="btn-secondary flex items-center gap-2">
                        {isPaused ? <><Play className="w-5 h-5" />Continuar</> : <><Pause className="w-5 h-5" />Pausar</>}
                      </button>
                      <button onClick={handleStop} className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700">
                        <Square className="w-5 h-5" />Finalizar
                      </button>
                    </>
                  ) : !isEvaluating && (
                    <>
                      <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                        <RotateCcw className="w-5 h-5" />Recomeçar
                      </button>
                      <button
                        onClick={handleManualSubmit}
                        disabled={autoSubmitted || !hasDataToSubmit}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                        {autoSubmitted ? 'Enviado!' : 'Avaliar Agora'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {recordingError && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mt-4">
              <p className="text-red-400">{recordingError}</p>
            </div>
          )}
        </div>
      )}

      {/* Dicas */}
      {!hasStarted && !isFullscreen && (
        <div className="card bg-theme-secondary">
          <h3 className="font-semibold text-theme mb-3">Dicas para uma boa avaliação:</h3>
          <ul className="text-sm text-theme-muted space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-karaoke-accent">•</span>
              O vídeo abrirá em tela cheia ao iniciar
            </li>
            <li className="flex items-center gap-2">
              <span className="text-karaoke-accent">•</span>
              Arraste a barra de afinação para não cobrir a letra
            </li>
            <li className="flex items-center gap-2">
              <span className="text-karaoke-accent">•</span>
              Cante junto com a letra do vídeo
            </li>
            <li className="flex items-center gap-2">
              <span className="text-karaoke-accent">•</span>
              A avaliação será enviada automaticamente ao fim
            </li>
          </ul>
        </div>
      )}

      {/* Drawer da fila de músicas (fora do fullscreen) */}
      {!isFullscreen && (
        <SongQueueDrawer
          isOpen={showQueueDrawer}
          onClose={() => setShowQueueDrawer(false)}
          queue={queue}
          currentSong={video}
          onAddToQueue={onAddToQueue}
          onRemoveFromQueue={onRemoveFromQueue}
          maxQueueSize={maxQueueSize}
          isFullscreen={false}
        />
      )}
    </div>
  );
}
