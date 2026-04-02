import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';

import { NotificationManager } from 'electron-notify-manager';
import type { CloseReason } from 'electron-notify-manager/dist/types';

// Workaround for some Windows GPU driver / VM / RDP setups where
// Chromium's GPU process crashes on startup (exit_code=34).
app.disableHardwareAcceleration();

let mainWindow: BrowserWindow | null = null;

const notifier = new NotificationManager({
  position: 'bottomRight',
  width: 360,
  height: 100,
  margin: 16,
  gap: 10,
});

// EventEmitter pattern
notifier.on('show', (id: string) => {
  // eslint-disable-next-line no-console
  console.log(`Notification shown: ${id}`);
});

notifier.on('close', (id: string, reason: CloseReason) => {
  // eslint-disable-next-line no-console
  console.log(`Notification closed: ${id}, reason: ${reason}`);
});

notifier.on('click', (id: string) => {
  // eslint-disable-next-line no-console
  console.log(`Notification clicked: ${id}`);
});

notifier.on('error', (error: Error) => {
  // eslint-disable-next-line no-console
  console.error(`Error: ${error.message}`);
});

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    backgroundColor: '#0b0e14',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  void mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app
  .whenReady()
  .then(() => {
    createWindow();

    ipcMain.handle('demo-show', () => {
      try {
        return notifier.show({
          title: 'TaskEra',
          description: "Mahalla kodlari spravochniginii abs avtomat anketaga qo'sh",
          duration: 4000,
        });
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error);
        return null;
      }
    });

    ipcMain.handle('demo-show-sticky', () => {
      try {
        return notifier.show({
          title: 'Sticky Notification',
          description: 'This will not auto-close. Click X to dismiss.',
          duration: 0,
        });
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error);
        return null;
      }
    });

    ipcMain.handle('demo-show-image', () => {
      try {
        // SVG is a real file we ship in this example (no binary assets needed).
        const imagePath = path.join(__dirname, '..', 'assets', 'icon.svg');
        return notifier.show({
          title: 'With Image',
          description: 'This notification has a custom image.',
          image: imagePath,
          duration: 5000,
        });
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error);
        return null;
      }
    });

    ipcMain.handle('demo-close-all', () => {
      try {
        notifier.closeAll();
        return true;
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error);
        return false;
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  })
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error);
    app.quit();
  });

app.on('before-quit', () => {
  notifier.destroy();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

