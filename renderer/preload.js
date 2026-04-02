/* eslint-disable */
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronNotify', {
  sendClose: (id) => ipcRenderer.send('notification-close', id),
  sendClick: (id) => ipcRenderer.send('notification-click', id),
  onReposition: (handler) => {
    ipcRenderer.on('notification-reposition', (_event, payload) => {
      if (!payload || typeof payload !== 'object') return;
      if (typeof payload.id !== 'string') return;
      if (typeof payload.y !== 'number') return;
      handler({ id: payload.id, y: payload.y });
    });
  }
});

