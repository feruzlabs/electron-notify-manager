import {
  ErrorCode,
  IpcRegistrationError,
  NotificationError,
  PositionCalculationError,
  WindowCreationError,
} from '../../src/errors';

describe('Custom Errors', () => {
  it('should create NotificationError with code', () => {
    const err = new NotificationError('test', ErrorCode.WINDOW_CREATION_FAILED);
    expect(err.message).toBe('test');
    expect(err.code).toBe(ErrorCode.WINDOW_CREATION_FAILED);
    expect(err.name).toBe('NotificationError');
    expect(err).toBeInstanceOf(Error);
  });

  it('should create WindowCreationError', () => {
    const err = new WindowCreationError('window failed', ErrorCode.WINDOW_CREATION_FAILED);
    expect(err).toBeInstanceOf(NotificationError);
    expect(err.code).toBe(ErrorCode.WINDOW_CREATION_FAILED);
    expect(err.name).toBe('WindowCreationError');
  });

  it('should create PositionCalculationError', () => {
    const err = new PositionCalculationError('position failed', ErrorCode.POSITION_CALCULATION_FAILED);
    expect(err).toBeInstanceOf(NotificationError);
    expect(err.code).toBe(ErrorCode.POSITION_CALCULATION_FAILED);
    expect(err.name).toBe('PositionCalculationError');
  });

  it('should create IpcRegistrationError', () => {
    const err = new IpcRegistrationError('ipc failed', ErrorCode.IPC_NOT_REGISTERED);
    expect(err).toBeInstanceOf(NotificationError);
    expect(err.code).toBe(ErrorCode.IPC_NOT_REGISTERED);
    expect(err.name).toBe('IpcRegistrationError');
  });

  it('should have correct stack trace', () => {
    const err = new NotificationError('trace test', ErrorCode.MANAGER_DESTROYED);
    expect(err.stack).toBeDefined();
  });
});

