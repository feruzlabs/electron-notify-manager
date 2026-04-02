import { nativeTheme } from 'electron';
import type { ThemeMode } from '../types/theme.types';

export function resolveTheme(requested: ThemeMode): 'dark' | 'light' {
  if (requested === 'auto') {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }
  return requested;
}

