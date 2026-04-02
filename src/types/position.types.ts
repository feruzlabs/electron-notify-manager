export type NotificationPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

export interface PositionCoords {
  x: number;
  y: number;
}

export interface WorkArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

