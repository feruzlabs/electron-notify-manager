import type { NotificationPosition } from './types/position.types';
import type { NotificationVariant } from './types/theme.types';

export const DEFAULTS = {
  WIDTH: 360,
  HEIGHT: 100,
  MARGIN: 16,
  GAP: 10,
  DURATION: 4000,
  ANIMATION_DURATION: 300,
  REPOSITION_DURATION: 300,
  MAX_VISIBLE: 5,
} as const;

export const IPC_CHANNELS = {
  NOTIFICATION_CLOSE: 'notification:close',
  NOTIFICATION_CLICK: 'notification:click',
  NOTIFICATION_REPOSITION: 'notification:reposition',
  NOTIFICATION_READY: 'notification:ready',
  NOTIFICATION_UPDATE: 'notification:update',

  // kept for compatibility with existing code paths
  NOTIFICATION_THEME: 'notification:theme',
} as const;

export const VALID_POSITIONS: NotificationPosition[] = [
  'topLeft',
  'topCenter',
  'topRight',
  'bottomLeft',
  'bottomCenter',
  'bottomRight',
];

export const VALID_VARIANTS: NotificationVariant[] = [
  'default',
  'success',
  'error',
  'warning',
  'loading',
  'progress',
];

// kept for compatibility with existing code paths
export const VALID_THEME_MODES = ['dark', 'light', 'auto'] as const;

