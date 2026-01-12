import { Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onHomeClick: () => void;
  onAddSong?: () => void;
}

export function Header({ onHomeClick, onAddSong }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-theme-card border-b border-theme py-3 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={onHomeClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/cantai_logo.png"
            alt="CantAI"
            className="h-12 w-auto"
          />
        </button>

        <nav className="flex items-center gap-4">
          <span className="text-sm text-theme-muted">
            Powered by Claude AI
          </span>

          {onAddSong && (
            <button
              onClick={onAddSong}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] hover:brightness-110 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg"
              title="Adicionar nova música"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Música</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-theme-secondary border border-theme hover:border-karaoke-accent transition-all duration-300"
            title={theme === 'darkside' ? 'Mudar para Light' : 'Mudar para Darkside'}
          >
            {theme === 'darkside' ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
