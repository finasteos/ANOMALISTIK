import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { COLOR_THEMES, ColorTheme } from './theme';

interface ThemeContextType {
  themeId: string;
  theme: ColorTheme;
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeId: 'IVORY_MONOCHROME',
  theme: COLOR_THEMES.IVORY_MONOCHROME,
  setThemeId: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('anomalistics_theme_id');
      if (stored && COLOR_THEMES[stored]) return stored;
    } catch { /* ignore (SSR/private mode) */ }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'IVORY_MONOCHROME';
    }
    return 'IVORY_MONOCHROME';
  });
  const setThemeId = (id: string) => {
    setThemeIdState(id);
    try { localStorage.setItem('anomalistics_theme_id', id); } catch { /* ignore */ }
  };
  const theme: ColorTheme = COLOR_THEMES[themeId] || COLOR_THEMES.IVORY_MONOCHROME;

  const value = useMemo(() => ({ themeId, theme, setThemeId }), [themeId, theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen ${theme.mainBg} transition-colors duration-300 font-sans`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
