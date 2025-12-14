import { useState } from 'react';
import { Star, Music2, FileText, Zap, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { PerformanceEvaluation, KaraokeVideo } from '../types';

interface ResultsViewProps {
  evaluation: PerformanceEvaluation;
  video: KaraokeVideo;
  onTryAgain: () => void;
  onNewSong: () => void;
}

export function ResultsView({ evaluation, video, onTryAgain, onNewSong }: ResultsViewProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🌟';
    if (score >= 80) return '🎉';
    if (score >= 70) return '👏';
    if (score >= 60) return '👍';
    if (score >= 50) return '💪';
    return '🎤';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Extraordinário!';
    if (score >= 80) return 'Excelente!';
    if (score >= 70) return 'Muito Bom!';
    if (score >= 60) return 'Bom!';
    if (score >= 50) return 'Regular';
    return 'Continue Praticando';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-karaoke-accent font-mono mb-2">#{video.code}</p>
        <h2 className="text-2xl font-bold text-theme mb-2">
          Resultado da Performance
        </h2>
        <p className="text-theme-muted">
          {video.song} - {video.artist}
        </p>
      </div>

      {/* Score Principal + Mensagem de Encorajamento */}
      <div className="card text-center py-8">
        <div className="score-reveal">
          <div className="text-6xl mb-4">{getScoreEmoji(evaluation.overallScore)}</div>
          <div className={`text-7xl font-bold ${getScoreColor(evaluation.overallScore)} mb-2`}>
            {evaluation.overallScore}
          </div>
          <div className="text-2xl text-theme-muted mb-4">
            {getScoreLabel(evaluation.overallScore)}
          </div>
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-8 h-8 ${
                  i < Math.round(evaluation.overallScore / 20)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Mensagem de Encorajamento - Logo abaixo do score */}
          <div className="max-w-lg mx-auto px-4 py-4 rounded-xl bg-gradient-to-r from-karaoke-accent/20 to-purple-500/20 border border-karaoke-accent/30">
            <p className="text-lg text-theme font-medium">
              {evaluation.encouragement}
            </p>
          </div>
        </div>
      </div>

      {/* Resumo das Dimensões (Barras) */}
      <div className="card">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <ScoreBar
            icon={<Music2 className="w-5 h-5" />}
            label="Tom"
            score={evaluation.dimensions.pitch.score}
            color="purple"
          />
          <ScoreBar
            icon={<FileText className="w-5 h-5" />}
            label="Letra"
            score={evaluation.dimensions.lyrics.score}
            color="blue"
          />
          <ScoreBar
            icon={<Zap className="w-5 h-5" />}
            label="Energia"
            score={evaluation.dimensions.energy.score}
            color="orange"
          />
        </div>

        {/* Botão para expandir/colapsar detalhes */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-2 py-3 text-theme-muted hover:text-theme transition-colors border-t border-theme mt-4"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Ocultar detalhes
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Ver detalhes da avaliação
            </>
          )}
        </button>

        {/* Detalhes expandidos */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-theme space-y-4 animate-fadeIn">
            <DetailCard
              icon={<Music2 className="w-5 h-5" />}
              title="Tom"
              score={evaluation.dimensions.pitch.score}
              detail={evaluation.dimensions.pitch.detail}
              color="text-purple-400"
            />
            <DetailCard
              icon={<FileText className="w-5 h-5" />}
              title="Letra"
              score={evaluation.dimensions.lyrics.score}
              detail={evaluation.dimensions.lyrics.detail}
              color="text-blue-400"
            />
            <DetailCard
              icon={<Zap className="w-5 h-5" />}
              title="Energia"
              score={evaluation.dimensions.energy.score}
              detail={evaluation.dimensions.energy.detail}
              color="text-orange-400"
            />
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-center gap-4">
        <button onClick={onTryAgain} className="btn-secondary flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Tentar Novamente
        </button>
        <button onClick={onNewSong} className="btn-primary flex items-center gap-2">
          <Home className="w-5 h-5" />
          Escolher Outra Música
        </button>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  color: 'purple' | 'blue' | 'orange';
}

function ScoreBar({ icon, label, score, color }: ScoreBarProps) {
  const colorClasses = {
    purple: 'text-purple-400 bg-purple-500',
    blue: 'text-blue-400 bg-blue-500',
    orange: 'text-orange-400 bg-orange-500',
  };

  const getBarColor = (s: number): string => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-yellow-500';
    if (s >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-2 mb-2 ${colorClasses[color].split(' ')[0]}`}>
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold text-theme mb-2">{score}</div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(score)} transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface DetailCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  detail: string;
  color: string;
}

function DetailCard({ icon, title, score, detail, color }: DetailCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-theme-secondary">
      <div className={`${color} mt-1`}>{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-theme">{title}</h4>
          <span className={`font-bold ${color}`}>{score}/100</span>
        </div>
        <p className="text-sm text-theme-muted leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
