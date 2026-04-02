# electron-notify-manager

BrowserWindow-based toast notifications for **Electron apps** (not OS native notifications).

## Install

```bash
npm i electron-notify-manager
```

Peer dependency: `electron >= 13`.

## Usage

```js
const { app, BrowserWindow } = require('electron');
const { NotificationManager } = require('electron-notify-manager');

let notifier;

app.whenReady().then(() => {
  // Your app window
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  mainWindow.loadURL('data:text/html,<h1>Electron</h1>');

  notifier = new NotificationManager({
    position: 'bottomRight', // default
    width: 360,
    height: 100,
    margin: 16,
    gap: 10
  });

  const id = notifier.show({
    title: 'TaskEra',
    description: "Mahalla kodlari spravochniginii abs avtomat anketaga qo'sh",
    image: '', // optional
    duration: 4000, // ms, 0 = sticky
    onClick: () => console.log('clicked'),
    onClose: () => console.log('closed')
  });

  // Manual close
  // notifier.close(id);
});
```

## API

### `new NotificationManager(options?)`

- **position**: `topLeft | topCenter | topRight | bottomLeft | bottomCenter | bottomRight` (default `bottomRight`)
- **width**: default `360`
- **height**: default `100`
- **margin**: default `16`
- **gap**: default `10`

### `notifier.show({ title, description, image?, duration?, onClick?, onClose? })`

Returns a **notification ID** string.

### `notifier.close(id)`

Closes a notification (if still active).

### `notifier.closeAll()`

Closes all notifications created by this manager.

## Example app (this repo)

An example Electron app is included under `example/`.

```bash
cd example
npm i
npm start
```

