export type { NotificationManagerOptions } from './config.types';
export type { NotificationOptions, NotificationItem, CloseReason } from './notification.types';
export type { NotificationPosition, PositionCoords, WorkArea } from './position.types';
export type { RepositionPayload, IpcNotificationConfig } from './ipc.types';
import type { NotificationManagerOptions } from './config.types';

export type RequiredManagerOptions = Required<NotificationManagerOptions>;

