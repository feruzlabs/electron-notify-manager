import type { PositionConfig } from '../../types';
import type { IPositionStrategy } from './PositionStrategy.interface';

export class TopLeftStrategy implements IPositionStrategy {
  public calculateX(config: PositionConfig): number {
    return config.margin;
  }

  public calculateY(config: PositionConfig, index: number): number {
    return config.margin + index * (config.height + config.gap);
  }
}

