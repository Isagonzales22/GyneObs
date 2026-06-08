import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@gyneobs_theme';

// ─── Color Palettes ──────────────────────────────────────────────────────────

const lightColors = {
  // Backgrounds
  background: '#fdf6fb',
  backgroundSecondary: '#f0f4f8',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  card: '#ffffff',

  // Text
  text: '#1a1a2e',
  textSecondary: '#555566',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',

  // Borders
  border: '#e9ecef',
  borderLight: '#f0f0f0',

  // Navigation
  tabBar: '#ffffff',
  tabBorder: '#f0f0f0',
  header: '#ffffff',
  headerBorder: '#f0f0f0',

  // Inputs
  inputBg: '#f8f9fa',
  inputBorder: '#e9ecef',
  placeholder: '#bbbbbb',

  // Brand
  primary: '#FF69B4',
  primaryDark: '#FF1493',
  secondary: '#00BFFF',
  success: '#28c76f',
  danger: '#FF4757',

  // Overlays
  overlay: 'rgba(0,0,0,0.55)',
  shimmer: 'rgba(255,255,255,0.8)',

  // Status bar
  statusBarStyle: 'dark',
};

const darkColors = {
  // Backgrounds
  background: '#0d0f1a',
  backgroundSecondary: '#161929',
  surface: '#1a1d2e',
  surfaceElevated: '#1e2235',
  card: '#1a1d2e',

  // Text
  text: '#e2e8f0',
  textSecondary: '#a0aec0',
  textMuted: '#64748b',
  textInverse: '#ffffff',

  // Borders
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.06)',

  // Navigation
  tabBar: '#1a1d2e',
  tabBorder: 'rgba(255,255,255,0.08)',
  header: '#1a1d2e',
  headerBorder: 'rgba(255,255,255,0.08)',

  // Inputs
  inputBg: '#1e2235',
  inputBorder: 'rgba(255,255,255,0.1)',
  placeholder: '#4a5568',

  // Brand (same as light)
  primary: '#FF69B4',
  primaryDark: '#FF1493',
  secondary: '#00BFFF',
  success: '#28c76f',
  danger: '#FF4757',

  // Overlays
  overlay: 'rgba(0,0,0,0.75)',
  shimmer: 'rgba(30,34,53,0.8)',

  // Status bar
  statusBarStyle: 'light',
};

// ─── Context ─────────────────────────────────────────────────────────────────

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'dark' | 'light' | null
  const [mode, setModeState] = useState('auto'); // 'auto' | 'light' | 'dark'
  const [loaded, setLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved) setModeState(saved);
      setLoaded(true);
    });
  }, []);

  const setMode = useCallback(async (newMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(THEME_KEY, newMode);
  }, []);

  // Corrected toggleTheme: computes activeTheme inside the callback to avoid stale closure
  const toggleTheme = useCallback(() => {
    const active = mode === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    setMode(active === 'dark' ? 'light' : 'dark');
  }, [mode, systemScheme, setMode]);

  // Compute active theme
  const activeTheme =
    mode === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        mode,
        colors,
        setMode,
        toggleTheme,
        isDark: activeTheme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
