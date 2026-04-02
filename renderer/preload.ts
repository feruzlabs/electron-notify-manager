import { contextBridge, ipcRenderer } from 'electron';

const IPC_CHANNELS = {
  NOTIFICATION_CLOSE: 'notification:close',
  NOTIFICATION_CLICK: 'notification:click',
  NOTIFICATION_REPOSITION: 'notification:reposition',
  NOTIFICATION_UPDATE: 'notification:update',
  NOTIFICATION_THEME: 'notification:theme',
} as const;

export interface RendererApi {
  sendClose: (id: string) => void;
  sendClick: (id: string) => void;
  onReposition: (handler: (payload: { id: string; y: number }) => void) => void;
  onUpdate: (handler: (payload: { id: string; updates: { progress?: number; loadingText?: string; description?: string } }) => void) => void;
  onTheme: (handler: (payload: { theme: 'dark' | 'light' }) => void) => void;
}

const api: RendererApi = {
  sendClose: (id: string) => ipcRenderer.send(IPC_CHANNELS.NOTIFICATION_CLOSE, id),
  sendClick: (id: string) => ipcRenderer.send(IPC_CHANNELS.NOTIFICATION_CLICK, id),
  onReposition: (handler) => {
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_REPOSITION, (_event, payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return;
      const maybe = payload as { id?: unknown; y?: unknown };
      if (typeof maybe.id !== 'string') return;
      if (typeof maybe.y !== 'number') return;
      handler({ id: maybe.id, y: maybe.y });
    });
  },
  onUpdate: (handler) => {
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_UPDATE, (_event, payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return;
      const maybe = payload as { id?: unknown; updates?: unknown };
      if (typeof maybe.id !== 'string') return;
      if (typeof maybe.updates !== 'object' || maybe.updates === null) return;
      const u = maybe.updates as { progress?: unknown; loadingText?: unknown; description?: unknown };
      const updates: { progress?: number; loadingText?: string; description?: string } = {};
      if (typeof u.progress === 'number') updates.progress = u.progress;
      if (typeof u.loadingText === 'string') updates.loadingText = u.loadingText;
      if (typeof u.description === 'string') updates.description = u.description;
      handler({ id: maybe.id, updates });
    });
  },
  onTheme: (handler) => {
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_THEME, (_event, payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return;
      const maybe = payload as { theme?: unknown };
      if (maybe.theme !== 'dark' && maybe.theme !== 'light') return;
      handler({ theme: maybe.theme });
    });
  },
};

contextBridge.exposeInMainWorld('electronNotify', api);

