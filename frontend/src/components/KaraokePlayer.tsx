import { useEffect, useState, useCallback, useRef } from 'react';
import { Mic, Play, Pause, Square, RotateCcw, Loader2 } from 'lucide-react';
import { KaraokeVideo, PerformanceData } from '../types';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface KaraokePlayerProps {
  video: KaraokeVideo;
  onFinish: (data: PerformanceData) => void;
  onBack: () => void;
  isEvaluating: boolean;
}

export function KaraokePlayer({ video, onFinish, onBack, isEvaluating }: KaraokePlayerProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const {
    isRecording,
    isPaused,
    transcription,
    duration,
    pitchStats,
    currentNote,
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

  useEffect(() => {
    transcriptionRef.current = transcription;
  }, [transcription]);

  useEffect(() => {
    pitchStatsRef.current = pitchStats;
  }, [pitchStats]);

  // Callback quando o vídeo termina
  const handleVideoEnded = useCallback(() => {
    if (hasStarted && isRecording && !autoSubmitted) {
      stopRecording();
      setAutoSubmitted(true);
      // Pequeno delay para garantir que a transcrição e pitch foram processados
      setTimeout(() => {
        if (transcriptionRef.current.trim()) {
          onFinish({
            transcription: transcriptionRef.current,
            pitchStats: pitchStatsRef.current,
          });
        }
      }, 500);
    }
  }, [hasStarted, isRecording, autoSubmitted, stopRecording, onFinish]);

  const {
    isReady,
    isEnded,
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

  // Auto-submit quando vídeo terminar e tiver transcrição
  useEffect(() => {
    if (isEnded && hasStarted && !isRecording && transcription.trim() && !autoSubmitted && !isEvaluating) {
      setAutoSubmitted(true);
      onFinish({
        transcription,
        pitchStats,
      });
    }
  }, [isEnded, hasStarted, isRecording, transcription, pitchStats, autoSubmitted, isEvaluating, onFinish]);

  const handleStart = async () => {
    await startRecording();
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
  };

  const handleReset = () => {
    resetRecording();
    setHasStarted(false);
    setAutoSubmitted(false);
  };

  const handleManualSubmit = () => {
    if (transcription.trim() && !isEvaluating) {
      onFinish({
        transcription,
        pitchStats,
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header com info do vídeo */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-karaoke-accent font-mono text-sm">#{video.code}</span>
          <h2 className="text-2xl font-bold text-white">{video.song}</h2>
          <p className="text-gray-400">{video.artist}</p>
        </div>
        <button onClick={onBack} className="btn-secondary text-sm" disabled={isEvaluating}>
          Voltar
        </button>
      </div>

      {/* Player do YouTube */}
      <div className="card p-0 overflow-hidden">
        <div
          ref={playerRef}
          className="w-full aspect-video bg-black"
        />
      </div>

      {/* Controles de Gravação */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Indicador de gravação */}
            {isRecording && (
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-white font-mono text-lg">{formatTime(duration)}</span>

                {/* Nota atual sendo cantada */}
                {!isPaused && currentNote && (
                  <div className="flex items-center gap-2 ml-3 px-3 py-1 bg-karaoke-accent/20 rounded-lg border border-karaoke-accent/50">
                    <span className="text-karaoke-accent font-bold text-xl">{currentNote}</span>
                  </div>
                )}

                {/* Visualização de áudio */}
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

            {/* Status quando terminou */}
            {!isRecording && hasStarted && !isEvaluating && (
              <div className="flex items-center gap-2 text-green-400">
                <span>Gravação finalizada</span>
              </div>
            )}

            {/* Avaliando */}
            {isEvaluating && (
              <div className="flex items-center gap-3 text-karaoke-accent">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Avaliando sua performance...</span>
              </div>
            )}
          </div>

          {/* Botões de controle */}
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
                    <button
                      onClick={handlePause}
                      className="btn-secondary flex items-center gap-2"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-5 h-5" />
                          Continuar
                        </>
                      ) : (
                        <>
                          <Pause className="w-5 h-5" />
                          Pausar
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleStop}
                      className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <Square className="w-5 h-5" />
                      Finalizar
                    </button>
                  </>
                ) : !isEvaluating && (
                  <>
                    <button
                      onClick={handleReset}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Recomeçar
                    </button>
                    {transcription.trim() && (
                      <button
                        onClick={handleManualSubmit}
                        className="btn-primary flex items-center gap-2"
                      >
                        Avaliar Agora
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Erro de gravação */}
        {recordingError && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mt-4">
            <p className="text-red-400">{recordingError}</p>
          </div>
        )}
      </div>

      {/* Dicas - mostrar apenas antes de começar */}
      {!hasStarted && (
        <div className="card bg-karaoke-secondary/50">
          <h3 className="font-semibold text-white mb-3">Dicas para uma boa avaliação:</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-karaoke-accent">•</span>
              Cante junto com a letra do vídeo
            </li>
            <li className="flex items-center gap-2">
              <span className="text-karaoke-accent">•</span>
              Mantenha o microfone próximo
            </li>
            <li className="flex items-center gap-2">
              <span className="text-karaoke-accent">•</span>
              Evite ruídos de fundo
            </li>
            <li className="flex items-center gap-2">
              <span className="text-karaoke-accent">•</span>
              A avaliação será enviada automaticamente ao fim da música
            </li>
          </ul>
        </div>
      )}

      {/* Mensagem durante gravação */}
      {isRecording && !isPaused && (
        <div className="text-center py-4">
          <p className="text-gray-400 text-lg animate-pulse">
            🎤 Cante junto com o vídeo! A avaliação será feita ao final.
          </p>
        </div>
      )}
    </div>
  );
}
