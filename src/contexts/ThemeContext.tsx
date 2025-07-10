import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from '../constants/themes';

export interface ThemeContextType {
  theme: typeof THEMES.light;
  themeName: string;
  setTheme: (themeName: string) => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(THEMES.light);
  const [themeName, setThemeName] = useState('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && THEMES[savedTheme as keyof typeof THEMES]) {
        setCurrentTheme(THEMES[savedTheme as keyof typeof THEMES]);
        setThemeName(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newThemeName: string) => {
    try {
      if (THEMES[newThemeName as keyof typeof THEMES]) {
        setCurrentTheme(THEMES[newThemeName as keyof typeof THEMES]);
        setThemeName(newThemeName);
        await AsyncStorage.setItem('selectedTheme', newThemeName);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const isDark = themeName === 'dark' || themeName === 'midnight';

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        themeName,
        setTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 