import { useEffect, useState, useCallback, useRef } from 'react';
import { Mic, Play, Pause, Square, RotateCcw, Loader2, Send } from 'lucide-react';
import { KaraokeVideo, PerformanceData } from '../types';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

// Notas musicais para visualização
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_COLORS: Record<string, string> = {
  'C': 'bg-red-500',
  'C#': 'bg-red-400',
  'D': 'bg-orange-500',
  'D#': 'bg-orange-400',
  'E': 'bg-yellow-500',
  'F': 'bg-green-500',
  'F#': 'bg-green-400',
  'G': 'bg-cyan-500',
  'G#': 'bg-cyan-400',
  'A': 'bg-blue-500',
  'A#': 'bg-blue-400',
  'B': 'bg-purple-500',
};

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
        // Enviar mesmo sem transcrição - pitch data é suficiente
        onFinish({
          transcription: transcriptionRef.current || '',
          pitchStats: pitchStatsRef.current,
        });
      }, 800);
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

  // Auto-submit quando vídeo terminar (backup caso handleVideoEnded não dispare)
  useEffect(() => {
    if (isEnded && hasStarted && !isRecording && !autoSubmitted && !isEvaluating) {
      setAutoSubmitted(true);
      // Pequeno delay para garantir processamento
      setTimeout(() => {
        onFinish({
          transcription: transcription || '',
          pitchStats,
        });
      }, 500);
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
    if (!isEvaluating && !autoSubmitted) {
      setAutoSubmitted(true);
      onFinish({
        transcription: transcription || '',
        pitchStats,
      });
    }
  };

  // Verificar se há dados para enviar (transcrição ou pitch)
  const hasDataToSubmit = transcription.trim() || (pitchStats && pitchStats.validSamples > 0);

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
          <h2 className="text-2xl font-bold text-theme">{video.song}</h2>
          <p className="text-theme-muted">{video.artist}</p>
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

      {/* Barra de Pitch - Visualização durante gravação */}
      {isRecording && !isPaused && (
        <div className="card py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-theme-muted">Sua afinação:</span>
            {currentNote && (
              <span className="text-lg font-bold text-karaoke-accent">{currentNote}</span>
            )}
          </div>
          <div className="flex gap-1 h-12 items-end">
            {NOTES.map((note) => {
              const isActive = currentNote?.startsWith(note) || currentNote?.startsWith(note.replace('#', '♯'));
              const baseNote = currentNote?.replace(/[0-9]/g, '') || '';
              const isCurrentNote = baseNote === note;

              return (
                <div
                  key={note}
                  className={`flex-1 rounded-t transition-all duration-100 ${
                    isCurrentNote
                      ? `${NOTE_COLORS[note]} h-full shadow-lg`
                      : isActive
                      ? `${NOTE_COLORS[note]} h-3/4 opacity-70`
                      : 'bg-gray-700 h-2'
                  }`}
                  title={note}
                >
                  <div className="text-center text-xs text-white/70 mt-1">
                    {note.length === 1 && <span className="hidden sm:inline">{note}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-theme-secondary mt-1">
            <span>Grave</span>
            <span>Agudo</span>
          </div>
        </div>
      )}

      {/* Controles de Gravação */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Indicador de gravação */}
            {isRecording && (
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-theme font-mono text-lg">{formatTime(duration)}</span>

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

        {/* Erro de gravação */}
        {recordingError && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mt-4">
            <p className="text-red-400">{recordingError}</p>
          </div>
        )}
      </div>

      {/* Dicas - mostrar apenas antes de começar */}
      {!hasStarted && (
        <div className="card bg-theme-secondary">
          <h3 className="font-semibold text-theme mb-3">Dicas para uma boa avaliação:</h3>
          <ul className="text-sm text-theme-muted space-y-2">
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
          <p className="text-theme-muted text-lg animate-pulse">
            🎤 Cante junto com o vídeo! A avaliação será feita ao final.
          </p>
        </div>
      )}
    </div>
  );
}
