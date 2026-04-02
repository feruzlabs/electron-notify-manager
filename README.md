# electron-notify-manager

In-app toast notifications for Electron using `BrowserWindow` (not OS native notifications).

## Install

```bash
npm i electron-notify-manager
```

- **Peer dependency**: `electron >= 13`
- **Runtime**: main process only (creates `BrowserWindow` instances)

## Quick Start

```ts
import { app, BrowserWindow } from 'electron';
import { NotificationManager } from 'electron-notify-manager';

let notifier: NotificationManager | null = null;

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({ width: 900, height: 650 });
  void win.loadURL('data:text/html,<h1>Electron</h1>');
  return win;
}

app
  .whenReady()
  .then(() => {
    createMainWindow();

    notifier = new NotificationManager({ position: 'topRight' });

    notifier.show({
      title: 'Update available',
      description: 'Version 2.1.0 is ready to install',
      variant: 'default',
      duration: 4000,
    });
  })
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(err);
    app.quit();
  });

app.on('before-quit', () => {
  notifier?.destroy();
  notifier = null;
});
```

## 9. Stacking & Queue

`NotificationManager` keeps a per-display stack ordered **newest → oldest**. When `maxVisible` is reached, new notifications are **queued** (IDs are returned immediately, but no `BrowserWindow` is created until a slot is available). When a visible notification closes, the manager **promotes** the next queued notification and then **reflows** all visible windows to close the gap.

Reflow means recalculating each visible notification’s \(x, y\) based on the target display’s `workArea`, `position`, `margin`, `gap`, and the item’s index in the visible stack. Existing windows move with an animation; the newly promoted window animates in from the left or right edge depending on the configured position.

```ts
import { app, BrowserWindow } from 'electron';
import { NotificationManager } from 'electron-notify-manager';

let notifier: NotificationManager | null = null;

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 900, height: 650 });
  void win.loadURL('data:text/html,<h1>Stacking demo</h1>');

  notifier = new NotificationManager({
    position: 'bottomRight',
    maxVisible: 3, // show max 3 at once, rest queue
    gap: 10, // px between notifications
    margin: 16, // px from screen edge
  });

  for (let i = 1; i <= 8; i += 1) {
    notifier.show({
      title: `Queued toast #${i}`,
      description: 'Close one and the next will be promoted.',
      variant: i % 2 === 0 ? 'success' : 'default',
      duration: 2500,
    });
  }
});

app.on('before-quit', () => {
  notifier?.destroy();
  notifier = null;
});
```

## 10. Configuration Reference

`NotificationManagerOptions` passed to `new NotificationManager(options)`.

| Option      | Type                   | Default         | Description                                      |
|-------------|------------------------|-----------------|--------------------------------------------------|
| position    | `NotificationPosition` | `'bottomRight'` | Screen position                                  |
| width       | `number`               | `360`           | Window width in px                               |
| height      | `number`               | `100`           | Window height in px                              |
| margin      | `number`               | `16`            | Distance from screen edge in px                  |
| gap         | `number`               | `10`            | Gap between notifications in px                  |
| maxVisible  | `number`               | `5`             | Max visible at once (rest queue)                 |
| debug       | `boolean`              | `false`         | Enable debug logging (reserved for future use)   |

**Position values** (`NotificationPosition`):

- `topLeft` | `topCenter` | `topRight`
- `bottomLeft` | `bottomCenter` | `bottomRight`

## 11. NotificationOptions Reference

Options passed to `notifier.show(options)`.

| Option         | Type                                              | Default       | Description                                                                 |
|----------------|---------------------------------------------------|---------------|-----------------------------------------------------------------------------|
| title          | `string`                                          | —             | Required. Title text                                                        |
| description    | `string`                                          | —             | Required. Body text                                                         |
| image          | `string`                                          | —             | Absolute path to an image file (PNG/JPG/SVG). If omitted, uses built-in icon |
| duration       | `number`                                          | `4000`        | Duration in ms. `0` disables auto-close                                     |
| variant        | `'default' \| 'success' \| 'error' \| 'warning' \| 'loading' \| 'progress'` | `'default'` | Visual style and behavior                                                   |
| theme          | `'dark' \| 'light' \| 'auto'`                     | `'auto'`      | Theme mode (`auto` follows system theme)                                    |
| progress       | `number`                                          | —             | `progress` variant only. 0–100                                              |
| progressLabel  | `string`                                          | —             | `progress` variant only. Label shown next to progress                        |
| loadingText    | `string`                                          | —             | `loading` variant only. Secondary text                                      |
| onClick        | `() => void`                                      | —             | Callback invoked when user clicks the notification                           |
| onClose        | `() => void`                                      | —             | Callback invoked when the notification is dismissed                          |

## 12. Events

`NotificationManager` is an `EventEmitter`.

```ts
import { app, BrowserWindow } from 'electron';
import { NotificationManager } from 'electron-notify-manager';
import type { CloseReason } from 'electron-notify-manager/dist/types';

