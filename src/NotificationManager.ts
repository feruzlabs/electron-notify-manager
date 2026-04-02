import crypto from 'crypto';
import { EventEmitter } from 'events';
import { ipcMain, screen } from 'electron';
import type { IpcMainEvent, Display, BrowserWindow } from 'electron';
import { NotificationWindow } from './NotificationWindow';
import { calculateCoordsInWorkArea } from './positionCalculator';
import type {
  CloseReason,
  NotificationItem,
  NotificationManagerOptions,
  NotificationOptions,
  NotificationPosition,
  RequiredManagerOptions
} from './types';

interface ReflowArgs {
  animate: boolean;
  showingId?: string;
}

export class NotificationManager extends EventEmitter {
  private readonly options: RequiredManagerOptions;
  private readonly notifications: Map<string, NotificationItem>;
  private readonly windows: Map<string, NotificationWindow>;
  private readonly order: string[];

  private readonly onIpcCloseBound: (event: IpcMainEvent, id: unknown) => void;
  private readonly onIpcClickBound: (event: IpcMainEvent, id: unknown) => void;

  public constructor(options: NotificationManagerOptions = {}) {
    super();
    this.options = {
      position: (options.position ?? 'bottomRight') as NotificationPosition,
      width: typeof options.width === 'number' ? options.width : 360,
      height: typeof options.height === 'number' ? options.height : 100,
      margin: typeof options.margin === 'number' ? options.margin : 16,
      gap: typeof options.gap === 'number' ? options.gap : 10,
      debug: typeof options.debug === 'boolean' ? options.debug : false,
      maxVisible: typeof options.maxVisible === 'number' ? options.maxVisible : 5
    };

    this.notifications = new Map<string, NotificationItem>();
    this.windows = new Map<string, NotificationWindow>();
    this.order = [];

    this.onIpcCloseBound = this.onRendererClose.bind(this);
    this.onIpcClickBound = this.onRendererClick.bind(this);

    ipcMain.on('notification-close', this.onIpcCloseBound);
    ipcMain.on('notification-click', this.onIpcClickBound);
  }

  /**
   * Show a notification window and return its unique ID.
   */
  public show(options: NotificationOptions): string {
    if (typeof options !== 'object' || options === null) {
      throw new TypeError('show(options) requires { title: string, description: string, ... }');
    }
    if (typeof options.title !== 'string' || typeof options.description !== 'string') {
      throw new TypeError('show(options) requires { title: string, description: string, ... }');
    }

    const id = this.newId();
    const duration =
      typeof options.duration === 'number' ? Math.max(0, Math.floor(options.duration)) : 4000;

    const display = this.getTargetDisplay();
    const workArea = display.workArea;

    // Insert as top-most.
    this.order.unshift(id);

    // Compute provisional coords at the top (index 0) before creating the window.
    const coords = calculateCoordsInWorkArea({
      workArea,
      position: this.options.position,
      width: this.options.width,
      height: this.options.height,
      margin: this.options.margin,
      gap: this.options.gap,
      indexTopToBottom: 0,
      count: this.idsOnDisplay(display.id).length + 1
    });

    const win = new NotificationWindow(
      id,
      { ...options, duration },
      coords,
      this.options
    );

    this.windows.set(id, win);

    const item: NotificationItem = {
      id,
      window: win.window,
      options: { ...options, duration },
      timer: null
    };
    this.notifications.set(id, item);

    this.reflowForDisplay(display.id, { animate: true, showingId: id });

    this.emit('show', id);
    return id;
  }

  /**
   * Manually close a notification by ID.
   */
  public close(id: string): void {
    const item = this.notifications.get(id);
    if (!item) return;
    this.closeById(id, item.window, 'programmatic');
  }

  /**
   * Close all active notifications.
   */
  public closeAll(): void {
    for (const id of Array.from(this.notifications.keys())) {
      this.close(id);
    }
  }

