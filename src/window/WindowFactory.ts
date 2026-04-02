import path from 'path';
import { BrowserWindow } from 'electron';
import type { NotificationOptions } from '../types';
import { DEFAULTS } from '../constants';
import { ErrorCode, WindowCreationError } from '../errors';
import { resolveTheme } from '../utils/themeDetector';
import type { NotificationPosition, PositionCoords, ThemeMode } from '../types';
import { NotificationWindow, type INotificationWindow } from './NotificationWindow';

export interface IWindowFactory {
  create(id: string, options: NotificationOptions, coords: PositionCoords): INotificationWindow;
}

export class WindowFactory implements IWindowFactory {
  public constructor(
    private readonly resolvedOptions: {
      width: number;
      height: number;
      margin: number;
      gap: number;
    },
    private readonly position: NotificationPosition,
    private readonly requestedTheme: ThemeMode = 'auto',
  ) {}

  public create(id: string, options: NotificationOptions, coords: PositionCoords): INotificationWindow {
    try {
      // When compiled, this file lives at `dist/src/window/*`
      // Package root is three levels up from here.
      const packageRoot = path.resolve(__dirname, '..', '..', '..');
      const preloadPath = path.join(packageRoot, 'renderer', 'preload.js');

      const bw = new BrowserWindow({
        width: this.resolvedOptions.width,
        height: this.resolvedOptions.height,
        x: coords.x,
        y: coords.y,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        hasShadow: true,
        show: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        focusable: false,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: false,
          preload: preloadPath,
        },
      });

      bw.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      bw.setAlwaysOnTop(true, 'screen-saver');

      const variant = options.variant ?? 'default';
      const theme = resolveTheme(options.theme ?? this.requestedTheme);
      const duration = variant === 'loading' ? 0 : (options.duration ?? DEFAULTS.DURATION);

      const htmlPath = path.join(packageRoot, 'renderer', 'notification.html');
      const params = new URLSearchParams({
        id,
        title: options.title,
        description: options.description,
        duration: String(duration),
        position: this.position,
        variant,
        theme,
      });

      if (typeof options.image === 'string' && options.image.trim().length > 0) params.set('image', options.image);
      if (options.progress != null) params.set('progress', String(options.progress));
      if (options.progressLabel) params.set('progressLabel', options.progressLabel);
      if (options.loadingText) params.set('loadingText', options.loadingText);

      void bw.loadURL(`file://${htmlPath}?${params.toString()}`);

      bw.once('ready-to-show', () => {
        if (!bw.isDestroyed()) bw.showInactive();
      });

      return new NotificationWindow(id, bw);
    } catch (e: unknown) {
      throw new WindowCreationError(
        `Failed to create BrowserWindow: ${e instanceof Error ? e.message : String(e)}`,
        ErrorCode.WINDOW_CREATION_FAILED,
      );
    }
  }
}

