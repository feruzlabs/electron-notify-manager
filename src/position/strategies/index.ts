import type { NotificationPosition } from '../../types';
import type { IPositionStrategy } from './PositionStrategy.interface';
import { BottomCenterStrategy } from './BottomCenterStrategy';
import { BottomLeftStrategy } from './BottomLeftStrategy';
import { BottomRightStrategy } from './BottomRightStrategy';
import { TopCenterStrategy } from './TopCenterStrategy';
import { TopLeftStrategy } from './TopLeftStrategy';
import { TopRightStrategy } from './TopRightStrategy';

export const POSITION_STRATEGIES: Record<NotificationPosition, IPositionStrategy> = {
  topLeft: new TopLeftStrategy(),
  topCenter: new TopCenterStrategy(),
  topRight: new TopRightStrategy(),
  bottomLeft: new BottomLeftStrategy(),
  bottomCenter: new BottomCenterStrategy(),
  bottomRight: new BottomRightStrategy(),
};

