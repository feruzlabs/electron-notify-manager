import { EventEmitter } from 'events';
import { screen } from 'electron';
import { DEFAULTS } from '../constants';
import { ErrorCode, NotificationError } from '../errors';
import { Logger } from '../utils/logger';
import { validateManagerOptions, validateNotificationOptions } from '../utils/validators';
import { generateId } from '../utils/idGenerator';
import type {
  CloseReason,
  NotificationManagerOptions,
  NotificationOptions,
  NotificationPosition,
  NotificationUpdatePayload,
  PositionConfig,
} from '../types';
import { PositionManager } from '../position/PositionManager';
import { NotificationQueue } from './NotificationQueue';
import { NotificationLifecycle } from './NotificationLifecycle';
import { WindowFactory } from '../window/WindowFactory';
import { IpcBridge } from '../ipc/IpcBridge';

export class NotificationManager extends EventEmitter {
  private readonly queue: NotificationQueue;
  private readonly lifecycle: NotificationLifecycle;
  private readonly positionManager: PositionManager;
  private readonly logger: Logger;
  private readonly ipcBridge: IpcBridge;
  private isDestroyed = false;

  public constructor(options: NotificationManagerOptions = {}) {
    super();
    validateManagerOptions(options);

    const position: NotificationPosition = options.position ?? 'bottomRight';
    const maxVisible = options.maxVisible ?? DEFAULTS.MAX_VISIBLE;
    const requestedTheme = options.theme ?? 'auto';

    this.logger = new Logger(options.debug ?? false);
    this.queue = new NotificationQueue(maxVisible);
    this.positionManager = new PositionManager();

    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;

    const resolvedOptions = {
      width: options.width ?? DEFAULTS.WIDTH,
      height: options.height ?? DEFAULTS.HEIGHT,
      margin: options.margin ?? DEFAULTS.MARGIN,
      gap: options.gap ?? DEFAULTS.GAP,
    };

    const positionConfig: PositionConfig = {
      ...resolvedOptions,
      screenWidth,
      screenHeight,
    };

    const windowFactory = new WindowFactory(resolvedOptions, position, requestedTheme);
    this.ipcBridge = new IpcBridge();

    this.lifecycle = new NotificationLifecycle(
      this.queue,
      this.positionManager,
      windowFactory,
      this.ipcBridge,
      this.logger,
      position,
      positionConfig,
    );

    // Wire IPC: renderer → main
    this.ipcBridge.register({
      onClose: (id, reason) => {
        void this.lifecycle.hide(id, reason).catch(() => undefined);
      },
      onClick: (id) => {
        this.emit('click', id);
        const item = this.queue.getAll().find((i) => i.id === id);
        try {
          item?.options.onClick?.();
        } catch {
          // ignore
        }
      },
      onReady: (_id) => undefined,
    });

    this.lifecycle.on('show', (id: string) => this.emit('show', id));
    this.lifecycle.on('close', (id: string, reason: CloseReason) => {
      this.emit('close', id, reason);
      const item = this.queue.getAll().find((i) => i.id === id);
      try {
        item?.options.onClose?.();
      } catch {
        // ignore
      }
    });
    this.lifecycle.on('update', (id: string) => this.emit('update', id));
  }

  public show(options: NotificationOptions): string {
    this.assertNotDestroyed();
    try {
      validateNotificationOptions(options);
    } catch (e: unknown) {
      const err = e instanceof NotificationError ? e : new NotificationError(String(e), ErrorCode.INVALID_OPTIONS);
      if (this.listenerCount('error') > 0) this.emit('error', err);
      throw err;
    }

    const id = generateId();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.lifecycle.showWithId(id, options).catch((e: unknown) => {
      const err = e instanceof NotificationError ? e : new NotificationError(String(e), ErrorCode.INVALID_OPTIONS);
      if (this.listenerCount('error') > 0) this.emit('error', err);
    });
    return id;
  }

  public close(id: string): void {
    this.assertNotDestroyed();
    if (!this.queue.has(id)) {
      throw new NotificationError(`Notification not found: ${id}`, ErrorCode.NOTIFICATION_NOT_FOUND);
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.lifecycle.hide(id, 'programmatic').catch((e: unknown) => {
      const err = e instanceof NotificationError ? e : new NotificationError(String(e), ErrorCode.INVALID_OPTIONS);
      if (this.listenerCount('error') > 0) this.emit('error', err);
    });
  }

  public closeAll(): void {
    this.assertNotDestroyed();
    this.lifecycle.destroyAll();
  }

  public update(id: string, payload: NotificationUpdatePayload): void {
    this.assertNotDestroyed();
    if (!this.queue.has(id)) {
      throw new NotificationError(`Notification not found: ${id}`, ErrorCode.NOTIFICATION_NOT_FOUND);
    }
    this.lifecycle.update(id, payload);
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.ipcBridge.unregister();
    this.lifecycle.destroyAll();
  }

  // Typed EventEmitter overloads
  public override emit(event: 'show', id: string): boolean;
  public override emit(event: 'close', id: string, reason: CloseReason): boolean;
  public override emit(event: 'click', id: string): boolean;
  public override emit(event: 'update', id: string): boolean;
  public override emit(event: 'error', error: NotificationError): boolean;
  public override emit(event: string, ...args: unknown[]): boolean;
  public override emit(event: string, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  public override on(event: 'show', listener: (id: string) => void): this;
  public override on(event: 'close', listener: (id: string, reason: CloseReason) => void): this;
  public override on(event: 'click', listener: (id: string) => void): this;
  public override on(event: 'update', listener: (id: string) => void): this;
  public override on(event: 'error', listener: (error: NotificationError) => void): this;
  public override on(event: string, listener: (...args: any[]) => void): this;
  public override on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private assertNotDestroyed(): void {
    if (!this.isDestroyed) return;
    throw new NotificationError('NotificationManager is destroyed', ErrorCode.MANAGER_DESTROYED);
  }
}

