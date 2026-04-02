export const IPC_CHANNELS = {
  NOTIFICATION_CLOSE: 'notification:close',
  NOTIFICATION_CLICK: 'notification:click',
  NOTIFICATION_REPOSITION: 'notification:reposition',
  NOTIFICATION_READY: 'notification:ready',
  NOTIFICATION_UPDATE: 'notification:update',
  NOTIFICATION_FORCE_CLOSE: 'notification:force-close',

  // kept for compatibility with existing code paths
  NOTIFICATION_THEME: 'notification:theme',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

