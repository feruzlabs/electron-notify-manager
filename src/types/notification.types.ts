import type { BrowserWindow } from 'electron';

export interface NotificationOptions {
  title: string;
  description: string;
  image?: string;
  duration?: number;
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

