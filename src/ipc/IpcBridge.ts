import { ipcMain } from 'electron';
import { ErrorCode, IpcRegistrationError } from '../errors';
import type { CloseReason } from '../types';
import { IPC_CHANNELS } from './IpcChannels';

export interface IIpcBridge {
  register(handlers: IpcHandlers): void;
  unregister(): void;
  isRegistered(): boolean;
}

export interface IpcHandlers {
  onClose: (id: string, reason: CloseReason) => void;
  onClick: (id: string) => void;
  onReady: (id: string) => void;
}

export class IpcBridge implements IIpcBridge {
  private registered = false;
  private readonly boundHandlers: Array<{ channel: string; handler: (...args: unknown[]) => void }> = [];

  public register(handlers: IpcHandlers): void {
    if (this.registered) {
      throw new IpcRegistrationError('IPC bridge already registered', ErrorCode.INVALID_OPTIONS);
    }

    const closeHandler = (_evt: unknown, id: unknown, reason: unknown): void => {
      if (typeof id !== 'string') return;
      if (reason !== 'duration' && reason !== 'user' && reason !== 'programmatic' && reason !== 'app-quit') return;
      handlers.onClose(id, reason);
    };
    ipcMain.on(IPC_CHANNELS.NOTIFICATION_CLOSE, closeHandler);
    this.boundHandlers.push({ channel: IPC_CHANNELS.NOTIFICATION_CLOSE, handler: closeHandler });

    const clickHandler = (_evt: unknown, id: unknown): void => {
      if (typeof id !== 'string') return;
      handlers.onClick(id);
    };
    ipcMain.on(IPC_CHANNELS.NOTIFICATION_CLICK, clickHandler);
    this.boundHandlers.push({ channel: IPC_CHANNELS.NOTIFICATION_CLICK, handler: clickHandler });

    const readyHandler = (_evt: unknown, id: unknown): void => {
      if (typeof id !== 'string') return;
      handlers.onReady(id);
    };
    ipcMain.on(IPC_CHANNELS.NOTIFICATION_READY, readyHandler);
    this.boundHandlers.push({ channel: IPC_CHANNELS.NOTIFICATION_READY, handler: readyHandler });

    this.registered = true;
  }

  public unregister(): void {
    for (const { channel, handler } of this.boundHandlers) {
      ipcMain.removeListener(channel, handler);
    }
    this.boundHandlers.length = 0;
    this.registered = false;
  }

  public isRegistered(): boolean {
    return this.registered;
  }
}

