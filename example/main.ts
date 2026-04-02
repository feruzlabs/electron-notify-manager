import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';

import { NotificationManager } from 'electron-notify-manager';
import type { CloseReason, NotificationPosition, ThemeMode } from 'electron-notify-manager';

type LogType = 'shown' | 'closed' | 'updated' | 'click' | 'error';

// Workaround for some Windows GPU driver / VM / RDP setups where Chromium's GPU process may crash.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-program-cache');

// Fix Windows "Unable to move/create cache (0x5)" by forcing Electron to use a writable userData folder.
// This also relocates Chromium caches under that directory.
const tempDir =
  process.env.TEMP ?? process.env.TMP ?? process.env.LOCALAPPDATA ?? process.cwd();
app.setPath('userData', path.join(tempDir, 'electron-notify-manager-example'));

let mainWindow: BrowserWindow | null = null;
let notifier: NotificationManager | null = null;

const shownIds: string[] = [];
const notifiersByPosition = new Map<NotificationPosition, NotificationManager>();

function createNotifier(position: NotificationPosition = 'bottomRight'): NotificationManager {
  const n = new NotificationManager({
    position,
    width: 360,
    height: 100,
    margin: 16,
    gap: 10,
  });

  n.on('show', (id: string) => {
    shownIds.unshift(id);
    log('shown', `id: ${id.slice(0, 8)}`);
  });

  n.on('shown', (id: string) => {
    log('updated', `window shown id: ${id.slice(0, 8)}`);
  });

  n.on('hidden', (id: string, reason: CloseReason) => {
    log('updated', `window hidden id: ${id.slice(0, 8)} reason: ${reason}`);
  });

  n.on('close', (id: string, reason: CloseReason) => {
    const idx = shownIds.indexOf(id);
    if (idx >= 0) shownIds.splice(idx, 1);
    log('closed', `id: ${id.slice(0, 8)} reason: ${reason}`);
  });

  n.on('click', (id: string) => {
    log('click', `id: ${id.slice(0, 8)}`);
  });

  n.on('error', (err: Error) => {
    log('error', err.message);
  });

  // Extra logs for reflow/reposition debugging
  n.on('reposition', (id: string, x: number, y: number) => {
    log('updated', `reposition id: ${id.slice(0, 8)} x: ${Math.round(x)} y: ${Math.round(y)}`);
  });
  n.on('reflow:done', (displayId: number, count: number) => {
    log('updated', `reflow done display: ${displayId} count: ${count}`);
  });

  return n;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    backgroundColor: '#0f0f17',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.webContents.openDevTools({ mode: 'detach' });
  void mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function log(type: LogType, message: string): void {
  mainWindow?.webContents.send('log-entry', {
    type,
    message,
    timestamp: Date.now(),
  });
}

function showAtPosition(position: NotificationPosition): void {
  let n = notifiersByPosition.get(position) ?? null;
  if (!n) {
    n = createNotifier(position);
    notifiersByPosition.set(position, n);
  }
  // keep the "main" notifier as the last used one for other actions
  notifier = n;
  n.show({
    title: `Position: ${position}`,
    description: 'This notification uses a new manager instance for position demo.',
    variant: 'default',
    duration: 2500,
  });
}

function showTheme(theme: ThemeMode): void {
  if (!notifier) return;
  notifier.show({
    title: `Theme: ${theme}`,
    description: 'Theme override demo.',
    variant: 'success',
    theme,
    duration: 3000,
  });
}

function showBothThemes(): void {
  showTheme('dark');
  showTheme('light');
}

function stackNotifications(count: number, intervalMs: number): void {
  if (!notifier) return;
  let i = 0;
  const timer = setInterval(() => {
    i += 1;
    notifier?.show({
      title: `Stack #${i}`,
      description: 'Stacking demo.',
      variant: i % 2 === 0 ? 'default' : 'warning',
      duration: 2500,
    });
    if (i >= count) clearInterval(timer);
  }, intervalMs);
}

function stackMixed(): void {
  if (!notifier) return;
  notifier.show({ title: 'Default', description: 'Mixed stack', variant: 'default', duration: 3200 });
  notifier.show({ title: 'Success', description: 'Mixed stack', variant: 'success', duration: 3200 });
  notifier.show({ title: 'Warning', description: 'Mixed stack', variant: 'warning', duration: 4200 });
  notifier.show({ title: 'Error', description: 'Mixed stack', variant: 'error', duration: 5200 });
}

function showDefault(): void {
  notifier?.show({ title: 'Info', description: 'New update available', variant: 'default', duration: 4000 });
}

function showSuccess(): void {
  notifier?.show({ title: 'Success!', description: 'File saved successfully', variant: 'success', duration: 3000 });
}

function showError(): void {
  notifier?.show({ title: 'Error', description: 'Failed to connect to server', variant: 'error', duration: 5000 });
}

function showWarning(): void {
  notifier?.show({ title: 'Warning', description: 'Disk space is running low', variant: 'warning', duration: 4500 });
}

function showSticky(): void {
  notifier?.show({ title: 'Sticky', description: 'duration=0 (manual close)', variant: 'default', duration: 0 });
}

function showNoImage(): void {
  notifier?.show({ title: 'No Image', description: 'Uses built-in icon', variant: 'default', duration: 3500 });
}

function showWithImage(): void {
  const imagePath = path.join(__dirname, '..', 'assets', 'icon.svg');
  notifier?.show({
    title: 'With Image',
    description: 'Custom image is shown instead of SVG icon.',
    image: imagePath,
    variant: 'default',
    duration: 5000,
  });
}

function showLongContent(): void {
  notifier?.show({
    title: 'Long content title that should ellipsis nicely',
    description:
      'This is a longer description intended to test line clamping and layout. It should not overflow the container.',
    variant: 'default',
    duration: 5000,
  });
}

function showShortDuration(): void {
  notifier?.show({ title: 'Short', description: '900ms duration', variant: 'warning', duration: 900 });
}

function showLongDuration(): void {
  notifier?.show({ title: 'Long', description: '10s duration', variant: 'default', duration: 10_000 });
}

function showLoading(): void {
  if (!notifier) return;
  const id = notifier.show({
    title: 'Uploading...',
    description: 'Preparing files',
    variant: 'loading',
    loadingText: 'Preparing files…',
  });
  log('updated', `loading started: ${id.slice(0, 8)}`);
  setTimeout(() => {
    notifier?.update(id, { loadingText: 'Almost done…' });
    log('updated', `loading text updated: ${id.slice(0, 8)}`);
  }, 2000);
  setTimeout(() => {
    notifier?.close(id);
  }, 4000);
}

function showProgress(): void {
  if (!notifier) return;
  const id = notifier.show({
    title: 'Downloading',
    description: 'update-v2.1.0.zip',
    variant: 'progress',
    progress: 0,
    progressLabel: 'Downloading',
  });
  log('updated', `progress started: ${id.slice(0, 8)}`);
  let pct = 0;
  const interval = setInterval(() => {
    pct += 10;
    notifier?.update(id, { progress: pct });
    log('updated', `progress ${pct}%: ${id.slice(0, 8)}`);
    if (pct >= 100) clearInterval(interval);
  }, 500);
}

function loadingToSuccess(): void {
  if (!notifier) return;
  const id = notifier.show({
    title: 'Working…',
    description: 'Starting task',
    variant: 'loading',
    loadingText: 'Starting…',
  });
  log('updated', `loading: ${id.slice(0, 8)}`);
  setTimeout(() => {
    notifier?.close(id);
    notifier?.show({ title: 'Done', description: 'Task completed', variant: 'success', duration: 2500 });
  }, 2000);
}

function progressDemo(): void {
  showProgress();
}

function closeLastNotification(): void {
  const id = shownIds[0];
  if (!id) return;
  notifier?.close(id);
}

function registerActions(): void {
  ipcMain.on('trigger-action', (_event, action: string) => {
    try {
      switch (action) {
        case 'show-default':
          showDefault();
          break;
        case 'show-success':
          showSuccess();
          break;
        case 'show-error':
          showError();
          break;
        case 'show-warning':
          showWarning();
          break;
        case 'show-loading':
          showLoading();
          break;
        case 'show-progress':
          showProgress();
          break;

        case 'theme-dark':
          showTheme('dark');
          break;
        case 'theme-light':
          showTheme('light');
          break;
        case 'theme-auto':
          showTheme('auto');
          break;
        case 'theme-both':
          showBothThemes();
          break;

        case 'pos-topLeft':
          showAtPosition('topLeft');
          break;
        case 'pos-topCenter':
          showAtPosition('topCenter');
          break;
        case 'pos-topRight':
          showAtPosition('topRight');
          break;
        case 'pos-bottomLeft':
          showAtPosition('bottomLeft');
          break;
        case 'pos-bottomCenter':
          showAtPosition('bottomCenter');
          break;
        case 'pos-bottomRight':
          showAtPosition('bottomRight');
          break;

        case 'stack-3':
          stackNotifications(3, 200);
          break;
        case 'stack-5':
          stackNotifications(5, 150);
          break;
        case 'stack-mixed':
          stackMixed();
          break;
        case 'stack-rapid':
          stackNotifications(10, 100);
          break;

        case 'loading-to-success':
          loadingToSuccess();
          break;
        case 'progress-demo':
          progressDemo();
          break;
        case 'long-content':
          showLongContent();
          break;
        case 'no-image':
          showNoImage();
          break;
        case 'with-image':
          showWithImage();
          break;
        case 'sticky':
          showSticky();
          break;
        case 'short-duration':
          showShortDuration();
          break;
        case 'long-duration':
          showLongDuration();
          break;

        case 'close-all':
          notifier?.closeAll();
          break;
        case 'close-last':
          closeLastNotification();
          break;
        default:
          log('error', `Unknown action: ${action}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log('error', msg);
    }
  });
}

app
  .whenReady()
  .then(() => {
    notifier = createNotifier('bottomRight');
    notifiersByPosition.set('bottomRight', notifier);
    createWindow();
    registerActions();
    log('shown', 'Demo ready');
  })
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(err);
    app.quit();
  });

app.on('before-quit', () => {
  for (const n of notifiersByPosition.values()) n.destroy();
  notifier = null;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

