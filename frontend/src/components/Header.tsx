interface HeaderProps {
  onHomeClick: () => void;
}

export function Header({ onHomeClick }: HeaderProps) {
  return (
    <header className="bg-karaoke-card border-b border-gray-800 py-3 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={onHomeClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="CantAI"
            className="h-12 w-auto"
          />
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
