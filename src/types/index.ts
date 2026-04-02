export type { NotificationManagerOptions, ResolvedManagerOptions } from './config.types';
export type { NotificationOptions, NotificationItem, CloseReason } from './notification.types';
export type { NotificationPosition, PositionCoords, PositionConfig, WorkArea } from './position.types';
export type {
  IpcNotificationConfig,
  IpcRepositionPayload,
  IpcUpdatePayload,
  LogEntry,
  LogType,
} from './ipc.types';
export type { NotificationUpdatePayload, NotificationVariant, ThemeMode } from './theme.types';

import type { NotificationManagerOptions } from './config.types';
import type { ThemeMode } from './theme.types';
export type RequiredManagerOptions =
  Required<Omit<NotificationManagerOptions, 'theme'>> & { theme?: ThemeMode };

