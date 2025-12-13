import { useState } from 'react';
import { Search, Play, Clock, User } from 'lucide-react';
import { KaraokeVideo } from '../types';

interface VideoSearchProps {
  onVideoSelect: (video: KaraokeVideo) => void;
}

// Videos de karaokê populares para demonstração
const DEMO_VIDEOS: KaraokeVideo[] = [
  {
    id: 'pXRviuL6vMY',
    title: 'Evidências - Chitãozinho e Xororó (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/pXRviuL6vMY/mqdefault.jpg',
    duration: '4:32',
    artist: 'Chitãozinho e Xororó',
    song: 'Evidências',
  },
  {
    id: '1jQFdz0FClE',
    title: 'Anunciação - Alceu Valença (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/1jQFdz0FClE/mqdefault.jpg',
    duration: '4:18',
    artist: 'Alceu Valença',
    song: 'Anunciação',
  },
  {
    id: 'hbzGGrHLUxw',
    title: 'Let It Be - Beatles (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/hbzGGrHLUxw/mqdefault.jpg',
    duration: '4:03',
    artist: 'Beatles',
    song: 'Let It Be',
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody - Queen (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
    duration: '5:55',
    artist: 'Queen',
    song: 'Bohemian Rhapsody',
  },
  {
    id: 'YkgkThdzX-8',
    title: 'Shallow - Lady Gaga (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/YkgkThdzX-8/mqdefault.jpg',
    duration: '3:35',
    artist: 'Lady Gaga',
    song: 'Shallow',
  },
  {
    id: 'RBumgq5yVrA',
    title: 'Perfect - Ed Sheeran (Karaokê)',
    thumbnail: 'https://img.youtube.com/vi/RBumgq5yVrA/mqdefault.jpg',
    duration: '4:23',
    artist: 'Ed Sheeran',
    song: 'Perfect',
  },
];

export function VideoSearch({ onVideoSelect }: VideoSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<KaraokeVideo[]>(DEMO_VIDEOS);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setVideos(DEMO_VIDEOS);
      return;
    }

    setIsSearching(true);

    // Filter demo videos based on search query
    const filtered = DEMO_VIDEOS.filter(
      video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.song.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    setVideos(filtered.length > 0 ? filtered : DEMO_VIDEOS);
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar músicas de karaokê..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={isSearching}>
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onSelect={() => onVideoSelect(video)}
          />
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Nenhum vídeo encontrado</p>
          <p className="text-sm mt-2">Tente buscar por outro termo</p>
        </div>
      )}
    </div>
  );
}

interface VideoCardProps {
  video: KaraokeVideo;
  onSelect: () => void;
}

function VideoCard({ video, onSelect }: VideoCardProps) {
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
        <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {video.duration}
        </span>
      </div>

      <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-karaoke-accent transition-colors">
        {video.song}
      </h3>

      <p className="text-sm text-gray-400 flex items-center gap-2">
        <User className="w-4 h-4" />
        {video.artist}
      </p>
    </button>
  );
}

function Music(props: { className?: string }) {
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
