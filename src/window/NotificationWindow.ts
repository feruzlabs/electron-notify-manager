import type { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../ipc/IpcChannels';
import type { NotificationUpdatePayload } from '../types';

export interface INotificationWindow {
  readonly id: string;
  readonly browserWindow: BrowserWindow;
  send(channel: string, payload: unknown): void;
  destroy(): void;
  sendReposition(y: number): void;
  sendUpdate(payload: NotificationUpdatePayload): void;
  forceClose(): void;
  close(): void;
  isDestroyed(): boolean;
}

export class NotificationWindow implements INotificationWindow {
  public constructor(
    public readonly id: string,
    public readonly browserWindow: BrowserWindow,
  ) {}

  public sendReposition(y: number): void {
    if (this.browserWindow.isDestroyed()) return;
    this.browserWindow.webContents.send(IPC_CHANNELS.NOTIFICATION_REPOSITION, { id: this.id, y });
  }

  public send(channel: string, payload: unknown): void {
    if (this.browserWindow.isDestroyed()) return;
    this.browserWindow.webContents.send(channel, payload);
  }

  public sendUpdate(payload: NotificationUpdatePayload): void {
    if (this.browserWindow.isDestroyed()) return;
    this.browserWindow.webContents.send(IPC_CHANNELS.NOTIFICATION_UPDATE, { id: this.id, updates: payload });
  }

  public destroy(): void {
    if (this.browserWindow.isDestroyed()) return;
    this.browserWindow.destroy();
  }

  public forceClose(): void {
    if (this.browserWindow.isDestroyed()) return;
    this.browserWindow.webContents.send(IPC_CHANNELS.NOTIFICATION_FORCE_CLOSE);
  }

  public close(): void {
    if (this.browserWindow.isDestroyed()) return;
    this.browserWindow.close();
  }

  public isDestroyed(): boolean {
    return this.browserWindow.isDestroyed();
  }
}

