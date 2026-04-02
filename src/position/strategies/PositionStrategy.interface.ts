import type { PositionConfig } from '../../types';

export interface IPositionStrategy {
  calculateX(config: PositionConfig): number;
  calculateY(config: PositionConfig, index: number): number;
}

