import path from 'path';
import { BrowserWindow } from 'electron';
import type { NotificationOptions, PositionCoords, RequiredManagerOptions } from './types';
import { DEFAULTS, IPC_CHANNELS } from './constants';
import { resolveTheme } from './utils/themeDetector';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function encodeParam(value: string): string {
  return encodeURIComponent(value);
}

type EntranceFrom = 'left' | 'right';

export class NotificationWindow {
  public readonly id: string;
  public readonly window: BrowserWindow;

  private readonly width: number;
  private readonly height: number;
  private animTimer: NodeJS.Timeout | null;

  public constructor(
    id: string,
    options: NotificationOptions,
    coords: PositionCoords,
    managerOptions: RequiredManagerOptions
  ) {
    this.id = id;
    this.width = managerOptions.width;
    this.height = managerOptions.height;
    this.animTimer = null;

    // When compiled, this file lives in `dist/src/*`, so we resolve the package root
    // and reference the runtime `renderer/*` assets from there (not from `dist/`).
    const packageRoot = path.resolve(__dirname, '..', '..');
    const preloadPath = path.join(packageRoot, 'renderer', 'preload.js');

    this.window = new BrowserWindow({
      width: managerOptions.width,
      height: managerOptions.height,
      x: coords.x,
      y: coords.y,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      hasShadow: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      focusable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        devTools: false,
        backgroundThrottling: false,
        preload: preloadPath
      }
    });

    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    this.window.setAlwaysOnTop(true, 'screen-saver');

    const htmlPath = path.join(packageRoot, 'renderer', 'notification.html');
    const variant = options.variant ?? 'default';
    const requestedTheme = options.theme ?? 'auto';
    const resolvedTheme = resolveTheme(requestedTheme);

    const duration =
      variant === 'loading'
        ? 0
        : typeof options.duration === 'number'
          ? options.duration
          : DEFAULTS.DURATION;
    const image = typeof options.image === 'string' && options.image.trim().length > 0 ? options.image : null;
    const progress = typeof options.progress === 'number' ? options.progress : null;
    const progressLabel =
      typeof options.progressLabel === 'string' && options.progressLabel.trim().length > 0
        ? options.progressLabel
        : null;
    const loadingText =
      typeof options.loadingText === 'string' && options.loadingText.trim().length > 0 ? options.loadingText : null;

    const url =
      `file://${htmlPath}?` +
      `id=${encodeParam(id)}` +
      `&title=${encodeParam(options.title)}` +
      `&description=${encodeParam(options.description)}` +
      `&duration=${encodeParam(String(duration))}` +
      `&position=${encodeParam(managerOptions.position)}` +
      `&variant=${encodeParam(variant)}` +
      `&theme=${encodeParam(requestedTheme)}` +
      `&themeResolved=${encodeParam(resolvedTheme)}` +
      (image ? `&image=${encodeParam(image)}` : '') +
      (progress !== null ? `&progress=${encodeParam(String(progress))}` : '') +
      (progressLabel ? `&progressLabel=${encodeParam(progressLabel)}` : '') +
      (loadingText ? `&loadingText=${encodeParam(loadingText)}` : '');

    void this.window.loadURL(url);

    // Keep window theme in sync when system theme changes (auto mode only).
    this.window.webContents.once('did-finish-load', () => {
      if (requestedTheme !== 'auto') return;
      try {
        this.window.webContents.send(IPC_CHANNELS.NOTIFICATION_THEME, { theme: resolveTheme('auto') });
      } catch {
        // ignore
      }
    });
  }

  public isDestroyed(): boolean {
    return this.window.isDestroyed();
  }

  public destroy(): void {
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
    if (!this.window.isDestroyed()) {
      try {
        this.window.destroy();
      } catch {
        // ignore
      }
    }
  }

  public getPosition(): PositionCoords {
    const [x, y] = this.window.getPosition();
    return { x, y };
  }

  public async showAt(finalPos: PositionCoords, entranceFrom: EntranceFrom): Promise<void> {
    const offscreenX =
      entranceFrom === 'left' ? finalPos.x - (this.width + 24) : finalPos.x + (this.width + 24);

    this.window.setPosition(Math.round(offscreenX), Math.round(finalPos.y), false);
    this.window.showInactive();
    await this.animatePosition(finalPos, 260);
  }

  public moveTo(target: PositionCoords, animate: boolean, durationMs: number): void {
    if (!animate) {
      this.window.setPosition(Math.round(target.x), Math.round(target.y), false);
      return;
    }
    void this.animatePosition(target, durationMs);
  }

  private animatePosition(target: PositionCoords, durationMs: number): Promise<void> {
    if (this.window.isDestroyed()) return Promise.resolve();

    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }

    const start = this.getPosition();
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    const startTime = Date.now();

    return new Promise((resolve) => {
      this.animTimer = setInterval(() => {
        if (this.window.isDestroyed()) {
          if (this.animTimer) clearInterval(this.animTimer);
          this.animTimer = null;
          resolve();
          return;
        }

        const t = Math.min(1, (Date.now() - startTime) / durationMs);
        const e = easeOutCubic(t);
        const x = start.x + dx * e;
        const y = start.y + dy * e;
        this.window.setPosition(Math.round(x), Math.round(y), false);

        if (t >= 1) {
          if (this.animTimer) clearInterval(this.animTimer);
          this.animTimer = null;
          resolve();
        }
      }, 16);
    });
  }
}

