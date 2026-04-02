export type { NotificationManagerOptions } from './config.types';
export type { NotificationOptions, NotificationItem, CloseReason } from './notification.types';
export type { NotificationPosition, PositionCoords, WorkArea } from './position.types';
export type { RepositionPayload, IpcNotificationConfig } from './ipc.types';
export type { NotificationVariant, ThemeMode } from './theme.types';
import type { NotificationManagerOptions } from './config.types';

export type RequiredManagerOptions = Required<NotificationManagerOptions>;

