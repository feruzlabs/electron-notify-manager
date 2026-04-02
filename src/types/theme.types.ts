export type ThemeMode = 'dark' | 'light' | 'auto';

export type NotificationVariant =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'loading'
  | 'progress';

export interface NotificationUpdatePayload {
  progress?: number;
  loadingText?: string;
  description?: string;
}

