import { Trophy, Star, TrendingUp, MessageCircle, Lightbulb, Heart, RotateCcw, Home } from 'lucide-react';
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

      {/* Categorias de Pontuação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CategoryCard
          icon={<MessageCircle className="w-6 h-6" />}
          title="Letra"
          score={evaluation.categories.lyrics.score}
          maxScore={evaluation.categories.lyrics.maxScore}
          feedback={evaluation.categories.lyrics.feedback}
        />
        <CategoryCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Ritmo"
          score={evaluation.categories.timing.score}
          maxScore={evaluation.categories.timing.maxScore}
          feedback={evaluation.categories.timing.feedback}
        />
        <CategoryCard
          icon={<Heart className="w-6 h-6" />}
          title="Expressão"
          score={evaluation.categories.expression.score}
          maxScore={evaluation.categories.expression.maxScore}
          feedback={evaluation.categories.expression.feedback}
        />
      </div>

      {/* Feedback Geral */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-karaoke-accent" />
          Avaliação da IA
        </h3>
        <p className="text-gray-300 leading-relaxed">{evaluation.feedback}</p>
      </div>

      {/* Destaques e Melhorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Destaques */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Destaques
          </h3>
          <ul className="space-y-2">
            {evaluation.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-300">
                <span className="text-green-400 mt-1">✓</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Sugestões de Melhoria */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary-400" />
            Dicas de Melhoria
          </h3>
          <ul className="space-y-2">
            {evaluation.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-300">
                <span className="text-primary-400 mt-1">→</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
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

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  maxScore: number;
  feedback: string;
}

function CategoryCard({ icon, title, score, maxScore, feedback }: CategoryCardProps) {
  const percentage = (score / maxScore) * 100;

  const getBarColor = (pct: number): string => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-yellow-500';
    if (pct >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-karaoke-accent">{icon}</div>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Pontuação</span>
          <span className="text-white font-bold">{score}/{maxScore}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(percentage)} transition-all duration-1000`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-400">{feedback}</p>
    </div>
  );
}
