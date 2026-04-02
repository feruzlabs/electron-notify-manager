jest.mock('electron', () => {
  class BrowserWindowMock {
    public destroyed = false;
    public webContents = { send: jest.fn() };
    public constructor(_opts: unknown) {}
    public isDestroyed(): boolean {
      return this.destroyed;
    }
    public destroy(): void {
      this.destroyed = true;
    }
    public showInactive(): void {
      return;
    }
    public once(_event: string, cb: () => void): void {
      // simulate ready-to-show immediately
      cb();
    }
    public setVisibleOnAllWorkspaces(): void {
      return;
    }
    public setAlwaysOnTop(): void {
      return;
    }
    public loadURL(): void {
      return;
    }
  }
  return {
    BrowserWindow: BrowserWindowMock,
    ipcMain: {
      on: jest.fn(),
      removeListener: jest.fn(),
    },
    nativeTheme: {
      shouldUseDarkColors: false,
      on: jest.fn(),
      off: jest.fn(),
    },
    screen: {
      getPrimaryDisplay: () => ({ workAreaSize: { width: 1920, height: 1080 } }),
    },
  };
});

import type { BrowserWindow } from 'electron';
import { DEFAULTS } from '../../src/constants';
import { ErrorCode, NotificationError } from '../../src/errors';
import type { CloseReason, NotificationItem } from '../../src/types';
import { NotificationQueue } from '../../src/core/NotificationQueue';
import { NotificationManager } from '../../src/core/NotificationManager';