let notifier: NotificationManager | null = null;

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 900, height: 650 });
  void win.loadURL('data:text/html,<h1>Events demo</h1>');

  notifier = new NotificationManager({ position: 'bottomRight' });

  notifier.on('show', (id: string) => {
    // Fired when the notification is actually shown (not when queued).
    // eslint-disable-next-line no-console
    console.log('Notification shown:', id);
  });

  notifier.on('close', (id: string, reason: CloseReason) => {
    // reason: 'duration' | 'user' | 'programmatic' | 'app-quit'
    // eslint-disable-next-line no-console
    console.log('Closed:', id, 'reason:', reason);
  });

  notifier.on('click', (id: string) => {
    // eslint-disable-next-line no-console
    console.log('Clicked:', id);
  });

  notifier.show({
    title: 'Events wired',
    description: 'Click or wait for auto-close.',
    variant: 'default',
    duration: 4000,
  });
});

app.on('before-quit', () => {
  notifier?.destroy();
  notifier = null;
});
```

## 13. Callbacks

Callbacks are configured per-notification via `onClick` and `onClose`.

```ts
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { NotificationManager } from 'electron-notify-manager';

let notifier: NotificationManager | null = null;

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 900, height: 650 });
  void win.loadURL('data:text/html,<h1>Callbacks demo</h1>');

  notifier = new NotificationManager({ position: 'bottomRight' });

  const filePath = path.join(process.cwd(), 'document.pdf');

  notifier.show({
    title: 'File saved',
    description: 'document.pdf',
    variant: 'success',
    duration: 5000,
    onClick: () => {
      void shell.showItemInFolder(filePath);
    },
    onClose: () => {
      // eslint-disable-next-line no-console
      console.log('notification dismissed');
    },
  });
});

app.on('before-quit', () => {
  notifier?.destroy();
  notifier = null;
});
```

## 14. Custom Image

```ts
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { NotificationManager } from 'electron-notify-manager';

let notifier: NotificationManager | null = null;

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 900, height: 650 });
  void win.loadURL('data:text/html,<h1>Image demo</h1>');

  notifier = new NotificationManager({ position: 'bottomRight' });

  notifier.show({
    title: 'TaskEra',
    description: 'New message received',
    image: path.join(__dirname, 'assets', 'icon.png'),
    variant: 'default',
    duration: 5000,
  });
});

app.on('before-quit', () => {
  notifier?.destroy();
  notifier = null;
});
```

Note: If no `image` is provided, the renderer uses a built-in SVG icon for the chosen `variant`.

## 15. Sticky Notifications

```ts
import { app, BrowserWindow } from 'electron';
import { NotificationManager } from 'electron-notify-manager';

let notifier: NotificationManager | null = null;

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 900, height: 650 });
  void win.loadURL('data:text/html,<h1>Sticky demo</h1>');

  notifier = new NotificationManager({ position: 'bottomRight' });

  // duration: 0 = never auto-closes
  const id = notifier.show({
    title: 'Action required',
    description: 'Please review the pending changes.',
    variant: 'warning',
    duration: 0,
  });

  // Close programmatically when ready
  setTimeout(() => {
    notifier?.close(id);
  }, 4000);
});

app.on('before-quit', () => {
  notifier?.destroy();
  notifier = null;
});
```

## 16. Cleanup

```ts
import { app, BrowserWindow } from 'electron';
import { NotificationManager } from 'electron-notify-manager';

let notifier: NotificationManager | null = null;

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 900, height: 650 });
  void win.loadURL('data:text/html,<h1>Cleanup demo</h1>');

  notifier = new NotificationManager({ position: 'bottomRight' });
  notifier.show({ title: 'Ready', description: 'App is running', variant: 'default', duration: 2000 });
});

app.on('before-quit', () => {
  notifier?.destroy(); // closes all windows, removes IPC listeners
  notifier = null;
});
```

## 17. How It Works

Each notification is its own `BrowserWindow`, configured as transparent, frameless, and always-on-top so it behaves like an in-app toast rather than a normal window. The main process computes the window coordinates from the target display’s `workArea` and the configured `position`, `margin`, and `gap`. The renderer controls visuals (icons, theme, and CSS animations), while the main process owns window lifecycle and positioning. The two sides communicate using Electron IPC to handle click/close events, theme updates in `auto` mode, and reposition requests during stacking changes.

## Example app (in this repo)

This package includes a demo under `example/`.

```bash
cd example
npm i
npm start
```

## 18. License

MIT

