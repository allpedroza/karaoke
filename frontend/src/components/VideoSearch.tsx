import { useState, useEffect } from 'react';
import { Search, Play, User, Globe, Clock3, Tag } from 'lucide-react';
import { KaraokeVideo } from '../types';
import { getCatalog, searchVideos } from '../services/api';

interface VideoSearchProps {
  onVideoSelect: (video: KaraokeVideo) => void;
}

export function VideoSearch({ onVideoSelect }: VideoSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<KaraokeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar catálogo ao iniciar
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setIsLoading(true);
    try {
      const catalog = await getCatalog();
      setVideos(catalog);
    } catch (error) {
      console.error('Erro ao carregar catálogo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadCatalog();
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchVideos(searchQuery);
      setVideos(results);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'pt-BR': return '🇧🇷 PT';
      case 'en': return '🇺🇸 EN';
      case 'es': return '🇪🇸 ES';
      default: return lang;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-karaoke-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por música, artista ou código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={isSearching}>
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard
            key={video.code}
            video={video}
            onSelect={() => onVideoSelect(video)}
            languageLabel={getLanguageLabel(video.language)}
          />
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <MusicIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Nenhuma música encontrada</p>
          <p className="text-sm mt-2">Tente buscar por outro termo</p>
        </div>
      )}
    </div>
  );
}

interface VideoCardProps {
  video: KaraokeVideo;
  onSelect: () => void;
  languageLabel: string;
}

function VideoCard({ video, onSelect, languageLabel }: VideoCardProps) {
  return (
    <button
      onClick={onSelect}
      className="card group hover:border-karaoke-accent transition-all duration-300 text-left"
    >
      <div className="relative mb-4 rounded-lg overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-12 h-12 text-white" />
        </div>
        {/* Código da música */}
        <span
          className="absolute top-2 left-2 px-2 py-1 rounded text-xs text-white font-mono"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          #{video.code}
        </span>
        {/* Idioma */}
        <span className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {languageLabel}
        </span>
      </div>

      <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-karaoke-accent transition-colors">
        {video.song}
      </h3>

      <p className="text-sm text-gray-400 flex items-center gap-2">
        <User className="w-4 h-4" />
        {video.artist}
      </p>

      <div className="flex flex-wrap gap-2 mt-3 text-xs text-theme-secondary">
        <span className="flex items-center gap-1 bg-theme-secondary border border-theme px-2 py-1 rounded-full">
          <Tag className="w-3 h-3" />
          {video.genre}
        </span>
        <span className="flex items-center gap-1 bg-theme-secondary border border-theme px-2 py-1 rounded-full">
          <Clock3 className="w-3 h-3" />
          {video.duration}
        </span>
      </div>
    </button>
  );
}

function MusicIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
