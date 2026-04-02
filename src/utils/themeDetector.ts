import { nativeTheme } from 'electron';
import type { ThemeMode } from '../types/theme.types';

export function resolveTheme(requested: ThemeMode): 'dark' | 'light' {
  if (requested === 'auto') {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }
  return requested;
}

export function onThemeChange(callback: (theme: 'dark' | 'light') => void): () => void {
  const handler = (): void => {
    callback(nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  };
  nativeTheme.on('updated', handler);
  return () => {
    nativeTheme.off('updated', handler);
  };
}

