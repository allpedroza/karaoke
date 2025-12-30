import { useState, useEffect, useRef, useCallback } from 'react';
import { Move, X, Search, Trash2, Smartphone } from 'lucide-react';
import { KaraokeVideo, QueueItem } from '../types';
import { searchVideos, getQueue, removeFromQueue, QueueItemAPI } from '../services/api';

interface SongQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: QueueItem[];
  currentSong: KaraokeVideo | null;
  onAddToQueue: (video: KaraokeVideo, singerName: string) => boolean;
  onRemoveFromQueue: (index: number) => void;
  maxQueueSize: number;
  isFullscreen?: boolean;
}

export function SongQueueDrawer({
  isOpen,
  onClose,
  queue,
  currentSong,
  onAddToQueue,
  onRemoveFromQueue,
  maxQueueSize,
  isFullscreen = false,
}: SongQueueDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<KaraokeVideo[]>([]);
  const [allSongs, setAllSongs] = useState<KaraokeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  // Estado para adicionar música (pede nome do cantor)
  const [selectedVideo, setSelectedVideo] = useState<KaraokeVideo | null>(null);
  const [singerName, setSingerName] = useState('');

  // Fila remota (adicionada pelo celular)
  const [remoteQueue, setRemoteQueue] = useState<QueueItemAPI[]>([]);

  // Estado para arrastar em fullscreen
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const drawerRef = useRef<HTMLDivElement>(null);

  // Carregar todas as músicas quando abre
  useEffect(() => {
    if (isOpen && allSongs.length === 0) {
      loadAllSongs();
    }
  }, [isOpen, allSongs.length]);

  // Carregar fila remota periodicamente
  useEffect(() => {
    if (!isOpen) return;

    const loadRemoteQueue = async () => {
      try {
        const response = await getQueue();
        setRemoteQueue(response.queue);
      } catch (error) {
        console.error('Erro ao carregar fila remota:', error);
      }
    };

    loadRemoteQueue();
    const interval = setInterval(loadRemoteQueue, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Remover item da fila remota
  const handleRemoveFromRemoteQueue = async (id: string) => {
    try {
      await removeFromQueue(id);
      setRemoteQueue(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erro ao remover da fila remota:', error);
    }
  };

  // Reset do formulário quando fecha
  useEffect(() => {
    if (!isOpen) {
      setSelectedVideo(null);
      setSingerName('');
      setSearchTerm('');
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

  // Quando clica para adicionar, abre input de nome
  const handleSelectToAdd = (video: KaraokeVideo) => {
    setSelectedVideo(video);
    setSingerName('');
  };

  // Confirmar adição com nome
  const handleConfirmAdd = () => {
    if (!selectedVideo || !singerName.trim()) return;

    const success = onAddToQueue(selectedVideo, singerName.trim());
    if (success) {
      setAddedMessage(`"${selectedVideo.title}" para ${singerName.trim()}`);
      setTimeout(() => setAddedMessage(null), 2000);
    }
    setSelectedVideo(null);
    setSingerName('');
  };

  // Cancelar seleção
  const handleCancelAdd = () => {
    setSelectedVideo(null);
    setSingerName('');
  };

  // Drag handlers para fullscreen
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isFullscreen) return;
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 350, clientX - dragOffset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 400, clientY - dragOffset.current.y)),
    });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  const isInQueue = (code: string) => queue.some(item => item.video.code === code);
  const isCurrentSong = (code: string) => currentSong?.code === code;

  if (!isOpen) return null;

  // Estilo do drawer baseado em fullscreen ou não
  const drawerStyle = isFullscreen
    ? {
        position: 'fixed' as const,
        left: position.x,
        top: position.y,
        width: '340px',
        maxHeight: '80vh',
        zIndex: 60,
      }
    : {};

  const drawerClassName = isFullscreen
    ? 'bg-gray-900/95 backdrop-blur-sm border border-purple-500/40 rounded-xl shadow-2xl flex flex-col'
    : 'fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-purple-500/30 z-50 flex flex-col shadow-2xl';

  return (
    <>
      {/* Backdrop (não bloqueia em fullscreen) */}
      {!isFullscreen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={drawerClassName}
        style={drawerStyle}
      >
        {/* Header (arrastável em fullscreen) */}
        <div
          className={`p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 ${
            isFullscreen ? 'rounded-t-xl cursor-grab active:cursor-grabbing' : ''
          }`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {isFullscreen && <Move className="w-4 h-4 text-purple-300" />}
              📋 Fila de Músicas
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-purple-300">
            {queue.length + remoteQueue.length} na fila
            {remoteQueue.length > 0 && (
              <span className="ml-1 text-green-400">
                ({remoteQueue.length} via celular)
              </span>
            )}
            {isFullscreen && <span className="ml-2 text-xs">(arraste para mover)</span>}
          </p>
        </div>

        {/* Modal para adicionar nome do cantor */}
        {selectedVideo && (
          <div className="p-4 bg-indigo-900/50 border-b border-purple-500/30">
            <p className="text-sm text-purple-200 mb-2">
              Quem vai cantar <strong className="text-white">{selectedVideo.title}</strong>?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={singerName}
                onChange={e => setSingerName(e.target.value)}
                placeholder="Nome do cantor"
                autoFocus
                maxLength={30}
                className="flex-1 px-3 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyDown={e => e.key === 'Enter' && handleConfirmAdd()}
              />
              <button
                onClick={handleConfirmAdd}
                disabled={!singerName.trim()}
                className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓
              </button>
              <button
                onClick={handleCancelAdd}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Remote Queue (from mobile) */}
        {remoteQueue.length > 0 && (
          <div className="p-3 border-b border-green-500/20 bg-green-900/20 max-h-48 overflow-y-auto">
            <h3 className="text-xs font-semibold text-green-300 mb-2 uppercase tracking-wide flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Fila do Celular:
            </h3>
            <div className="space-y-2">
              {remoteQueue.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-black/30 rounded-lg p-2"
                >
                  <span className="text-green-400 text-sm font-bold w-5">
                    {index + 1}.
                  </span>
                  <img
                    src={item.thumbnail}
                    alt={item.songTitle}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{item.songTitle}</p>
                    <p className="text-green-300 text-xs truncate">🎤 {item.singerName}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromRemoteQueue(item.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Remover da fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local Queue (added from desktop) */}
        {queue.length > 0 && (
          <div className="p-3 border-b border-purple-500/20 bg-purple-900/20 max-h-40 overflow-y-auto">
            <h3 className="text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wide">Fila Local:</h3>
            <div className="space-y-2">
              {queue.map((item, index) => (
                <div
                  key={`${item.video.code}-${item.singerName}-${index}`}
                  className="flex items-center gap-2 bg-black/30 rounded-lg p-2"
                >
                  <span className="text-purple-400 text-sm font-bold w-5">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{item.video.title}</p>
                    <p className="text-pink-300 text-xs truncate">🎤 {item.singerName}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFromQueue(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Remover da fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {addedMessage && (
          <div className="mx-3 mt-3 p-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 text-xs text-center">
            ✓ {addedMessage} adicionado!
          </div>
        )}

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Buscar música..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Song List */}
        <div className={`flex-1 overflow-y-auto p-3 pt-0 ${isFullscreen ? 'max-h-60' : ''}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-6 text-purple-300 text-sm">
              <p>Nenhuma música encontrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.slice(0, isFullscreen ? 10 : 50).map(video => {
                const inQueue = isInQueue(video.code);
                const isCurrent = isCurrentSong(video.code);
                const queueFull = queue.length >= maxQueueSize;

                return (
                  <div
                    key={video.code}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-all text-sm ${
                      isCurrent
                        ? 'bg-green-600/20 border border-green-500/30'
                        : inQueue
                        ? 'bg-purple-600/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate text-sm">{video.title}</p>
                      <p className="text-purple-300 text-xs truncate">{video.artist}</p>
                    </div>
                    {isCurrent ? (
                      <span className="text-green-400 text-xs px-2 py-1 bg-green-500/20 rounded">
                        🎤
                      </span>
                    ) : inQueue ? (
                      <span className="text-purple-400 text-xs px-2 py-1 bg-purple-500/20 rounded">
                        ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectToAdd(video)}
                        disabled={queueFull || selectedVideo !== null}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
