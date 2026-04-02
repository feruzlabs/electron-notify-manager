import type { NotificationUpdatePayload, NotificationVariant, ThemeMode } from './theme.types';

export type LogType = 'shown' | 'closed' | 'updated' | 'click' | 'error';

export interface LogEntry {
  type: LogType;
  message: string;
  timestamp: number;
}

export interface IpcRepositionPayload {
  id: string;
  y: number;
}

export interface IpcNotificationConfig {
  id: string;
  title: string;
  description: string;
  image: string | null;
  duration: number;
  variant: NotificationVariant;
  theme: ThemeMode;
  progress?: number;
}

export interface IpcUpdatePayload {
  id: string;
  updates: NotificationUpdatePayload;
}

