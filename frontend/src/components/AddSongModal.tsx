import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Music, X, Plus, AlertCircle } from 'lucide-react';

interface AddSongModalProps {
  isOpen: boolean;
  onConfirm: (songData: NewSongData) => void;
  onCancel: () => void;
  nextCode: string;
}

export interface NewSongData {
  youtubeId: string;
  title: string;
  artist: string;
  song: string;
  language: 'pt-BR' | 'en' | 'es';
  genre: string;
  duration: string;
}

export function AddSongModal({ isOpen, onConfirm, onCancel, nextCode }: AddSongModalProps) {
  const [formData, setFormData] = useState<NewSongData>({
    youtubeId: '',
    title: '',
    artist: '',
    song: '',
    language: 'pt-BR',
    genre: '',
    duration: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NewSongData, string>>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Focar no primeiro input quando modal abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Limpar formulário quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        youtubeId: '',
        title: '',
        artist: '',
        song: '',
        language: 'pt-BR',
        genre: '',
        duration: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  // Auto-gerar título completo quando artista ou música mudarem
  useEffect(() => {
    if (formData.artist && formData.song) {
      setFormData(prev => ({
        ...prev,
        title: `${formData.artist} - ${formData.song}`,
      }));
    }
  }, [formData.artist, formData.song]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewSongData, string>> = {};

    if (!formData.youtubeId.trim()) {
      newErrors.youtubeId = 'ID do YouTube é obrigatório';
    } else if (!/^[a-zA-Z0-9_-]{11}$/.test(formData.youtubeId.trim())) {
      newErrors.youtubeId = 'ID do YouTube inválido (deve ter 11 caracteres)';
    }

    if (!formData.artist.trim()) {
      newErrors.artist = 'Nome do artista é obrigatório';
    }

    if (!formData.song.trim()) {
      newErrors.song = 'Nome da música é obrigatório';
    }

    if (!formData.genre.trim()) {
      newErrors.genre = 'Gênero é obrigatório';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duração é obrigatória';
    } else if (!/^\d{1,2}:\d{2}$/.test(formData.duration.trim())) {
      newErrors.duration = 'Formato inválido (use MM:SS)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm(formData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleChange = (field: keyof NewSongData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`rounded-2xl p-4 sm:p-8 max-w-2xl w-full m-4 sm:my-8 transition-all duration-300 border shadow-2xl ${
          isLight
            ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-[0_22px_60px_rgba(15,23,42,0.14)]'
            : 'bg-gradient-to-br from-[rgba(0,39,118,0.85)] to-[rgba(0,155,58,0.85)] border-white/10'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isLight ? 'bg-emerald-100' : 'bg-white/10'}`}>
              <Plus className={`w-6 h-6 ${isLight ? 'text-emerald-600' : 'text-emerald-300'}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Adicionar Nova Música
              </h2>
              <p className={`${isLight ? 'text-slate-600' : 'text-blue-50/90'} text-sm mt-1`}>
                Expanda o portfólio de karaokê
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${
              isLight
                ? 'hover:bg-slate-100 text-slate-600'
                : 'hover:bg-white/10 text-white/80'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Display */}
        <div
          className={`rounded-lg p-4 mb-6 border flex items-center gap-3 ${
            isLight
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-emerald-900/20 border-emerald-500/30'
          }`}
        >
          <Music className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-300'}`} />
          <div>
            <p className={`${isLight ? 'text-emerald-700' : 'text-emerald-100'} text-xs uppercase tracking-wide`}>
              Código da música
            </p>
            <p className={`${isLight ? 'text-emerald-900' : 'text-white'} font-bold text-lg`}>{nextCode}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* YouTube ID */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>
              ID do YouTube <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={formData.youtubeId}
              onChange={e => handleChange('youtubeId', e.target.value)}
              placeholder="Ex: dQw4w9WgXcQ"
              maxLength={11}
              className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors ${
                isLight
                  ? 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 shadow-inner'
                  : 'bg-white/10 border border-white/20 text-white placeholder-white/60'
              } ${errors.youtubeId ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.youtubeId && (
              <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.youtubeId}
              </p>
            )}
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
              O ID aparece após "v=" na URL do YouTube
            </p>
          </div>

          {/* Artist & Song in Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Artist */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>
                Artista <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={e => handleChange('artist', e.target.value)}
                placeholder="Ex: Charlie Brown Jr."
                maxLength={100}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 shadow-inner'
                    : 'bg-white/10 border border-white/20 text-white placeholder-white/60'
                } ${errors.artist ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.artist && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.artist}
                </p>
              )}
            </div>

            {/* Song */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>
                Nome da Música <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.song}
                onChange={e => handleChange('song', e.target.value)}
                placeholder="Ex: Só os Loucos Sabem"
                maxLength={100}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 shadow-inner'
                    : 'bg-white/10 border border-white/20 text-white placeholder-white/60'
                } ${errors.song ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.song && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.song}
                </p>
              )}
            </div>
          </div>

          {/* Auto-generated Title */}
          {formData.title && (
            <div
              className={`rounded-lg p-3 border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-black/30 border-white/10 text-white/90'
              }`}
            >
              <p className={`text-xs mb-1 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                Título completo (gerado automaticamente):
              </p>
              <p className="font-medium">{formData.title}</p>
            </div>
          )}

          {/* Language, Genre, Duration */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Language */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>
                Idioma <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.language}
                onChange={e => handleChange('language', e.target.value as 'pt-BR' | 'en' | 'es')}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-200 text-slate-900 shadow-inner'
                    : 'bg-white/10 border border-white/20 text-white'
                }`}
              >
                <option value="pt-BR">🇧🇷 Português</option>
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
              </select>
            </div>

            {/* Genre */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>
                Gênero <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={e => handleChange('genre', e.target.value)}
                placeholder="Ex: Rock, MPB"
                maxLength={50}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 shadow-inner'
                    : 'bg-white/10 border border-white/20 text-white placeholder-white/60'
                } ${errors.genre ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.genre && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.genre}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>
                Duração <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={e => handleChange('duration', e.target.value)}
                placeholder="MM:SS"
                maxLength={5}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 shadow-inner'
                    : 'bg-white/10 border border-white/20 text-white placeholder-white/60'
                } ${errors.duration ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.duration && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.duration}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors border font-medium ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] hover:brightness-110 text-white font-semibold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                isLight ? 'shadow-emerald-300/40' : 'shadow-emerald-900/30'
              }`}
            >
              <Plus className="w-5 h-5" />
              Adicionar Música
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
