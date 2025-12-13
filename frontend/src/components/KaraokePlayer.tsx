import { useEffect, useState } from 'react';
import { Mic, MicOff, Play, Pause, Square, RotateCcw, Send, Loader2 } from 'lucide-react';
import { KaraokeVideo } from '../types';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface KaraokePlayerProps {
  video: KaraokeVideo;
  onFinish: (transcription: string) => void;
  onBack: () => void;
  isEvaluating: boolean;
}

export function KaraokePlayer({ video, onFinish, onBack, isEvaluating }: KaraokePlayerProps) {
  const {
    isReady,
    isPlaying,
    loadVideo,
    play,
    pause,
    playerRef,
  } = useYouTubePlayer();

  const {
    isRecording,
    isPaused,
    transcription,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    error: recordingError,
  } = useAudioRecorder();

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isReady) {
      loadVideo(video.id);
    }
  }, [isReady, video.id, loadVideo]);

  const handleStart = async () => {
    await startRecording();
    play();
    setHasStarted(true);
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
  };

  const handleSubmit = () => {
    if (transcription.trim()) {
      onFinish(transcription);
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
          <h2 className="text-2xl font-bold text-white">{video.song}</h2>
          <p className="text-gray-400">{video.artist}</p>
        </div>
        <button onClick={onBack} className="btn-secondary text-sm">
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Indicador de gravação */}
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-white font-mono">{formatTime(duration)}</span>
              </div>
            )}

            {/* Visualização de áudio */}
            {isRecording && !isPaused && (
              <div className="flex items-end gap-1 h-8">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-karaoke-accent rounded soundwave-bar"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Botões de controle */}
          <div className="flex items-center gap-3">
            {!hasStarted ? (
              <button
                onClick={handleStart}
                disabled={!isReady}
                className="btn-primary flex items-center gap-2"
              >
                <Mic className="w-5 h-5" />
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
                      Parar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleReset}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Recomeçar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!transcription.trim() || isEvaluating}
                      className="btn-primary flex items-center gap-2"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Avaliando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Avaliar Performance
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Erro de gravação */}
        {recordingError && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
            <p className="text-red-400">{recordingError}</p>
          </div>
        )}

        {/* Transcrição em tempo real */}
        <div className="bg-karaoke-secondary rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            {isRecording ? (
              <Mic className="w-5 h-5 text-karaoke-accent" />
            ) : (
              <MicOff className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-sm text-gray-400">
              {isRecording ? 'Ouvindo sua voz...' : 'Transcrição da sua performance'}
            </span>
          </div>
          <div className="min-h-[100px] text-white">
            {transcription || (
              <span className="text-gray-500 italic">
                {hasStarted
                  ? 'Comece a cantar para ver a transcrição aqui...'
                  : 'Clique em "Começar a Cantar" para iniciar'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dicas */}
      <div className="card bg-karaoke-secondary/50">
        <h3 className="font-semibold text-white mb-2">Dicas para uma boa avaliação:</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Cante junto com a letra do vídeo</li>
          <li>• Mantenha o microfone próximo</li>
          <li>• Evite ruídos de fundo</li>
          <li>• Pronuncie as palavras claramente</li>
        </ul>
      </div>
    </div>
  );
}
