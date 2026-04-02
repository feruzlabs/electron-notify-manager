import type { BrowserWindow } from 'electron';
import type { NotificationUpdatePayload, NotificationVariant, ThemeMode } from './theme.types';

export type { NotificationUpdatePayload } from './theme.types';

export interface NotificationOptions {
  title: string;
  description: string;
  image?: string;
  duration?: number;
  variant?: NotificationVariant;
  theme?: ThemeMode;

  // progress variant only (optional extra fields used by renderer are allowed)
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
  // null means pending (queued but not yet shown)
  window: BrowserWindow | null;
  options: NotificationOptions;
  timer: NodeJS.Timeout | null;
}

