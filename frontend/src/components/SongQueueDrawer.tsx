import { useState, useEffect } from 'react';
import { KaraokeVideo } from '../types';
import { searchVideos } from '../services/api';

interface SongQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: KaraokeVideo[];
  currentSong: KaraokeVideo | null;
  onAddToQueue: (video: KaraokeVideo) => boolean;
  onRemoveFromQueue: (videoCode: string) => void;
  maxQueueSize: number;
}

export function SongQueueDrawer({
  isOpen,
  onClose,
  queue,
  currentSong,
  onAddToQueue,
  onRemoveFromQueue,
  maxQueueSize,
}: SongQueueDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<KaraokeVideo[]>([]);
  const [allSongs, setAllSongs] = useState<KaraokeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  // Carregar todas as músicas quando abre
  useEffect(() => {
    if (isOpen && allSongs.length === 0) {
      loadAllSongs();
    }
  }, [isOpen]);

  // Filtrar resultados quando digita
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = allSongs.filter(
        song =>
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.code.includes(searchTerm)
      );
      setSearchResults(filtered);
    } else {
      setSearchResults(allSongs);
    }
  }, [searchTerm, allSongs]);

  const loadAllSongs = async () => {
    setIsLoading(true);
    try {
      const videos = await searchVideos('');
      setAllSongs(videos);
      setSearchResults(videos);
    } catch (err) {
      console.error('Erro ao carregar músicas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (video: KaraokeVideo) => {
    const success = onAddToQueue(video);
    if (success) {
      setAddedMessage(`"${video.title}" adicionada à fila!`);
      setTimeout(() => setAddedMessage(null), 2000);
    }
  };

  const isInQueue = (code: string) => queue.some(v => v.code === code);
  const isCurrentSong = (code: string) => currentSong?.code === code;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-purple-500/30 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📋 Fila de Músicas
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-purple-300">
            {queue.length}/{maxQueueSize} na fila
          </p>
        </div>

        {/* Current Queue */}
        {queue.length > 0 && (
          <div className="p-4 border-b border-purple-500/20 bg-purple-900/20">
            <h3 className="text-sm font-semibold text-purple-300 mb-2">Na fila:</h3>
            <div className="space-y-2">
              {queue.map((video, index) => (
                <div
                  key={video.code}
                  className="flex items-center gap-2 bg-black/30 rounded-lg p-2"
                >
                  <span className="text-purple-400 text-sm font-bold w-5">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{video.title}</p>
                    <p className="text-purple-300 text-xs truncate">{video.artist}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFromQueue(video.code)}
                    className="text-red-400 hover:text-red-300 p-1 text-sm"
                    title="Remover da fila"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {addedMessage && (
          <div className="mx-4 mt-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 text-sm text-center">
            ✓ {addedMessage}
          </div>
        )}

        {/* Search */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Buscar música para adicionar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-4 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-purple-300">
              <p>Nenhuma música encontrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map(video => {
                const inQueue = isInQueue(video.code);
                const isCurrent = isCurrentSong(video.code);
                const disabled = inQueue || isCurrent || queue.length >= maxQueueSize;

                return (
                  <div
                    key={video.code}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-green-600/20 border border-green-500/30'
                        : inQueue
                        ? 'bg-purple-600/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{video.title}</p>
                      <p className="text-purple-300 text-sm truncate">{video.artist}</p>
                    </div>
                    {isCurrent ? (
                      <span className="text-green-400 text-xs px-2 py-1 bg-green-500/20 rounded">
                        🎤 Tocando
                      </span>
                    ) : inQueue ? (
                      <span className="text-purple-400 text-xs px-2 py-1 bg-purple-500/20 rounded">
                        Na fila
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAdd(video)}
                        disabled={disabled}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + Fila
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
