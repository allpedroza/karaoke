import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'darkside';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Verificar localStorage ou preferência do sistema
    const saved = localStorage.getItem('cantai-theme') as Theme;
    if (saved && (saved === 'light' || saved === 'darkside')) {
      return saved;
    }
    // Padrão: darkside
    return 'darkside';
  });

  useEffect(() => {
    // Aplicar classe no documento
    document.documentElement.classList.remove('light', 'darkside');
    document.documentElement.classList.add(theme);
    localStorage.setItem('cantai-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'darkside' ? 'light' : 'darkside');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
