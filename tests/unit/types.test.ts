import { DEFAULTS, IPC_CHANNELS, VALID_POSITIONS, VALID_VARIANTS } from '../../src/constants';
import {
  ErrorCode,
  IpcRegistrationError,
  NotificationError,
  PositionCalculationError,
  WindowCreationError,
} from '../../src/errors';

describe('types/constants structure', () => {
  it('should have expected ErrorCode values', () => {
    expect(ErrorCode.WINDOW_CREATION_FAILED).toBe('WINDOW_CREATION_FAILED');
    expect(ErrorCode.INVALID_POSITION).toBe('INVALID_POSITION');
    expect(ErrorCode.NOTIFICATION_NOT_FOUND).toBe('NOTIFICATION_NOT_FOUND');
    expect(ErrorCode.IPC_NOT_REGISTERED).toBe('IPC_NOT_REGISTERED');
    expect(ErrorCode.MANAGER_DESTROYED).toBe('MANAGER_DESTROYED');
    expect(ErrorCode.INVALID_OPTIONS).toBe('INVALID_OPTIONS');
  });

  it('NotificationError should be instance of Error', () => {
    const err = new NotificationError('x', ErrorCode.INVALID_OPTIONS);
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe(ErrorCode.INVALID_OPTIONS);
    expect(err.name).toBe('NotificationError');
  });

  it('subclasses should be instance of NotificationError', () => {
    const w = new WindowCreationError('w', ErrorCode.WINDOW_CREATION_FAILED);
    const p = new PositionCalculationError('p', ErrorCode.INVALID_POSITION);
    const i = new IpcRegistrationError('i', ErrorCode.IPC_NOT_REGISTERED);
    expect(w).toBeInstanceOf(NotificationError);
    expect(p).toBeInstanceOf(NotificationError);
    expect(i).toBeInstanceOf(NotificationError);
  });

  it('DEFAULTS values should be correct', () => {
    expect(DEFAULTS.WIDTH).toBe(360);
    expect(DEFAULTS.HEIGHT).toBe(100);
    expect(DEFAULTS.MARGIN).toBe(16);
    expect(DEFAULTS.GAP).toBe(10);
    expect(DEFAULTS.DURATION).toBe(4000);
    expect(DEFAULTS.ANIMATION_DURATION).toBe(300);
    expect(DEFAULTS.REPOSITION_DURATION).toBe(300);
    expect(DEFAULTS.MAX_VISIBLE).toBe(5);
  });

  it('IPC_CHANNELS keys should match expected strings', () => {
    expect(IPC_CHANNELS.NOTIFICATION_CLOSE).toBe('notification:close');
    expect(IPC_CHANNELS.NOTIFICATION_CLICK).toBe('notification:click');
    expect(IPC_CHANNELS.NOTIFICATION_REPOSITION).toBe('notification:reposition');
    expect(IPC_CHANNELS.NOTIFICATION_READY).toBe('notification:ready');
    expect(IPC_CHANNELS.NOTIFICATION_UPDATE).toBe('notification:update');
  });

  it('VALID_POSITIONS should have exactly 6 items', () => {
    expect(VALID_POSITIONS).toHaveLength(6);
  });

  it('VALID_VARIANTS should have exactly 6 items', () => {
    expect(VALID_VARIANTS).toHaveLength(6);
  });
});

