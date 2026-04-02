import type { PositionConfig } from '../../src/types';
import { PositionCalculator } from '../../src/position/PositionCalculator';

const CONFIG: PositionConfig = {
  width: 360,
  height: 100,
  margin: 16,
  gap: 10,
  screenWidth: 1000,
  screenHeight: 800,
};

describe('PositionCalculator (strategy-based)', () => {
  it('computes topRight coords', () => {
    const pc = new PositionCalculator();
    expect(pc.getCoords('topRight', 0, CONFIG)).toEqual({ x: 1000 - 360 - 16, y: 16 });
  });

  it('computes bottomRight coords for index 0', () => {
    const pc = new PositionCalculator();
    // 800 - 16 - 1*(100+10) = 674
    expect(pc.getCoords('bottomRight', 0, CONFIG).y).toBe(800 - 16 - 110);
  });
});

