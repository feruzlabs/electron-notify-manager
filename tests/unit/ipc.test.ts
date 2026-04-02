jest.mock('electron', () => {
  return {
    ipcMain: {
      on: jest.fn(),
      removeAllListeners: jest.fn(),
    },
  };
});

import { ipcMain } from 'electron';
import { IpcRegistrationError } from '../../src/errors';
import { IpcBridge } from '../../src/ipc/IpcBridge';
import { IPC_CHANNELS } from '../../src/ipc/IpcChannels';

describe('IpcBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isRegistered returns false initially', () => {
    const b = new IpcBridge();
    expect(b.isRegistered()).toBe(false);
  });

  it('registers handlers successfully', () => {
    const b = new IpcBridge();
    b.register({
      onClose: jest.fn(),
      onClick: jest.fn(),
      onReady: jest.fn(),
    });
    expect(b.isRegistered()).toBe(true);
    expect(ipcMain.on).toHaveBeenCalledTimes(3);
  });

  it('throws if registered twice', () => {
    const b = new IpcBridge();
    b.register({
      onClose: jest.fn(),
      onClick: jest.fn(),
      onReady: jest.fn(),
    });
    expect(() =>
      b.register({
        onClose: jest.fn(),
        onClick: jest.fn(),
        onReady: jest.fn(),
      }),
    ).toThrow(IpcRegistrationError);
  });

  it('unregister clears all listeners', () => {
    const b = new IpcBridge();
    b.register({
      onClose: jest.fn(),
      onClick: jest.fn(),
      onReady: jest.fn(),
    });
    b.unregister();
    expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.NOTIFICATION_CLOSE);
    expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.NOTIFICATION_CLICK);
    expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(IPC_CHANNELS.NOTIFICATION_READY);
  });

  it('isRegistered returns true after register', () => {
    const b = new IpcBridge();
    b.register({
      onClose: jest.fn(),
      onClick: jest.fn(),
      onReady: jest.fn(),
    });
    expect(b.isRegistered()).toBe(true);
  });

  it('isRegistered returns false after unregister', () => {
    const b = new IpcBridge();
    b.register({
      onClose: jest.fn(),
      onClick: jest.fn(),
      onReady: jest.fn(),
    });
    b.unregister();
    expect(b.isRegistered()).toBe(false);
  });
});

describe('IpcChannels', () => {
  it('has all required channel constants', () => {
    expect(IPC_CHANNELS.NOTIFICATION_CLOSE).toBeDefined();
    expect(IPC_CHANNELS.NOTIFICATION_CLICK).toBeDefined();
    expect(IPC_CHANNELS.NOTIFICATION_REPOSITION).toBeDefined();
    expect(IPC_CHANNELS.NOTIFICATION_READY).toBeDefined();
    expect(IPC_CHANNELS.NOTIFICATION_UPDATE).toBeDefined();
  });

  it('channel values are unique strings', () => {
    const values = Object.values(IPC_CHANNELS);
    expect(values.every((v) => typeof v === 'string')).toBe(true);
    expect(new Set(values).size).toBe(values.length);
  });
});

