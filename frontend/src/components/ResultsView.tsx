import { Star, Music2, FileText, Zap, RotateCcw, Home } from 'lucide-react';
import { PerformanceEvaluation, KaraokeVideo } from '../types';

interface ResultsViewProps {
  evaluation: PerformanceEvaluation;
  video: KaraokeVideo;
  onTryAgain: () => void;
  onNewSong: () => void;
}

export function ResultsView({ evaluation, video, onTryAgain, onNewSong }: ResultsViewProps) {
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
        <h2 className="text-2xl font-bold text-white mb-2">
          Resultado da Performance
        </h2>
        <p className="text-gray-400">
          {video.song} - {video.artist}
        </p>
      </div>

      {/* Score Principal */}
      <div className="card text-center py-8">
        <div className="score-reveal">
          <div className="text-6xl mb-4">{getScoreEmoji(evaluation.overallScore)}</div>
          <div className={`text-7xl font-bold ${getScoreColor(evaluation.overallScore)} mb-2`}>
            {evaluation.overallScore}
          </div>
          <div className="text-2xl text-gray-300 mb-4">
            {getScoreLabel(evaluation.overallScore)}
          </div>
          <div className="flex justify-center gap-1">
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
        </div>
      </div>

      {/* 3 Dimensões de Avaliação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DimensionCard
          icon={<Music2 className="w-6 h-6" />}
          title="Tom"
          score={evaluation.dimensions.pitch.score}
          detail={evaluation.dimensions.pitch.detail}
          color="text-purple-400"
          bgColor="bg-purple-500"
        />
        <DimensionCard
          icon={<FileText className="w-6 h-6" />}
          title="Letra"
          score={evaluation.dimensions.lyrics.score}
          detail={evaluation.dimensions.lyrics.detail}
          color="text-blue-400"
          bgColor="bg-blue-500"
        />
        <DimensionCard
          icon={<Zap className="w-6 h-6" />}
          title="Animação"
          score={evaluation.dimensions.energy.score}
          detail={evaluation.dimensions.energy.detail}
          color="text-orange-400"
          bgColor="bg-orange-500"
        />
      </div>

      {/* Mensagem de Encorajamento */}
      <div className="card animated-gradient text-center py-6">
        <p className="text-xl text-white font-medium">
          {evaluation.encouragement}
        </p>
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

interface DimensionCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  detail: string;
  color: string;
  bgColor: string;
}

function DimensionCard({ icon, title, score, detail, color, bgColor }: DimensionCardProps) {
  const getBarColor = (s: number): string => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-yellow-500';
    if (s >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className={color}>{icon}</div>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Pontuação</span>
          <span className={`font-bold ${color}`}>{score}/100</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(score)} transition-all duration-1000`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed">{detail}</p>
    </div>
  );
}
