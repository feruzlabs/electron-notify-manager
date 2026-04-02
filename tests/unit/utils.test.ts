import { generateId, generateShortId } from '../../src/utils/idGenerator';
import { Logger } from '../../src/utils/logger';
import {
  isValidPosition,
  isValidVariant,
  validateManagerOptions,
  validateNotificationOptions,
} from '../../src/utils/validators';

jest.mock('electron', () => {
  const listeners: Array<() => void> = [];
  return {
    nativeTheme: {
      shouldUseDarkColors: true,
      on: (_event: string, cb: () => void) => {
        listeners.push(cb);
      },
      off: (_event: string, cb: () => void) => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      },
      __emit: () => {
        for (const cb of [...listeners]) cb();
      },
    },
  };
});

import { onThemeChange, resolveTheme } from '../../src/utils/themeDetector';
import type { NotificationPosition, NotificationVariant } from '../../src/types';

describe('idGenerator', () => {
  it('generates unique IDs each time', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });

  it('generateShortId returns 8 char string', () => {
    expect(generateShortId()).toHaveLength(8);
  });

  it('generates valid UUID format', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('Logger', () => {
  it('does not log when disabled', () => {
    const logger = new Logger(false);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    logger.info('hi');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs when enabled', () => {
    const logger = new Logger(true);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    logger.info('hi', 1);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('always logs errors regardless of enabled state', () => {
    const logger = new Logger(false);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    logger.error('boom', new Error('x'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('enable/disable toggle works', () => {
    const logger = new Logger(false);
    expect(logger.isEnabled).toBe(false);
    logger.enable();
    expect(logger.isEnabled).toBe(true);
    logger.disable();
    expect(logger.isEnabled).toBe(false);
  });

  it('isEnabled getter returns correct value', () => {
    expect(new Logger(true).isEnabled).toBe(true);
    expect(new Logger(false).isEnabled).toBe(false);
  });
});

describe('validators - validateNotificationOptions', () => {
  it('accepts valid minimal options', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'd' })).not.toThrow();
  });

  it('accepts valid full options', () => {
    expect(() =>
      validateNotificationOptions({
        title: 'Title',
        description: 'Desc',
        image: '/path/to/icon.png',
        duration: 0,
        variant: 'success' as NotificationVariant,
        progress: 100,
        onClick: () => {},
        onClose: () => {},
      }),
    ).not.toThrow();
  });

  it('throws if title missing', () => {
    expect(() => validateNotificationOptions({ description: 'd' })).toThrow();
  });

  it('throws if title empty string', () => {
    expect(() => validateNotificationOptions({ title: '', description: 'd' })).toThrow();
  });

  it('throws if title too long (>100 chars)', () => {
    expect(() => validateNotificationOptions({ title: 'a'.repeat(101), description: 'd' })).toThrow();
  });

  it('throws if description missing', () => {
    expect(() => validateNotificationOptions({ title: 't' })).toThrow();
  });

  it('throws if description empty', () => {
    expect(() => validateNotificationOptions({ title: 't', description: '' })).toThrow();
  });

  it('throws if description too long (>300 chars)', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'a'.repeat(301) })).toThrow();
  });

  it('throws if duration negative', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'd', duration: -1 })).toThrow();
  });

  it('throws if duration not a number', () => {
    expect(() =>
      validateNotificationOptions({ title: 't', description: 'd', duration: 'x' as unknown as number }),
    ).toThrow();
  });

  it('accepts duration 0 as sticky', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'd', duration: 0 })).not.toThrow();
  });

  it('throws if progress < 0', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'd', progress: -1 })).toThrow();
  });

  it('throws if progress > 100', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'd', progress: 101 })).toThrow();
  });

  it('accepts progress 0', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'd', progress: 0 })).not.toThrow();
  });

  it('accepts progress 100', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'd', progress: 100 })).not.toThrow();
  });

  it('throws if image is not a string', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'd', image: 1 as unknown as string })).toThrow();
  });

  it('throws if image is empty string', () => {
    expect(() => validateNotificationOptions({ title: 't', description: 'd', image: '' })).toThrow();
  });
});

describe('validators - validateManagerOptions', () => {
  it('accepts empty options object', () => {
    expect(() => validateManagerOptions({})).not.toThrow();
  });

  it('throws if width is 0', () => {
    expect(() => validateManagerOptions({ width: 0 })).toThrow();
  });

  it('throws if width is negative', () => {
    expect(() => validateManagerOptions({ width: -1 })).toThrow();
  });

  it('throws if height is negative', () => {
    expect(() => validateManagerOptions({ height: -1 })).toThrow();
  });

  it('throws if margin is negative', () => {
    expect(() => validateManagerOptions({ margin: -1 })).toThrow();
  });

  it('throws if invalid position string', () => {
    expect(() => validateManagerOptions({ position: 'nope' })).toThrow();
  });

  it('accepts all 6 valid positions', () => {
    const positions: NotificationPosition[] = [
      'topLeft',
      'topCenter',
      'topRight',
      'bottomLeft',
      'bottomCenter',
      'bottomRight',
    ];
    for (const p of positions) {
      expect(() => validateManagerOptions({ position: p })).not.toThrow();
    }
  });
});

describe('validators - isValidPosition', () => {
  it('returns true for all 6 valid positions', () => {
    const positions: NotificationPosition[] = [
      'topLeft',
      'topCenter',
      'topRight',
      'bottomLeft',
      'bottomCenter',
      'bottomRight',
    ];
    for (const p of positions) expect(isValidPosition(p)).toBe(true);
  });

  it('returns false for invalid string', () => {
    expect(isValidPosition('nope')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isValidPosition(null)).toBe(false);
    expect(isValidPosition(undefined)).toBe(false);
  });

  it('returns false for number', () => {
    expect(isValidPosition(1)).toBe(false);
  });
});

describe('validators - isValidVariant', () => {
  it('returns true for all 6 valid variants', () => {
    const variants: NotificationVariant[] = ['default', 'success', 'error', 'warning', 'loading', 'progress'];
    for (const v of variants) expect(isValidVariant(v)).toBe(true);
  });

  it('returns false for invalid string', () => {
    expect(isValidVariant('nope')).toBe(false);
  });
});

describe('themeDetector', () => {
  it('resolveTheme should map auto based on nativeTheme', () => {
    expect(resolveTheme('auto')).toBe('dark');
  });

  it('onThemeChange returns unsubscribe and calls callback on update', () => {
    const cb = jest.fn();
    const unsubscribe = onThemeChange(cb);
    const electron = require('electron') as { nativeTheme: { __emit: () => void } };
    electron.nativeTheme.__emit();
    expect(cb).toHaveBeenCalledWith('dark');
    unsubscribe();
  });
});

