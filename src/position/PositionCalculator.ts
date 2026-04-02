import { ErrorCode, NotificationError } from '../errors';
import type { NotificationPosition, PositionCoords, WorkArea } from '../types/position.types';

export interface PositionConfig {
  position: NotificationPosition;
  width: number;
  height: number;
  margin: number;
  gap: number;
  workArea: WorkArea;
  indexTopToBottom: number;
  count: number;
}

export interface PositionStrategy {
  calculateX(config: PositionConfig): number;
  calculateY(config: PositionConfig): number;
}

function isTop(position: NotificationPosition): boolean {
  return position.startsWith('top');
}

function isLeft(position: NotificationPosition): boolean {
  return position.endsWith('Left');
}

function isCenter(position: NotificationPosition): boolean {
  return position.endsWith('Center');
}

function isRight(position: NotificationPosition): boolean {
  return position.endsWith('Right');
}

abstract class BaseStrategy implements PositionStrategy {
  public calculateX(config: PositionConfig): number {
    if (isLeft(config.position)) return config.workArea.x + config.margin;
    if (isCenter(config.position)) {
      return config.workArea.x + Math.round((config.workArea.width - config.width) / 2);
    }
    if (isRight(config.position)) return config.workArea.x + config.workArea.width - config.margin - config.width;
    throw new NotificationError(`Invalid position: ${String(config.position)}`, ErrorCode.INVALID_POSITION);
  }

  public abstract calculateY(config: PositionConfig): number;
}

class TopStrategy extends BaseStrategy {
  public calculateY(config: PositionConfig): number {
    return config.workArea.y + config.margin + config.indexTopToBottom * (config.height + config.gap);
  }
}

class BottomStrategy extends BaseStrategy {
  public calculateY(config: PositionConfig): number {
    const bottomAnchoredIndex = (config.count - 1) - config.indexTopToBottom;
    return (
      config.workArea.y +
      config.workArea.height -
      config.margin -
      config.height -
      bottomAnchoredIndex * (config.height + config.gap)
    );
  }
}

export class PositionCalculator {
  private readonly strategies: ReadonlyMap<NotificationPosition, PositionStrategy>;

  public constructor() {
    const top = new TopStrategy();
    const bottom = new BottomStrategy();

    this.strategies = new Map<NotificationPosition, PositionStrategy>([
      ['topLeft', top],
      ['topCenter', top],
      ['topRight', top],
      ['bottomLeft', bottom],
      ['bottomCenter', bottom],
      ['bottomRight', bottom],
    ]);
  }

  public calculate(config: PositionConfig): PositionCoords {
    const strategy = this.strategies.get(config.position);
    if (!strategy) {
      throw new NotificationError(`Invalid position: ${String(config.position)}`, ErrorCode.INVALID_POSITION);
    }

    if (config.count <= 0) {
      throw new NotificationError('count must be > 0', ErrorCode.POSITION_CALCULATION_FAILED);
    }
    if (config.indexTopToBottom < 0 || config.indexTopToBottom >= config.count) {
      throw new NotificationError('indexTopToBottom out of range', ErrorCode.POSITION_CALCULATION_FAILED);
    }

    const x = strategy.calculateX(config);
    const y = strategy.calculateY(config);
    return { x: Math.round(x), y: Math.round(y) };
  }

  public isTopStack(position: NotificationPosition): boolean {
    return isTop(position);
  }
}