describe('NotificationQueue', () => {
  function makeItem(id: string): NotificationItem {
    return {
      id,
      window: null as unknown as BrowserWindow,
      options: { title: 'T', description: 'D' },
      timer: null,
    };
  }

  it('starts empty', () => {
    const q = new NotificationQueue();
    expect(q.size).toBe(0);
  });

  it('add increases size', () => {
    const q = new NotificationQueue();
    q.add(makeItem('a'));
    expect(q.size).toBe(1);
  });

  it('remove decreases size', () => {
    const q = new NotificationQueue();
    q.add(makeItem('a'));
    q.remove('a');
    expect(q.size).toBe(0);
  });

  it('remove returns removed item', () => {
    const q = new NotificationQueue();
    q.add(makeItem('a'));
    expect(q.remove('a')?.id).toBe('a');
  });

  it('remove returns undefined for missing id', () => {
    const q = new NotificationQueue();
    expect(q.remove('x')).toBeUndefined();
  });

  it('has returns true for existing item', () => {
    const q = new NotificationQueue();
    q.add(makeItem('a'));
    expect(q.has('a')).toBe(true);
  });

  it('has returns false for missing item', () => {
    const q = new NotificationQueue();
    expect(q.has('a')).toBe(false);
  });

  it('getVisible respects maxVisible limit', () => {
    const q = new NotificationQueue(2);
    q.add(makeItem('a'));
    q.add(makeItem('b'));
    q.add(makeItem('c'));
    expect(q.getVisible().map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('getPending returns items beyond maxVisible', () => {
    const q = new NotificationQueue(2);
    q.add(makeItem('a'));
    q.add(makeItem('b'));
    q.add(makeItem('c'));
    expect(q.getPending().map((i) => i.id)).toEqual(['c']);
  });

  it('getAll returns all items regardless of maxVisible', () => {
    const q = new NotificationQueue(2);
    q.add(makeItem('a'));
    q.add(makeItem('b'));
    q.add(makeItem('c'));
    expect(q.getAll().map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('clear empties queue', () => {
    const q = new NotificationQueue();
    q.add(makeItem('a'));
    q.clear();
    expect(q.size).toBe(0);
  });

  it('visibleCount is capped at maxVisible', () => {
    const q = new NotificationQueue(2);
    q.add(makeItem('a'));
    q.add(makeItem('b'));
    q.add(makeItem('c'));
    expect(q.visibleCount).toBe(2);
  });

  it('adding beyond maxVisible goes to pending', () => {
    const q = new NotificationQueue(1);
    q.add(makeItem('a'));
    q.add(makeItem('b'));
    expect(q.getPending().map((i) => i.id)).toEqual(['b']);
  });
});

describe('NotificationManager', () => {
  it('initializes without errors', () => {
    expect(() => new NotificationManager({})).not.toThrow();
  });

  it('show returns a string id', () => {
    const m = new NotificationManager({ maxVisible: DEFAULTS.MAX_VISIBLE });
    const id = m.show({ title: 'T', description: 'D', duration: 0 });
    expect(typeof id).toBe('string');
  });

  it('show validates options — throws on empty title', () => {
    const m = new NotificationManager({});
    expect(() => m.show({ title: '', description: 'D' })).toThrow(NotificationError);
  });

  it('show validates options — throws on missing description', () => {
    const m = new NotificationManager({});
    expect(() => m.show({ title: 'T' } as unknown as { title: string; description: string })).toThrow(NotificationError);
  });

  it('close throws NOTIFICATION_NOT_FOUND for invalid id', () => {
    const m = new NotificationManager({});
    try {
      m.close('nope');
      throw new Error('expected throw');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(NotificationError);
      expect((e as NotificationError).code).toBe(ErrorCode.NOTIFICATION_NOT_FOUND);
    }
  });

  it('update throws NOTIFICATION_NOT_FOUND for invalid id', () => {
    const m = new NotificationManager({});
    try {
      m.update('nope', { description: 'x' });
      throw new Error('expected throw');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(NotificationError);
      expect((e as NotificationError).code).toBe(ErrorCode.NOTIFICATION_NOT_FOUND);
    }
  });

  it('destroy sets isDestroyed flag', () => {
    const m = new NotificationManager({});
    m.destroy();
    try {
      m.show({ title: 'T', description: 'D', duration: 0 });
      throw new Error('expected throw');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(NotificationError);
      expect((e as NotificationError).code).toBe(ErrorCode.MANAGER_DESTROYED);
    }
  });

  it('show throws MANAGER_DESTROYED after destroy()', () => {
    const m = new NotificationManager({});
    m.destroy();
    expect(() => m.show({ title: 'T', description: 'D' })).toThrow(NotificationError);
  });

  it('close throws MANAGER_DESTROYED after destroy()', () => {
    const m = new NotificationManager({});
    m.destroy();
    expect(() => m.close('x')).toThrow(NotificationError);
  });

  it('closeAll destroys all notifications', () => {
    const m = new NotificationManager({});
    const id = m.show({ title: 'T', description: 'D', duration: 0 });
    expect(() => m.closeAll()).not.toThrow();
    expect(() => m.close(id)).toThrow();
  });

  it('emits show event when notification shown', async () => {
    const m = new NotificationManager({});
    const spy = jest.fn();
    m.on('show', spy);
    const id = m.show({ title: 'T', description: 'D', duration: 0 });
    await Promise.resolve();
    expect(spy).toHaveBeenCalledWith(id);
  });

  it('emits close event with reason when closed', async () => {
    jest.useFakeTimers();
    const m = new NotificationManager({});
    const spy = jest.fn();
    m.on('close', spy);
    const id = m.show({ title: 'T', description: 'D', duration: 0 });
    await Promise.resolve();
    m.close(id);
    jest.runOnlyPendingTimers();
    await Promise.resolve();
    expect(spy).toHaveBeenCalled();
    const [calledId, reason] = spy.mock.calls[0] as [string, CloseReason];
    expect(calledId).toBe(id);
    expect(reason).toBe('programmatic');
    jest.useRealTimers();
  });

  it('emits error event on invalid options', () => {
    const m = new NotificationManager({});
    const spy = jest.fn();
    m.on('error', spy);
    try {
      m.show({ title: '', description: 'D' });
    } catch {
      // ignore
    }
    expect(spy).toHaveBeenCalled();
  });
});

