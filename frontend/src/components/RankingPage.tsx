import { useState, useEffect } from 'react';
import {
  Trophy, Users, Flame, TrendingUp, Music, Award, RefreshCw, ArrowLeft, Clock, Star
} from 'lucide-react';
import {
  getTopSingersExtended,
  getEvolutionRanking,
  getHotStreakRanking,
  getGenreSpecialists,
  getAvailableGenres,
  getRankingByGenre,
  getRankingBySong,
  getDailyRanking,
  getOverallRanking,
  getTopSongs,
  TopSingerExtended,
  EvolutionEntry,
  HotStreakEntry,
  GenreSpecialist,
  GenreCount,
  GenreRankingEntry,
  SongRankingResponse,
  RankingEntry,
  TopSong,
} from '../services/api';

interface RankingPageProps {
  onBack: () => void;
}

type TabType = 'geral' | 'genero' | 'musica';

export function RankingPage({ onBack }: RankingPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [isLoading, setIsLoading] = useState(true);

  // Dados gerais
  const [topSingers, setTopSingers] = useState<TopSingerExtended[]>([]);
  const [evolution, setEvolution] = useState<EvolutionEntry[]>([]);
  const [hotStreaks, setHotStreaks] = useState<HotStreakEntry[]>([]);
  const [specialists, setSpecialists] = useState<GenreSpecialist[]>([]);
  const [dailyRanking, setDailyRanking] = useState<RankingEntry[]>([]);
  const [overallRanking, setOverallRanking] = useState<RankingEntry[]>([]);

  // Dados por gênero
  const [genres, setGenres] = useState<GenreCount[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [genreRanking, setGenreRanking] = useState<GenreRankingEntry[]>([]);

  // Dados por música
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
  const [selectedSong, setSelectedSong] = useState<string>('');
  const [songRanking, setSongRanking] = useState<SongRankingResponse | null>(null);

  // Carregar dados gerais
  useEffect(() => {
    loadGeneralData();
  }, []);

  // Carregar dados do gênero selecionado
  useEffect(() => {
    if (selectedGenre) {
      loadGenreRanking(selectedGenre);
    }
  }, [selectedGenre]);

  // Carregar dados da música selecionada
  useEffect(() => {
    if (selectedSong) {
      loadSongRanking(selectedSong);
    }
  }, [selectedSong]);

  const loadGeneralData = async () => {
    setIsLoading(true);
    try {
      const [singersData, evolutionData, streaksData, specialistsData, genresData, songsData, dailyData, overallData] = await Promise.all([
        getTopSingersExtended(10),
        getEvolutionRanking(10),
        getHotStreakRanking(10),
        getGenreSpecialists(),
        getAvailableGenres(),
        getTopSongs(),
        getDailyRanking(),
        getOverallRanking(),
      ]);

      setTopSingers(singersData);
      setEvolution(evolutionData);
      setHotStreaks(streaksData);
      setSpecialists(specialistsData);
      setGenres(genresData);
      setTopSongs(songsData);
      setDailyRanking(dailyData);
      setOverallRanking(overallData);

      // Selecionar primeiro gênero automaticamente
      if (genresData.length > 0 && !selectedGenre) {
        setSelectedGenre(genresData[0].genre);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGenreRanking = async (genre: string) => {
    try {
      const data = await getRankingByGenre(genre, 10);
      setGenreRanking(data);
    } catch (error) {
      console.error('Erro ao carregar ranking por gênero:', error);
    }
  };

  const loadSongRanking = async (songCode: string) => {
    try {
      const data = await getRankingBySong(songCode, 10);
      setSongRanking(data);
    } catch (error) {
      console.error('Erro ao carregar ranking por música:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-lime-300';
    if (score >= 55) return 'text-amber-300';
    return 'text-orange-400';
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement >= 10) return 'text-emerald-400';
    if (improvement >= 5) return 'text-lime-300';
    if (improvement >= 0) return 'text-amber-300';
    return 'text-red-400';
  };

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return '1';
      case 1: return '2';
      case 2: return '3';
      default: return `${position + 1}`;
    }
  };

  const getPositionStyle = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-fuchsia-500 to-purple-600';
    if (index === 1) return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    if (index === 2) return 'bg-gradient-to-br from-amber-500 to-orange-600';
    return 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-karaoke-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="ghost-button"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div>
            <h1 className="text-3xl font-bold text-theme">Hall da Fama</h1>
            <p className="text-theme-muted">Estatísticas completas dos cantores</p>
          </div>
        </div>
        <button
          onClick={loadGeneralData}
          className="ghost-button"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('geral')}
          className={`tab-button ${activeTab === 'geral' ? 'tab-button--active' : ''}`}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          Geral
        </button>
        <button
          onClick={() => setActiveTab('genero')}
          className={`tab-button ${activeTab === 'genero' ? 'tab-button--active' : ''}`}
        >
          <Music className="w-4 h-4 inline mr-2" />
          Por Gênero
        </button>
        <button
          onClick={() => setActiveTab('musica')}
          className={`tab-button ${activeTab === 'musica' ? 'tab-button--active' : ''}`}
        >
          <Star className="w-4 h-4 inline mr-2" />
          Por Música
        </button>
      </div>

      {/* Tab: Geral */}
      {activeTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liga dos Incansáveis (com tempo) */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="dashboard-chip">
                <Users className="w-4 h-4" />
                Top Cantores
              </div>
            </div>
            <h2 className="text-2xl font-bold text-theme mb-2">Liga dos Incansáveis</h2>
            <p className="text-sm text-theme-muted mb-4">Quem mais cantou + tempo no palco</p>

            <div className="space-y-3 relative z-10">
              {topSingers.length === 0 ? (
                <p className="text-center text-theme-muted py-4">Nenhum dado disponível</p>
              ) : (
                topSingers.map((singer, index) => (
                  <div key={singer.player_name} className="dashboard-row">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full text-white font-semibold ${getPositionStyle(index)}`}>
                        {getMedalEmoji(index)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-theme truncate">{singer.player_name}</p>
                        <p className="text-xs text-theme-muted">
                          {singer.sessions_count} músicas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-theme-muted">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm font-medium text-theme">{formatTime(singer.total_singing_time_seconds)}</span>
                      </div>
                      <p className={`text-xs font-semibold ${getScoreColor(singer.avg_score)}`}>
                        Média {singer.avg_score}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ranking Diário/Geral */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="dashboard-chip">
                <Trophy className="w-4 h-4" />
                Rankings
              </div>
            </div>
            <h2 className="text-2xl font-bold text-theme mb-2">Clube dos Campeões</h2>
            <p className="text-sm text-theme-muted mb-4">Melhores performances</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-theme-muted mb-2">Hoje</h3>
                <div className="space-y-2">
                  {dailyRanking.length === 0 ? (
                    <p className="text-xs text-theme-muted">Nenhuma performance hoje</p>
                  ) : (
                    dailyRanking.slice(0, 3).map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-lg">{['🥇', '🥈', '🥉'][index]}</span>
                        <span className="truncate text-theme">{entry.player_name}</span>
                        <span className={`ml-auto font-bold ${getScoreColor(entry.score)}`}>{entry.score}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-theme-muted mb-2">Geral</h3>
                <div className="space-y-2">
                  {overallRanking.slice(0, 3).map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{['🥇', '🥈', '🥉'][index]}</span>
                      <span className="truncate text-theme">{entry.player_name}</span>
                      <span className={`ml-auto font-bold ${getScoreColor(entry.score)}`}>{entry.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Evolução */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="dashboard-chip">
                <TrendingUp className="w-4 h-4" />
                Evolução
              </div>
            </div>
            <h2 className="text-2xl font-bold text-theme mb-2">Quem Mais Evoluiu</h2>
            <p className="text-sm text-theme-muted mb-4">Comparando últimas 5 vs primeiras 5 músicas</p>

            <div className="space-y-3 relative z-10">
              {evolution.length === 0 ? (
                <p className="text-center text-theme-muted py-4">Mínimo de 10 músicas para aparecer aqui</p>
              ) : (
                evolution.map((entry, index) => (
                  <div key={entry.player_name} className="dashboard-row">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full text-white font-semibold ${getPositionStyle(index)}`}>
                        {getMedalEmoji(index)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-theme truncate">{entry.player_name}</p>
                        <p className="text-xs text-theme-muted">
                          {entry.total_sessions} músicas cantadas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getImprovementColor(entry.improvement)}`}>
                        {entry.improvement > 0 ? '+' : ''}{entry.improvement}
                      </p>
                      <p className="text-xs text-theme-muted">
                        {entry.first_avg} → {entry.last_avg}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Hot Streak */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="dashboard-chip">
                <Flame className="w-4 h-4" />
                Hot Streak
              </div>
            </div>
            <h2 className="text-2xl font-bold text-theme mb-2">Sequência de Fogo</h2>
            <p className="text-sm text-theme-muted mb-4">Maior sequência de notas 80+</p>

            <div className="space-y-3 relative z-10">
              {hotStreaks.length === 0 ? (
                <p className="text-center text-theme-muted py-4">Nenhuma sequência encontrada</p>
              ) : (
                hotStreaks.map((entry, index) => (
                  <div key={entry.player_name} className="dashboard-row">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full text-white font-semibold ${getPositionStyle(index)}`}>
                        {getMedalEmoji(index)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-theme truncate">{entry.player_name}</p>
                        <p className="text-xs text-theme-muted">
                          Melhor nota: {entry.best_score_in_streak}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-400">
                        {entry.streak_count}x
                      </p>
                      <p className="text-xs text-theme-muted">
                        Média {entry.streak_avg}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Especialistas por Gênero */}
          <div className="dashboard-card lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="dashboard-chip">
                <Award className="w-4 h-4" />
                Especialistas
              </div>
            </div>
            <h2 className="text-2xl font-bold text-theme mb-2">Mestres dos Gêneros</h2>
            <p className="text-sm text-theme-muted mb-4">Melhor média por gênero (mínimo 3 músicas)</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
              {specialists.length === 0 ? (
                <p className="text-center text-theme-muted py-4 col-span-full">Nenhum especialista ainda</p>
              ) : (
                specialists.map((spec) => (
                  <div key={spec.genre} className="dashboard-row flex-col items-start">
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-karaoke-accent">{spec.genre}</span>
                      <span className={`font-bold ${getScoreColor(spec.avg_score)}`}>{spec.avg_score}</span>
                    </div>
                    <p className="font-semibold text-theme">{spec.player_name}</p>
                    <p className="text-xs text-theme-muted">{spec.title} · {spec.sessions_count} músicas</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Por Gênero */}
      {activeTab === 'genero' && (
        <div className="space-y-6">
          {/* Seletor de gênero */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-theme mb-4">Selecione um gênero</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g.genre}
                  onClick={() => setSelectedGenre(g.genre)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGenre === g.genre
                      ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white'
                      : 'bg-theme-secondary border border-theme text-theme hover:border-karaoke-accent'
                  }`}
                >
                  {g.genre} ({g.count})
                </button>
              ))}
            </div>
          </div>

          {/* Ranking do gênero selecionado */}
          {selectedGenre && (
            <div className="dashboard-card">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="dashboard-chip">
                  <Music className="w-4 h-4" />
                  {selectedGenre}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-theme mb-2">Top 10 - {selectedGenre}</h2>
              <p className="text-sm text-theme-muted mb-4">Melhores performances neste gênero</p>

              <div className="space-y-3 relative z-10">
                {genreRanking.length === 0 ? (
                  <p className="text-center text-theme-muted py-4">Nenhuma performance neste gênero</p>
                ) : (
                  genreRanking.map((entry, index) => (
                    <div key={`${entry.player_name}-${entry.created_at}`} className="dashboard-row">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-full text-white font-semibold ${getPositionStyle(index)}`}>
                          {getMedalEmoji(index)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-theme truncate">{entry.player_name}</p>
                          <p className="text-xs text-theme-muted truncate">
                            {entry.song_title} - {entry.artist}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(entry.score)}`}>
                          {entry.score}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Por Música */}
      {activeTab === 'musica' && (
        <div className="space-y-6">
          {/* Lista de músicas mais cantadas */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-theme mb-4">Selecione uma música</h3>
            <div className="space-y-2">
              {topSongs.map((song) => (
                <button
                  key={song.song_code}
                  onClick={() => setSelectedSong(song.song_code)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedSong === song.song_code
                      ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white'
                      : 'bg-theme-secondary border border-theme text-theme hover:border-karaoke-accent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{song.song_title}</p>
                      <p className={`text-sm ${selectedSong === song.song_code ? 'text-white/70' : 'text-theme-muted'}`}>
                        {song.artist}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{song.play_count}x cantada</p>
                      <p className={`text-xs ${selectedSong === song.song_code ? 'text-white/70' : 'text-theme-muted'}`}>
                        Média: {song.avg_score}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ranking da música selecionada */}
          {songRanking && songRanking.song && (
            <div className="dashboard-card">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="dashboard-chip">
                  <Star className="w-4 h-4" />
                  {songRanking.song.genre}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-theme mb-1">{songRanking.song.title}</h2>
              <p className="text-theme-muted mb-4">{songRanking.song.artist}</p>

              <div className="space-y-3 relative z-10">
                {songRanking.ranking.length === 0 ? (
                  <p className="text-center text-theme-muted py-4">Nenhuma performance registrada</p>
                ) : (
                  songRanking.ranking.map((entry, index) => (
                    <div key={`${entry.player_name}-${entry.created_at}`} className="dashboard-row">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-full text-white font-semibold ${getPositionStyle(index)}`}>
                          {getMedalEmoji(index)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-theme truncate">{entry.player_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(entry.score)}`}>
                          {entry.score}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
