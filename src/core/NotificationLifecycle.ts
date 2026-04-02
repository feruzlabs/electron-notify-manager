import { EventEmitter } from 'events';
import { DEFAULTS } from '../constants';
import { IPC_CHANNELS } from '../ipc/IpcChannels';
import { ErrorCode, NotificationError } from '../errors';
import { generateId } from '../utils/idGenerator';
import { Logger } from '../utils/logger';
import { validateNotificationOptions } from '../utils/validators';
import type {
  CloseReason,
  NotificationItem,
  NotificationOptions,
  NotificationUpdatePayload,
  PositionConfig,
  PositionCoords,
} from '../types';
import { PositionCalculator } from '../position/PositionCalculator';
import { PositionManager } from '../position/PositionManager';
import { NotificationQueue } from './NotificationQueue';

export interface INotificationWindow {
  id: string;
  destroy(): void;
  send(channel: string, payload: unknown): void;
}

export interface IWindowFactory {
  create(id: string, options: NotificationOptions, coords: PositionCoords): INotificationWindow;
}

export interface IIpcBridge {
  // kept for wiring renderer -> main (core manager owns the handlers)
  register(handlers: {
    onClose: (id: string, reason: CloseReason) => void;
    onClick: (id: string) => void;
    onReady: (id: string) => void;
  }): void;
  unregister(): void;
}

export class NotificationLifecycle extends EventEmitter {
  private readonly windows: Map<string, INotificationWindow>;
  private readonly calculator: PositionCalculator;

  public constructor(
    private readonly queue: NotificationQueue,
    private readonly positionManager: PositionManager,
    private readonly windowFactory: IWindowFactory,
    private readonly ipcBridge: IIpcBridge,
    private readonly logger: Logger,
    private readonly position: import('../types').NotificationPosition,
    private readonly positionConfig: PositionConfig,
  ) {
    super();
    this.windows = new Map<string, INotificationWindow>();
    this.calculator = new PositionCalculator();
  }

  public async show(options: NotificationOptions): Promise<string> {
    validateNotificationOptions(options);

    const id = generateId();
    await this.showWithId(id, options);
    return id;
  }

  public async showWithId(id: string, options: NotificationOptions): Promise<void> {
    const item: NotificationItem = { id, window: null, options, timer: null };
    this.queue.add(item);

    const visible = this.queue.getVisible();
    const isVisible = visible.some((v) => v.id === id);

    if (isVisible) {
      this.activateItem(item);
      // reflow OTHER windows positions (not the new one)
      this.reflowPositionsOnly();
    }
    // if pending → do nothing, wait for slot
  }

  public async hide(id: string, reason: CloseReason): Promise<void> {
    // idempotent: hide might be called twice (e.g. programmatic force-close + renderer notifyClose)
    if (!this.queue.has(id)) return;

    // 2. Remove from queue and position manager
    this.queue.remove(id);
    this.positionManager.remove(id);

    // 3. Destroy window
    const win = this.windows.get(id);
    if (win) {
      // If reason is NOT 'duration' the renderer isn't already animating out.
      // Ask renderer to play exit animation first.
      if (reason !== 'duration') {
        try {
          win.send(IPC_CHANNELS.NOTIFICATION_FORCE_CLOSE, {});
        } catch {
          // ignore
        }
        await new Promise<void>((resolve) => {
          setTimeout(resolve, DEFAULTS.ANIMATION_DURATION);
        });
      }
      win.destroy();
      this.windows.delete(id);
    }

    // 4. Reflow remaining + promote pending
    this.reflow();

    // 5. Emit close event
    this.emit('close', id, reason);
  }

  public destroy(id: string): void {
    this.queue.remove(id);
    this.positionManager.remove(id);
    const win = this.windows.get(id);
    if (win) {
      win.destroy();
      this.windows.delete(id);
    }
  }

  public destroyAll(): void {
    for (const id of this.queue.getAll().map((i) => i.id)) {
      this.destroy(id);
    }
    this.queue.clear();
    this.positionManager.clear();
  }

  public update(id: string, payload: NotificationUpdatePayload): void {
    if (!this.queue.has(id)) {
      throw new NotificationError(`Notification not found: ${id}`, ErrorCode.NOTIFICATION_NOT_FOUND);
    }
    const win = this.windows.get(id);
    if (!win) return;
    try {
      win.send(IPC_CHANNELS.NOTIFICATION_UPDATE, { id, updates: payload });
      this.emit('update', id);
    } catch (e: unknown) {
      this.logger.error('failed to send update', e instanceof Error ? e : undefined);
    }
  }

  // Activate item: create window + start timer. NO reflow call inside.
  private activateItem(item: NotificationItem): void {
    // guard: never activate twice
    if (this.windows.has(item.id)) return;

    const visible = this.queue.getVisible();
    const index = visible.findIndex((v) => v.id === item.id);
    const coords = this.calculator.getCoords(this.position, Math.max(0, index), this.positionConfig);

    this.positionManager.add(item.id);
    const win = this.windowFactory.create(item.id, item.options, coords);
    this.windows.set(item.id, win);

    this.emit('show', item.id);
  }

  // Reposition existing windows only — NO window creation, NO timer start
  private reflowPositionsOnly(): void {
    const visible = this.queue.getVisible();
    for (let i = 0; i < visible.length; i++) {
      const { id } = visible[i];
      const win = this.windows.get(id);
      if (!win) continue;
      const coords = this.calculator.getCoords(this.position, i, this.positionConfig);
      win.send(IPC_CHANNELS.NOTIFICATION_REPOSITION, { id, y: coords.y });
    }
  }

  // Full reflow: reposition existing + activate newly promoted pending items
  private reflow(): void {
    // Step 1: reposition existing active windows
    this.reflowPositionsOnly();

    // Step 2: find pending items that are NOW visible (promoted)
    const visible = this.queue.getVisible();
    for (const item of visible) {
      // Only activate items that don't have a window yet (were pending)
      if (!this.windows.has(item.id)) {
        this.activateItem(item);
        // After activating, reposition everyone again
        this.reflowPositionsOnly();
      }
    }
  }

  // Timers are renderer-owned; main no longer manages duration timers.
}

