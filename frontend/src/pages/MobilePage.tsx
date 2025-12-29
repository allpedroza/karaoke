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
    const interval = setInterval(loadQueue, 5000);
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
    <div className="min-h-screen bg-theme">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-theme-card border-b border-theme px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/cantai_logo.png" alt="CantAI" className="h-10 w-auto" />
          </div>

          {/* Botão da fila */}
          <button
            onClick={() => setShowQueue(!showQueue)}
            className="relative flex items-center gap-2 btn-primary py-2 px-4 text-sm"
          >
            <List className="w-4 h-4" />
            Fila
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {queue.length}
              </span>
            )}
          </button>
        </div>

        {/* Nome do cantor */}
        {isEditingName ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary" />
              <input
                type="text"
                placeholder="Seu nome..."
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={!tempName.trim()}
              className="btn-primary px-4 disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
            </button>
            {singerName && (
              <button
                onClick={() => setIsEditingName(false)}
                className="btn-secondary px-4"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleEditName}
            className="flex items-center gap-2 w-full bg-theme-secondary text-theme px-4 py-2 rounded-lg border border-theme hover:border-[var(--color-accent)] transition-colors"
          >
            <User className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="flex-1 text-left font-medium">{singerName}</span>
            <Edit2 className="w-4 h-4 text-theme-secondary" />
          </button>
        )}
      </header>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`fixed top-28 left-4 right-4 z-50 p-4 rounded-lg text-center font-medium shadow-lg ${
          message.type === 'success'
            ? 'bg-[var(--color-success)] text-white'
            : 'bg-[var(--color-error)] text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Painel da fila */}
      {showQueue && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setShowQueue(false)}>
          <div
            className="absolute top-0 left-0 right-0 max-h-[70vh] bg-theme-card border-b border-theme overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-theme-card px-4 py-3 border-b border-theme flex items-center justify-between">
              <h2 className="text-theme font-bold flex items-center gap-2">
                <List className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                Fila de Músicas ({queue.length})
              </h2>
              <button onClick={() => setShowQueue(false)} className="text-theme-muted hover:text-theme">
                <X className="w-6 h-6" />
              </button>
            </div>

            {queue.length === 0 ? (
              <div className="p-8 text-center text-theme-muted">
                <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>A fila está vazia</p>
                <p className="text-sm mt-1">Adicione músicas do catálogo!</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {queue.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 card p-3"
                  >
                    <span className="font-bold text-lg w-6" style={{ color: 'var(--color-accent)' }}>{index + 1}</span>
                    <img
                      src={item.thumbnail}
                      alt={item.songTitle}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-theme font-medium truncate">{item.songTitle}</p>
                      <p className="text-theme-muted text-sm truncate">{item.artist}</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
                        <User className="w-3 h-3" />
                        {item.singerName}
                      </p>
                    </div>
                    {item.singerName.toLowerCase() === singerName.toLowerCase() && (
                      <button
                        onClick={() => handleRemoveFromQueue(item.id)}
                        className="text-[var(--color-error)] hover:opacity-80 p-2"
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
      <div className="sticky top-[108px] z-30 bg-theme-card border-b border-theme px-4 py-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary" />
            <input
              type="text"
              placeholder="Buscar música ou artista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="btn-primary px-4 disabled:opacity-50"
          >
            {isSearching ? '...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Lista de músicas */}
      <main className="p-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-theme-muted">
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
                  className="flex items-center gap-3 card p-3"
                >
                  {/* Thumbnail */}
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <span
                      className="absolute -top-1 -left-1 text-white text-xs px-1.5 py-0.5 rounded font-mono"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                      #{video.code}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-theme font-medium truncate">{video.song}</h3>
                    <p className="text-theme-muted text-sm truncate">{video.artist}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-theme-secondary">
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
                        ? 'bg-[var(--color-success)] text-white cursor-default'
                        : isAdding
                        ? 'bg-[var(--color-accent)]/50 text-white animate-pulse'
                        : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white active:scale-95'
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

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--color-bg)] to-transparent py-4 px-4 pointer-events-none">
        <p className="text-center text-theme-secondary text-sm">
          Escolha uma música e adicione à fila!
        </p>
      </footer>
    </div>
  );
}
