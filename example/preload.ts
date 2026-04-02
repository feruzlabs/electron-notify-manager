import { contextBridge, ipcRenderer } from 'electron';

export type LogType = 'shown' | 'closed' | 'updated' | 'click' | 'error';

export interface LogEntry {
  type: LogType;
  message: string;
  timestamp: number;
}

export type Action =
  | 'show-default'
  | 'show-success'
  | 'show-error'
  | 'show-warning'
  | 'show-loading'
  | 'show-progress'
  | 'theme-dark'
  | 'theme-light'
  | 'theme-auto'
  | 'theme-both'
  | 'pos-topLeft'
  | 'pos-topCenter'
  | 'pos-topRight'
  | 'pos-bottomLeft'
  | 'pos-bottomCenter'
  | 'pos-bottomRight'
  | 'stack-3'
  | 'stack-5'
  | 'stack-mixed'
  | 'stack-rapid'
  | 'loading-to-success'
  | 'progress-demo'
  | 'long-content'
  | 'no-image'
  | 'with-image'
  | 'sticky'
  | 'short-duration'
  | 'long-duration'
  | 'close-all'
  | 'close-last';

export interface ElectronApi {
  trigger: (action: string | null) => void;
  onLog: (handler: (entry: LogEntry) => void) => () => void;
}

const api: ElectronApi = {
  trigger: (action) => {
    if (typeof action !== 'string' || action.trim().length === 0) return;
    ipcRenderer.send('trigger-action', action);
  },
  onLog: (handler) => {
    const listener = (_event: Electron.IpcRendererEvent, entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) return;
      const e = entry as { type?: unknown; message?: unknown; timestamp?: unknown };
      if (
        e.type !== 'shown' &&
        e.type !== 'closed' &&
        e.type !== 'updated' &&
        e.type !== 'click' &&
        e.type !== 'error'
      ) {
        return;
      }
      if (typeof e.message !== 'string') return;
      if (typeof e.timestamp !== 'number') return;
      handler({ type: e.type, message: e.message, timestamp: e.timestamp });
    };
    ipcRenderer.on('log-entry', listener);
    return () => ipcRenderer.off('log-entry', listener);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}

