import type { PositionConfig } from '../../src/types';
import { PositionCalculator } from '../../src/position/PositionCalculator';
import { PositionManager } from '../../src/position/PositionManager';
import { BottomCenterStrategy } from '../../src/position/strategies/BottomCenterStrategy';
import { BottomLeftStrategy } from '../../src/position/strategies/BottomLeftStrategy';
import { BottomRightStrategy } from '../../src/position/strategies/BottomRightStrategy';
import { TopCenterStrategy } from '../../src/position/strategies/TopCenterStrategy';
import { TopLeftStrategy } from '../../src/position/strategies/TopLeftStrategy';
import { TopRightStrategy } from '../../src/position/strategies/TopRightStrategy';
import { POSITION_STRATEGIES } from '../../src/position/strategies';

const SCREEN = { width: 1920, height: 1080 };
const CONFIG: PositionConfig = {
  width: 360,
  height: 100,
  margin: 16,
  gap: 10,
  screenWidth: SCREEN.width,
  screenHeight: SCREEN.height,
};

describe('TopRightStrategy', () => {
  const s = new TopRightStrategy();
  it('calculates correct X', () => {
    expect(s.calculateX(CONFIG)).toBe(1920 - 360 - 16);
  });
  it('calculates correct Y index 0', () => {
    expect(s.calculateY(CONFIG, 0)).toBe(16);
  });
  it('calculates correct Y index 1', () => {
    expect(s.calculateY(CONFIG, 1)).toBe(126);
  });
  it('calculates correct Y index 2', () => {
    expect(s.calculateY(CONFIG, 2)).toBe(236);
  });
});

describe('BottomRightStrategy', () => {
  const s = new BottomRightStrategy();
  it('calculates correct X', () => {
    expect(s.calculateX(CONFIG)).toBe(1544);
  });
  it('calculates correct Y index 0', () => {
    expect(s.calculateY(CONFIG, 0)).toBe(1080 - 16 - 1 * 110);
  });
  it('calculates correct Y index 1', () => {
    expect(s.calculateY(CONFIG, 1)).toBe(1080 - 16 - 2 * 110);
  });
  it('stacks upward correctly', () => {
    const y0 = s.calculateY(CONFIG, 0);
    const y1 = s.calculateY(CONFIG, 1);
    expect(y1).toBeLessThan(y0);
    expect(y0 - y1).toBe(110);
  });
});

describe('TopCenterStrategy', () => {
  const s = new TopCenterStrategy();
  it('calculates centered X', () => {
    expect(s.calculateX(CONFIG)).toBe(780);
  });
  it('calculates correct Y', () => {
    expect(s.calculateY(CONFIG, 2)).toBe(236);
  });
});

describe('BottomCenterStrategy', () => {
  const s = new BottomCenterStrategy();
  it('calculates centered X', () => {
    expect(s.calculateX(CONFIG)).toBe(780);
  });
  it('calculates correct Y', () => {
    expect(s.calculateY(CONFIG, 0)).toBe(1080 - 16 - 110);
  });
});

describe('TopLeftStrategy', () => {
  const s = new TopLeftStrategy();
  it('X equals margin', () => {
    expect(s.calculateX(CONFIG)).toBe(16);
  });
  it('Y index 0 equals margin', () => {
    expect(s.calculateY(CONFIG, 0)).toBe(16);
  });
});

describe('BottomLeftStrategy', () => {
  const s = new BottomLeftStrategy();
  it('X equals margin', () => {
    expect(s.calculateX(CONFIG)).toBe(16);
  });
  it('stacks upward correctly', () => {
    const y0 = s.calculateY(CONFIG, 0);
    const y1 = s.calculateY(CONFIG, 1);
    expect(y1).toBeLessThan(y0);
    expect(y0 - y1).toBe(110);
  });
});

describe('PositionCalculator', () => {
  it('delegates to correct strategy for each position', () => {
    const calc = new PositionCalculator();
    for (const pos of Object.keys(POSITION_STRATEGIES) as Array<keyof typeof POSITION_STRATEGIES>) {
      const coords = calc.getCoords(pos, 0, CONFIG);
      expect(typeof coords.x).toBe('number');
      expect(typeof coords.y).toBe('number');
    }
  });
  it('returns PositionCoords with x and y', () => {
    const calc = new PositionCalculator();
    expect(calc.getCoords('topRight', 0, CONFIG)).toEqual({ x: 1544, y: 16 });
  });
});

describe('PositionManager', () => {
  it('assigns index 0 to first item', () => {
    const pm = new PositionManager();
    expect(pm.add('a')).toBe(0);
  });

  it('assigns sequential indexes', () => {
    const pm = new PositionManager();
    expect(pm.add('a')).toBe(0);
    expect(pm.add('b')).toBe(1);
    expect(pm.add('c')).toBe(2);
  });

  it('removes item and reflows correctly', () => {
    const pm = new PositionManager();
    pm.add('a');
    pm.add('b');
    pm.add('c');
    pm.remove('b');
    expect(pm.getIndex('a')).toBe(0);
    expect(pm.getIndex('c')).toBe(1);
  });

  it('reflow returns compact index map', () => {
    const pm = new PositionManager();
    pm.add('a');
    pm.add('b');
    pm.add('c');
    pm.remove('a');
    const map = pm.reflow();
    expect(Array.from(map.values())).toEqual([0, 1]);
  });

  it('getIndex throws for unknown id', () => {
    const pm = new PositionManager();
    expect(() => pm.getIndex('missing')).toThrow();
  });

  it('count returns correct number', () => {
    const pm = new PositionManager();
    pm.add('a');
    pm.add('b');
    expect(pm.count).toBe(2);
  });

  it('clear removes all items', () => {
    const pm = new PositionManager();
    pm.add('a');
    pm.clear();
    expect(pm.count).toBe(0);
  });
});

