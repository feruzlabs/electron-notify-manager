import type { NotificationPosition, PositionConfig, PositionCoords } from '../types';
import { POSITION_STRATEGIES } from './strategies';

export class PositionCalculator {
  public getCoords(position: NotificationPosition, index: number, config: PositionConfig): PositionCoords {
    const strategy = POSITION_STRATEGIES[position];
    return {
      x: strategy.calculateX(config),
      y: strategy.calculateY(config, index),
    };
  }
}

