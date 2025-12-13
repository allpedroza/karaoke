import { Mic, Music } from 'lucide-react';

interface HeaderProps {
  onHomeClick: () => void;
}

export function Header({ onHomeClick }: HeaderProps) {
  return (
    <header className="bg-karaoke-card border-b border-gray-800 py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={onHomeClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <Mic className="w-8 h-8 text-karaoke-accent" />
            <Music className="w-4 h-4 text-primary-400 absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Karaoke AI</h1>
            <p className="text-xs text-gray-400">Cante e seja avaliado</p>
          </div>
        </button>

        <nav className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Powered by Claude AI
          </span>
        </nav>
      </div>
    </header>
  );
}
