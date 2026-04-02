import { DEFAULTS, VALID_POSITIONS, VALID_THEME_MODES, VALID_VARIANTS } from '../constants';
import { ErrorCode, NotificationError } from '../errors';
import type { NotificationManagerOptions } from '../types/config.types';
import type { NotificationOptions } from '../types/notification.types';
import type { NotificationPosition } from '../types/position.types';
import type { NotificationVariant, ThemeMode } from '../types/theme.types';

export function isValidPosition(value: unknown): value is NotificationPosition {
  return typeof value === 'string' && (VALID_POSITIONS as readonly string[]).includes(value);
}

export function isValidVariant(value: unknown): value is NotificationVariant {
  return typeof value === 'string' && (VALID_VARIANTS as readonly string[]).includes(value);
}

export function isValidThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (VALID_THEME_MODES as readonly string[]).includes(value);
}

function assertNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new NotificationError(`${name} must be a finite number`, ErrorCode.INVALID_OPTIONS);
  }
}

function assertNonNegativeInt(name: string, value: unknown): void {
  assertNumber(name, value);
  if (value < 0) {
    throw new NotificationError(`${name} must be >= 0`, ErrorCode.INVALID_OPTIONS);
  }
  if (!Number.isInteger(value)) {
    throw new NotificationError(`${name} must be an integer`, ErrorCode.INVALID_OPTIONS);
  }
}

export function validateManagerOptions(options: unknown): asserts options is NotificationManagerOptions {
  if (typeof options !== 'object' || options === null) {
    throw new NotificationError('Manager options must be an object', ErrorCode.INVALID_OPTIONS);
  }
  const o = options as Record<string, unknown>;

  if (o.position !== undefined && !isValidPosition(o.position)) {
    throw new NotificationError(`Invalid position: ${String(o.position)}`, ErrorCode.INVALID_POSITION);
  }

  const numeric: { key: keyof typeof DEFAULTS; name: string; field: keyof NotificationManagerOptions }[] =
    [
      { key: 'WIDTH', name: 'width', field: 'width' },
      { key: 'HEIGHT', name: 'height', field: 'height' },
      { key: 'MARGIN', name: 'margin', field: 'margin' },
      { key: 'GAP', name: 'gap', field: 'gap' },
    ];

  for (const n of numeric) {
    if (o[n.name] !== undefined) {
      assertNonNegativeInt(n.name, o[n.name]);
    }
  }
}

export function validateNotificationOptions(options: unknown): asserts options is NotificationOptions {
  if (typeof options !== 'object' || options === null) {
    throw new NotificationError('Notification options must be an object', ErrorCode.INVALID_OPTIONS);
  }
  const o = options as Record<string, unknown>;

  if (typeof o.title !== 'string' || o.title.trim().length === 0) {
    throw new NotificationError('title is required and must be a non-empty string', ErrorCode.INVALID_OPTIONS);
  }
  if (typeof o.description !== 'string' || o.description.trim().length === 0) {
    throw new NotificationError(
      'description is required and must be a non-empty string',
      ErrorCode.INVALID_OPTIONS,
    );
  }
  if (o.duration !== undefined) {
    assertNonNegativeInt('duration', o.duration);
  }
  if (o.variant !== undefined && !isValidVariant(o.variant)) {
    throw new NotificationError(`variant is invalid: ${String(o.variant)}`, ErrorCode.INVALID_OPTIONS);
  }
  if (o.theme !== undefined && !isValidThemeMode(o.theme)) {
    throw new NotificationError(`theme is invalid: ${String(o.theme)}`, ErrorCode.INVALID_OPTIONS);
  }
  if (o.image !== undefined && (typeof o.image !== 'string' || o.image.trim().length === 0)) {
    throw new NotificationError('image must be a non-empty string if provided', ErrorCode.INVALID_OPTIONS);
  }
  if (o.onClick !== undefined && typeof o.onClick !== 'function') {
    throw new NotificationError('onClick must be a function if provided', ErrorCode.INVALID_OPTIONS);
  }
  if (o.onClose !== undefined && typeof o.onClose !== 'function') {
    throw new NotificationError('onClose must be a function if provided', ErrorCode.INVALID_OPTIONS);
  }

  if (o.progress !== undefined) {
    assertNumber('progress', o.progress);
    if (o.progress < 0 || o.progress > 100) {
      throw new NotificationError('progress must be between 0 and 100', ErrorCode.INVALID_OPTIONS);
    }
  }
  if (o.progressLabel !== undefined && (typeof o.progressLabel !== 'string' || o.progressLabel.trim().length === 0)) {
    throw new NotificationError('progressLabel must be a non-empty string if provided', ErrorCode.INVALID_OPTIONS);
  }
  if (o.loadingText !== undefined && (typeof o.loadingText !== 'string' || o.loadingText.trim().length === 0)) {
    throw new NotificationError('loadingText must be a non-empty string if provided', ErrorCode.INVALID_OPTIONS);
  }
}

