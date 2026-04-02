import type { NotificationPosition } from './position.types';
import type { ThemeMode } from './theme.types';

export interface NotificationManagerOptions {
  position?: NotificationPosition;
  width?: number;
  height?: number;
  margin?: number;
  gap?: number;
  theme?: ThemeMode;
  maxVisible?: number;

  // kept for compatibility with existing code paths
  debug?: boolean;
}

export type ResolvedManagerOptions = Required<NotificationManagerOptions>;

