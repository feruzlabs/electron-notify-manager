export enum ErrorCode {
  WINDOW_CREATION_FAILED = 'WINDOW_CREATION_FAILED',
  INVALID_POSITION = 'INVALID_POSITION',
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND',
  IPC_NOT_REGISTERED = 'IPC_NOT_REGISTERED',
  MANAGER_DESTROYED = 'MANAGER_DESTROYED',
  INVALID_OPTIONS = 'INVALID_OPTIONS',
  // kept for compatibility with existing code paths
  POSITION_CALCULATION_FAILED = 'POSITION_CALCULATION_FAILED',
}

export class NotificationError extends Error {
  public constructor(message: string, public readonly code: ErrorCode) {
    super(message);
    this.name = 'NotificationError';
  }
}

export class WindowCreationError extends NotificationError {}
export class PositionCalculationError extends NotificationError {}
export class IpcRegistrationError extends NotificationError {}

