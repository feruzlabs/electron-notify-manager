export enum ErrorCode {
  WINDOW_CREATION_FAILED = 'WINDOW_CREATION_FAILED',
  INVALID_POSITION = 'INVALID_POSITION',
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND',
  IPC_NOT_REGISTERED = 'IPC_NOT_REGISTERED',
  MANAGER_DESTROYED = 'MANAGER_DESTROYED',
  INVALID_OPTIONS = 'INVALID_OPTIONS',
  POSITION_CALCULATION_FAILED = 'POSITION_CALCULATION_FAILED',
}

export class NotificationError extends Error {
  public readonly code: ErrorCode;

  public constructor(message: string, code: ErrorCode) {
    super(message);
    this.name = 'NotificationError';
    this.code = code;
  }
}

export class WindowCreationError extends NotificationError {
  public constructor(message: string) {
    super(message, ErrorCode.WINDOW_CREATION_FAILED);
    this.name = 'WindowCreationError';
  }
}

export class PositionCalculationError extends NotificationError {
  public constructor(message: string) {
    super(message, ErrorCode.POSITION_CALCULATION_FAILED);
    this.name = 'PositionCalculationError';
  }
}

export class IpcRegistrationError extends NotificationError {
  public constructor(message: string) {
    super(message, ErrorCode.IPC_NOT_REGISTERED);
    this.name = 'IpcRegistrationError';
  }
}

