import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  const [themeId, setThemeId] = useState<string>('IVORY_MONOCHROME');
  const theme = COLOR_THEMES[themeId] || COLOR_THEMES.IVORY_MONOCHROME;

  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId }}>
      <div className={`min-h-screen ${theme.mainBg} transition-colors duration-300 font-sans`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
