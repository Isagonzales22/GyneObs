import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [mode, setModeState] = useState(() => {
    return localStorage.getItem('gyneobs_theme') || 'auto';
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('gyneobs_theme');
    if (saved === 'dark') return 'dark';
    if (saved === 'light') return 'light';
    return getSystemTheme();
  });

  // Listen to system preference changes when mode is 'auto'
  useEffect(() => {
    if (mode === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      setTheme(getSystemTheme());
      return () => mq.removeEventListener('change', handler);
    }
  }, [mode]);

  // Apply/remove 'dark' class on <html> element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    localStorage.setItem('gyneobs_theme', newMode);
    if (newMode === 'dark') setTheme('dark');
    else if (newMode === 'light') setTheme('light');
    else setTheme(getSystemTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setMode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
