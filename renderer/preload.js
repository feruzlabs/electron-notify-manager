/* eslint-disable */
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronNotify', {
  sendClose: (id) => ipcRenderer.send('notification:close', id),
  sendClick: (id) => ipcRenderer.send('notification:click', id),
  onReposition: (handler) => {
    ipcRenderer.on('notification:reposition', (_event, payload) => {
      if (!payload || typeof payload !== 'object') return;
      if (typeof payload.id !== 'string') return;
      if (typeof payload.y !== 'number') return;
      handler({ id: payload.id, y: payload.y });
    });
  },
  onUpdate: (handler) => {
    ipcRenderer.on('notification:update', (_event, payload) => {
      if (!payload || typeof payload !== 'object') return;
      if (typeof payload.id !== 'string') return;
      if (!payload.updates || typeof payload.updates !== 'object') return;
      const u = payload.updates;
      const updates = {};
      if (typeof u.progress === 'number') updates.progress = u.progress;
      if (typeof u.loadingText === 'string') updates.loadingText = u.loadingText;
      if (typeof u.description === 'string') updates.description = u.description;
      handler({ id: payload.id, updates });
    });
  },
  onTheme: (handler) => {
    ipcRenderer.on('notification:theme', (_event, payload) => {
      if (!payload || typeof payload !== 'object') return;
      if (payload.theme !== 'dark' && payload.theme !== 'light') return;
      handler({ theme: payload.theme });
    });
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  notifyClose: (id, reason) => ipcRenderer.send('notification:close', id, reason),
  notifyClick: (id) => ipcRenderer.send('notification:click', id),
  onReposition: (handler) => {
    ipcRenderer.on('notification:reposition', (_event, payload) => {
      if (!payload || typeof payload !== 'object') return;
      if (typeof payload.y !== 'number') return;
      handler(payload.y);
    });
  },
  onUpdate: (handler) => {
    ipcRenderer.on('notification:update', (_event, payload) => {
      if (!payload || typeof payload !== 'object') return;
      if (typeof payload.id !== 'string') return;
      if (!payload.updates || typeof payload.updates !== 'object') return;
      const u = payload.updates;
      const updates = {};
      if (typeof u.progress === 'number') updates.progress = u.progress;
      if (typeof u.loadingText === 'string') updates.loadingText = u.loadingText;
      if (typeof u.description === 'string') updates.description = u.description;
      handler({ id: payload.id, updates });
    });
  },
  onForceClose: (handler) => {
    ipcRenderer.on('notification:force-close', () => handler());
  },
});

