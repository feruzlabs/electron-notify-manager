import { contextBridge, ipcRenderer } from 'electron';

export interface RendererApi {
  sendClose: (id: string) => void;
  sendClick: (id: string) => void;
  onReposition: (handler: (payload: { id: string; y: number }) => void) => void;
}

const api: RendererApi = {
  sendClose: (id: string) => ipcRenderer.send('notification-close', id),
  sendClick: (id: string) => ipcRenderer.send('notification-click', id),
  onReposition: (handler) => {
    ipcRenderer.on('notification-reposition', (_event, payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return;
      const maybe = payload as { id?: unknown; y?: unknown };
      if (typeof maybe.id !== 'string') return;
      if (typeof maybe.y !== 'number') return;
      handler({ id: maybe.id, y: maybe.y });
    });
  }
};

contextBridge.exposeInMainWorld('electronNotify', api);

