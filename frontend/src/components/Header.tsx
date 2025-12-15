import { Sun, Moon, LogIn, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { User as UserType } from '../types';

interface HeaderProps {
  onHomeClick: () => void;
  showAuthButtons?: boolean;
  currentUser?: UserType | null;
  onLoginClick?: () => void;
  onDashboardClick?: () => void;
  onLogout?: () => void;
}

export function Header({
  onHomeClick,
  showAuthButtons = false,
  currentUser,
  onLoginClick,
  onDashboardClick,
  onLogout,
}: HeaderProps) {
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
          <span className="text-sm text-theme-muted hidden sm:inline">
            Powered by Claude AI
          </span>

          {/* Auth buttons */}
          {showAuthButtons && (
            <>
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={onDashboardClick}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-secondary border border-theme hover:border-[var(--color-accent)] transition-all text-sm font-medium text-theme"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Painel</span>
                  </button>
                  <div className="flex items-center gap-2 text-sm text-theme-muted">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{currentUser.name.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-lg bg-theme-secondary border border-theme hover:border-red-500 hover:text-red-500 transition-all"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )}
            </>
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
