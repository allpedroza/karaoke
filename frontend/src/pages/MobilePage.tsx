/**
 * Página Mobile para Adicionar Músicas à Fila
 * Permite que usuários vejam o catálogo e adicionem músicas pelo celular
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Music, User, Check, Edit2, X, List, Clock, Trash2 } from 'lucide-react';
import { KaraokeVideo } from '../types';
import { getCatalog, searchVideos, getQueue, addToQueue, removeFromQueue, QueueItemAPI } from '../services/api';

const SINGER_NAME_KEY = 'karaoke_singer_name';

export function MobilePage() {
  const [singerName, setSingerName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<KaraokeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [queue, setQueue] = useState<QueueItemAPI[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [addingCode, setAddingCode] = useState<string | null>(null);

  // Carregar nome salvo
  useEffect(() => {
    const savedName = localStorage.getItem(SINGER_NAME_KEY);
    if (savedName) {
      setSingerName(savedName);
    } else {
      setIsEditingName(true);
    }
  }, []);

  // Carregar catálogo
  useEffect(() => {
    loadCatalog();
  }, []);

  // Carregar fila periodicamente
  const loadQueue = useCallback(async () => {
    try {
      const response = await getQueue();
      setQueue(response.queue);
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, [loadQueue]);

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

  const handleSaveName = () => {
    if (tempName.trim()) {
      setSingerName(tempName.trim());
      localStorage.setItem(SINGER_NAME_KEY, tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleEditName = () => {
    setTempName(singerName);
    setIsEditingName(true);
  };

  const handleAddToQueue = async (video: KaraokeVideo) => {
    if (!singerName) {
      setMessage({ text: 'Informe seu nome primeiro!', type: 'error' });
      setIsEditingName(true);
      return;
    }

    setAddingCode(video.code);
    try {
      const response = await addToQueue(video.code, singerName);
      setMessage({ text: response.message, type: 'success' });
      loadQueue();
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Erro ao adicionar',
        type: 'error'
      });
    } finally {
      setAddingCode(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRemoveFromQueue = async (id: string) => {
    try {
      await removeFromQueue(id);
      loadQueue();
      setMessage({ text: 'Removido da fila!', type: 'success' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Erro ao remover:', error);
    }
  };

  const isInQueue = (songCode: string) => {
    return queue.some(
      item => item.songCode === songCode && item.singerName.toLowerCase() === singerName.toLowerCase()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/30 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-white text-lg">CantAI</span>
          </div>

          {/* Botão da fila */}
          <button
            onClick={() => setShowQueue(!showQueue)}
            className="relative flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <List className="w-4 h-4" />
            Fila
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>
        </div>

        {/* Nome do cantor */}
        {isEditingName ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Seu nome..."
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-purple-500/50 focus:border-purple-400 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={!tempName.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
            {singerName && (
              <button
                onClick={() => setIsEditingName(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleEditName}
            className="flex items-center gap-2 w-full bg-gray-800/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-colors"
          >
            <User className="w-4 h-4 text-purple-400" />
            <span className="flex-1 text-left font-medium">{singerName}</span>
            <Edit2 className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </header>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`fixed top-24 left-4 right-4 z-50 p-4 rounded-lg text-center font-medium animate-fade-in ${
          message.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Painel da fila (desliza de cima) */}
      {showQueue && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setShowQueue(false)}>
          <div
            className="absolute top-0 left-0 right-0 max-h-[70vh] bg-gray-900 border-b border-purple-500/30 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-white font-bold flex items-center gap-2">
                <List className="w-5 h-5 text-purple-400" />
                Fila de Músicas ({queue.length})
              </h2>
              <button onClick={() => setShowQueue(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {queue.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>A fila está vazia</p>
                <p className="text-sm mt-1">Adicione músicas do catálogo!</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {queue.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-gray-800 rounded-lg p-3"
                  >
                    <span className="text-purple-400 font-bold text-lg w-6">{index + 1}</span>
                    <img
                      src={item.thumbnail}
                      alt={item.songTitle}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.songTitle}</p>
                      <p className="text-gray-400 text-sm truncate">{item.artist}</p>
                      <p className="text-purple-400 text-xs flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.singerName}
                      </p>
                    </div>
                    {item.singerName.toLowerCase() === singerName.toLowerCase() && (
                      <button
                        onClick={() => handleRemoveFromQueue(item.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="sticky top-[108px] z-30 bg-gray-900/95 backdrop-blur-sm px-4 py-3 border-b border-gray-800">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar música ou artista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSearching ? '...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Lista de músicas */}
      <main className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Nenhuma música encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video) => {
              const inQueue = isInQueue(video.code);
              const isAdding = addingCode === video.code;

              return (
                <div
                  key={video.code}
                  className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3 border border-gray-700/50"
                >
                  {/* Thumbnail */}
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <span className="absolute -top-1 -left-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                      #{video.code}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{video.song}</h3>
                    <p className="text-gray-400 text-sm truncate">{video.artist}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{video.genre}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </span>
                    </div>
                  </div>

                  {/* Botão adicionar */}
                  <button
                    onClick={() => handleAddToQueue(video)}
                    disabled={inQueue || isAdding}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                      inQueue
                        ? 'bg-green-600 text-white cursor-default'
                        : isAdding
                        ? 'bg-purple-600/50 text-white animate-pulse'
                        : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                    }`}
                  >
                    {inQueue ? (
                      <Check className="w-6 h-6" />
                    ) : isAdding ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer com instrução */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent py-6 px-4 pointer-events-none">
        <p className="text-center text-gray-500 text-sm">
          Escolha uma música e adicione à fila!
        </p>
      </footer>
    </div>
  );
}
