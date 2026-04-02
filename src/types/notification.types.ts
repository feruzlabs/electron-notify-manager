import type { BrowserWindow } from 'electron';
import type { NotificationVariant, ThemeMode } from './theme.types';

export interface NotificationOptions {
  title: string;
  description: string;
  image?: string;
  duration?: number;
  variant?: NotificationVariant;
  theme?: ThemeMode;

  // progress variant only
  progress?: number; // 0-100
  progressLabel?: string;

  // loading variant only
  loadingText?: string;

  onClick?: () => void;
  onClose?: () => void;
}

export type CloseReason = 'duration' | 'user' | 'programmatic' | 'app-quit';

export interface NotificationItem {
  id: string;
  window: BrowserWindow;
  options: NotificationOptions;
  timer: NodeJS.Timeout | null;
}

export interface NotificationUpdatePayload {
  progress?: number;
  loadingText?: string;
  description?: string;
}

