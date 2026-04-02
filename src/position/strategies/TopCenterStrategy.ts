import type { PositionConfig } from '../../types';
import type { IPositionStrategy } from './PositionStrategy.interface';

export class TopCenterStrategy implements IPositionStrategy {
  public calculateX(config: PositionConfig): number {
    return (config.screenWidth - config.width) / 2;
  }

  public calculateY(config: PositionConfig, index: number): number {
    return config.margin + index * (config.height + config.gap);
  }
}

