import { useState, useEffect, useRef } from 'react';
import { KaraokeVideo } from '../types';

interface PlayerNameModalProps {
  isOpen: boolean;
  video: KaraokeVideo;
  onConfirm: (playerName: string) => void;
  onCancel: () => void;
}

export function PlayerNameModal({ isOpen, video, onConfirm, onCancel }: PlayerNameModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focar no input quando modal abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Limpar nome quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      onConfirm(trimmedName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-gradient-to-br from-[rgba(0,39,118,0.85)] to-[rgba(0,155,58,0.85)] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎤</div>
          <h2 className="text-2xl font-bold text-white mb-2">Quem vai cantar?</h2>
          <p className="text-blue-50/90 text-sm">
            Digite seu nome para aparecer no ranking!
          </p>
        </div>

        {/* Song Info */}
        <div className="bg-black/30 rounded-lg p-4 mb-6 border border-white/10">
          <p className="text-emerald-100 text-xs uppercase tracking-wide mb-1">Música selecionada</p>
          <p className="text-white font-semibold">{video.title}</p>
          <p className="text-emerald-50/90 text-sm">{video.artist}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome ou apelido"
            maxLength={30}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-lg"
          />

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors border border-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] hover:brightness-110 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30"
            >
              Começar! 🎵
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
