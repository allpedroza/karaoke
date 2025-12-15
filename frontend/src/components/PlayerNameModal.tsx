import { useState, useEffect, useRef } from 'react';
import { KaraokeVideo } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface PlayerNameModalProps {
  isOpen: boolean;
  video: KaraokeVideo;
  onConfirm: (playerName: string) => void;
  onCancel: () => void;
}

export function PlayerNameModal({ isOpen, video, onConfirm, onCancel }: PlayerNameModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
        className={`rounded-2xl p-8 max-w-md w-full mx-4 transition-all duration-300 border shadow-2xl ${
          isLight
            ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-[0_22px_60px_rgba(15,23,42,0.14)]'
            : 'bg-gradient-to-br from-[rgba(0,39,118,0.85)] to-[rgba(0,155,58,0.85)] border-white/10'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎤</div>
          <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Quem vai cantar?</h2>
          <p className={`${isLight ? 'text-slate-600' : 'text-blue-50/90'} text-sm`}>
            Digite seu nome para aparecer no ranking!
          </p>
        </div>

        {/* Song Info */}
        <div
          className={`rounded-lg p-4 mb-6 border ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-black/30 border-white/10'
          }`}
        >
          <p className={`${isLight ? 'text-emerald-600' : 'text-emerald-100'} text-xs uppercase tracking-wide mb-1`}>
            Música selecionada
          </p>
          <p className={`${isLight ? 'text-slate-900' : 'text-white'} font-semibold`}>{video.title}</p>
          <p className={`${isLight ? 'text-slate-600' : 'text-emerald-50/90'} text-sm`}>{video.artist}</p>
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
            className={`w-full px-4 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors ${
              isLight
                ? 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 shadow-inner'
                : 'bg-white/10 border border-white/20 text-white placeholder-white/60'
            }`}
          />

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] hover:brightness-110 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                isLight ? 'shadow-emerald-300/40' : 'shadow-emerald-900/30'
              }`}
            >
              Começar! 🎵
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
