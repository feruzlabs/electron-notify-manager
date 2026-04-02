import type { NotificationPosition } from './position.types';

export interface NotificationManagerOptions {
  position?: NotificationPosition;
  width?: number;
  height?: number;
  margin?: number;
  gap?: number;
  debug?: boolean;
  maxVisible?: number;
}

