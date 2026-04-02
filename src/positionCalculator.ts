import type { NotificationPosition, PositionCoords } from './types';

type Horizontal = 'left' | 'center' | 'right';
type Vertical = 'top' | 'bottom';

function parsePosition(position: NotificationPosition): { vertical: Vertical; horizontal: Horizontal } {
  const vertical: Vertical = position.startsWith('top') ? 'top' : 'bottom';
  const horizontal: Horizontal = position.endsWith('Left')
    ? 'left'
    : position.endsWith('Center')
      ? 'center'
      : 'right';
  return { vertical, horizontal };
}

export function getBaseX(
  position: NotificationPosition,
  width: number,
  screenWidth: number,
  margin: number
): number {
  const { horizontal } = parsePosition(position);
  if (horizontal === 'left') return margin;
  if (horizontal === 'center') return Math.round((screenWidth - width) / 2);
  return screenWidth - margin - width;
}

export function getYForIndex(
  position: NotificationPosition,
  index: number,
  height: number,
  gap: number,
  margin: number,
  screenHeight: number
): number {
  const { vertical } = parsePosition(position);
  if (vertical === 'top') {
    return margin + index * (height + gap);
  }

  // Bottom stack. Here `index` is top->bottom; the bottom-most item is anchored to the bottom margin.
  // We need the caller to pass the stackCount to compute absolute bottom anchoring, so we encode
  // the bottom anchoring in the manager when iterating.
  // This function is used with an index that is already bottom-anchored (0 = bottom-most).
  return screenHeight - margin - height - index * (height + gap);
}

export function calculateCoordsInWorkArea(args: {
  workArea: { x: number; y: number; width: number; height: number };
  position: NotificationPosition;
  width: number;
  height: number;
  margin: number;
  gap: number;
  indexTopToBottom: number;
  count: number;
}): PositionCoords {
  const { workArea, position, width, height, margin, gap, indexTopToBottom, count } = args;
  const { vertical } = parsePosition(position);

  const baseX = getBaseX(position, width, workArea.width, margin);
  const x = workArea.x + baseX;

  let y: number;
  if (vertical === 'top') {
    y = workArea.y + getYForIndex(position, indexTopToBottom, height, gap, margin, workArea.height);
  } else {
    // bottom-most is anchored; convert top->bottom index to bottom-anchored index
    const bottomAnchoredIndex = (count - 1) - indexTopToBottom;
    y = workArea.y + getYForIndex(position, bottomAnchoredIndex, height, gap, margin, workArea.height);
  }

  return { x: Math.round(x), y: Math.round(y) };
}

