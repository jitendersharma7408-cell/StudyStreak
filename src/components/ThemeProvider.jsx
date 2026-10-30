import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({ theme: undefined, setTheme: () => {}, resolvedTheme: undefined });

export function ThemeProvider({ children, attribute = 'class', defaultTheme = 'system', enableSystem = true }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
    }
    return defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] = useState('light');

  const applyTheme = useCallback((t) => {
    let resolved = t;
    if (enableSystem && (t === 'system' || !t)) {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setResolvedTheme(resolved);
    const root = document.documentElement;
    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    } else {
      root.setAttribute(attribute, resolved);
    }
  }, [attribute, enableSystem]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (!enableSystem) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, enableSystem, applyTheme]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    if (t === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);