  /**
   * Destroy manager and clean up all resources.
   */
  public destroy(): void {
    this.dispose('app-quit');
  }

  public dispose(reason: CloseReason = 'programmatic'): void {
    ipcMain.off('notification-close', this.onIpcCloseBound);
    ipcMain.off('notification-click', this.onIpcClickBound);
    for (const id of Array.from(this.notifications.keys())) {
      const item = this.notifications.get(id);
      if (!item) continue;
      this.closeById(id, item.window, reason);
    }
  }

  private onRendererClose(event: IpcMainEvent, id: unknown): void {
    const notifId = String(id);
    const item = this.notifications.get(notifId);
    if (!item) return;

    if (item.window.webContents.id !== event.sender.id) return;
    this.closeById(notifId, item.window, 'user');
  }

  private onRendererClick(event: IpcMainEvent, id: unknown): void {
    const notifId = String(id);
    const item = this.notifications.get(notifId);
    if (!item) return;
    if (item.window.webContents.id !== event.sender.id) return;

    try {
      item.options.onClick?.();
    } catch {
      // ignore
    }
    this.emit('click', notifId);

    // Renderer requests close after click; manager will close on 'notification-close'.
  }

  private closeById(id: string, window: BrowserWindow, reason: CloseReason): void {
    const item = this.notifications.get(id);
    if (!item) return;

    if (item.timer) {
      clearTimeout(item.timer);
      item.timer = null;
    }

    this.notifications.delete(id);
    const idx = this.order.indexOf(id);
    if (idx >= 0) this.order.splice(idx, 1);

    const wrapper = this.windows.get(id);
    this.windows.delete(id);
    wrapper?.destroy();

    try {
      item.options.onClose?.();
    } catch {
      // ignore
    }

    this.emit('close', id, reason);
    const displayId = this.getDisplayIdForWindow(window) ?? this.getTargetDisplay().id;
    this.reflowForDisplay(displayId, { animate: true });
  }

  private idsOnDisplay(displayId: number): string[] {
    return this.order.filter((id) => {
      const win = this.notifications.get(id)?.window;
      if (!win) return false;
      const d = screen.getDisplayMatching(win.getBounds());
      return d.id === displayId;
    });
  }

  private reflowForDisplay(displayId: number, args: ReflowArgs): void {
    const display = screen.getAllDisplays().find((d) => d.id === displayId) ?? this.getTargetDisplay();
    const workArea = display.workArea;

    const ids = this.idsOnDisplay(display.id);
    const count = ids.length;

    for (let index = 0; index < count; index++) {
      const id = ids[index];
      const wrapper = this.windows.get(id);
      const item = this.notifications.get(id);
      if (!wrapper || !item) continue;
      if (wrapper.isDestroyed()) continue;

      const coords = calculateCoordsInWorkArea({
        workArea,
        position: this.options.position,
        width: this.options.width,
        height: this.options.height,
        margin: this.options.margin,
        gap: this.options.gap,
        indexTopToBottom: index,
        count
      });

      // Requested IPC contract (renderer might animate something, but main moves the window).
      try {
        wrapper.window.webContents.send('notification-reposition', { id, y: coords.y });
      } catch {
        // ignore
      }

      const entranceFrom: 'left' | 'right' = this.options.position.endsWith('Left') ? 'left' : 'right';

      if (args.showingId === id) {
        void wrapper.showAt(coords, entranceFrom);
      } else {
        wrapper.moveTo(coords, args.animate, 300);
      }
    }
  }

  private getTargetDisplay(): Display {
    const point = screen.getCursorScreenPoint();
    return screen.getDisplayNearestPoint(point);
  }

  private getDisplayIdForWindow(window: BrowserWindow): number | null {
    try {
      const d = screen.getDisplayMatching(window.getBounds());
      return d.id;
    } catch {
      return null;
    }
  }

  private newId(): string {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return crypto.randomBytes(16).toString('hex');
  }
}

