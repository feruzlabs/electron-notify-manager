import type { NotificationItem } from '../../src/types/notification.types';

export function createMockItem(id: string): NotificationItem {
  const windowMock = { webContents: { id: 1 } } as unknown as NotificationItem['window'];
  return {
    id,
    window: windowMock,
    options: { title: 't', description: 'd' },
    timer: null,
  };
}

