import { PositionCalculator } from '../../src/position/PositionCalculator';
import type { PositionConfig } from '../../src/position/PositionCalculator';
import { ErrorCode, NotificationError } from '../../src/errors';

function cfg(overrides: Partial<PositionConfig>): PositionConfig {
  return {
    position: 'topRight',
    width: 360,
    height: 100,
    margin: 16,
    gap: 10,
    workArea: { x: 0, y: 0, width: 1000, height: 800 },
    indexTopToBottom: 0,
    count: 1,
    ...overrides,
  };
}

describe('PositionCalculator', () => {
  it('should calculate correct X for topRight position', () => {
    const pc = new PositionCalculator();
    const { x } = pc.calculate(cfg({ position: 'topRight' }));
    expect(x).toBe(1000 - 16 - 360);
  });

  it('should calculate topCenter X correctly', () => {
    const pc = new PositionCalculator();
    const { x } = pc.calculate(cfg({ position: 'topCenter' }));
    expect(x).toBe(Math.round((1000 - 360) / 2));
  });

  it('should calculate bottomCenter X correctly', () => {
    const pc = new PositionCalculator();
    const { x } = pc.calculate(cfg({ position: 'bottomCenter' }));
    expect(x).toBe(Math.round((1000 - 360) / 2));
  });

  it('should calculate correct Y for index 0 (top)', () => {
    const pc = new PositionCalculator();
    const { y } = pc.calculate(cfg({ position: 'topRight', indexTopToBottom: 0, count: 3 }));
    expect(y).toBe(16);
  });

  it('should stack notifications correctly (top)', () => {
    const pc = new PositionCalculator();
    const y0 = pc.calculate(cfg({ position: 'topRight', indexTopToBottom: 0, count: 3 })).y;
    const y1 = pc.calculate(cfg({ position: 'topRight', indexTopToBottom: 1, count: 3 })).y;
    const y2 = pc.calculate(cfg({ position: 'topRight', indexTopToBottom: 2, count: 3 })).y;
    expect([y0, y1, y2]).toEqual([16, 16 + 110, 16 + 220]);
  });

  it('should stack notifications correctly (bottom)', () => {
    const pc = new PositionCalculator();
    const yTop = pc.calculate(cfg({ position: 'bottomRight', indexTopToBottom: 0, count: 3 })).y;
    const yMid = pc.calculate(cfg({ position: 'bottomRight', indexTopToBottom: 1, count: 3 })).y;
    const yBot = pc.calculate(cfg({ position: 'bottomRight', indexTopToBottom: 2, count: 3 })).y;
    expect(yBot).toBe(800 - 16 - 100);
    expect(yMid).toBe(yBot - 110);
    expect(yTop).toBe(yMid - 110);
  });

  it('should reflow after removing middle notification (top)', () => {
    const pc = new PositionCalculator();
    const before = [
      pc.calculate(cfg({ position: 'topRight', indexTopToBottom: 0, count: 3 })).y,
      pc.calculate(cfg({ position: 'topRight', indexTopToBottom: 1, count: 3 })).y,
      pc.calculate(cfg({ position: 'topRight', indexTopToBottom: 2, count: 3 })).y,
    ];
    // Remove middle => remaining count=2; old index 2 becomes index 1
    const after = [
      pc.calculate(cfg({ position: 'topRight', indexTopToBottom: 0, count: 2 })).y,
      pc.calculate(cfg({ position: 'topRight', indexTopToBottom: 1, count: 2 })).y,
    ];
    expect(before).toEqual([16, 126, 236]);
    expect(after).toEqual([16, 126]);
  });

  it('should throw NotificationError for invalid position', () => {
    const pc = new PositionCalculator();
    const bad = cfg({ position: 'topRight' });
    const config = { ...bad, position: 'middleCenter' as unknown as PositionConfig['position'] };
    expect(() => pc.calculate(config)).toThrow(NotificationError);
    try {
      pc.calculate(config);
    } catch (e: unknown) {
      const err = e as NotificationError;
      expect(err.code).toBe(ErrorCode.INVALID_POSITION);
    }
  });

  it('should throw when count <= 0', () => {
    const pc = new PositionCalculator();
    expect(() => pc.calculate(cfg({ count: 0 }))).toThrow(NotificationError);
  });

  it('should throw when indexTopToBottom out of range', () => {
    const pc = new PositionCalculator();
    expect(() => pc.calculate(cfg({ count: 1, indexTopToBottom: 1 }))).toThrow(NotificationError);
    expect(() => pc.calculate(cfg({ count: 1, indexTopToBottom: -1 }))).toThrow(NotificationError);
  });

  it('isTopStack should return true for top positions and false for bottom', () => {
    const pc = new PositionCalculator();
    expect(pc.isTopStack('topLeft')).toBe(true);
    expect(pc.isTopStack('bottomLeft')).toBe(false);
  });
});

