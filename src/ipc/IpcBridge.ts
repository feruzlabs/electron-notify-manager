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
  private readonly registeredChannels: string[] = [];

  public register(handlers: IpcHandlers): void {
    if (this.registered) {
      throw new IpcRegistrationError('IPC bridge already registered', ErrorCode.INVALID_OPTIONS);
    }

    ipcMain.on(IPC_CHANNELS.NOTIFICATION_CLOSE, (_evt, id: unknown, reason: unknown) => {
      if (typeof id !== 'string') return;
      if (reason !== 'duration' && reason !== 'user' && reason !== 'programmatic' && reason !== 'app-quit') return;
      handlers.onClose(id, reason);
    });
    this.registeredChannels.push(IPC_CHANNELS.NOTIFICATION_CLOSE);

    ipcMain.on(IPC_CHANNELS.NOTIFICATION_CLICK, (_evt, id: unknown) => {
      if (typeof id !== 'string') return;
      handlers.onClick(id);
    });
    this.registeredChannels.push(IPC_CHANNELS.NOTIFICATION_CLICK);

    ipcMain.on(IPC_CHANNELS.NOTIFICATION_READY, (_evt, id: unknown) => {
      if (typeof id !== 'string') return;
      handlers.onReady(id);
    });
    this.registeredChannels.push(IPC_CHANNELS.NOTIFICATION_READY);

    this.registered = true;
  }

  public unregister(): void {
    for (const ch of this.registeredChannels) {
      ipcMain.removeAllListeners(ch);
    }
    this.registeredChannels.length = 0;
    this.registered = false;
  }

  public isRegistered(): boolean {
    return this.registered;
  }
}

