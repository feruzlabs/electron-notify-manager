import { DEFAULTS, VALID_POSITIONS, VALID_VARIANTS } from '../constants';
import { ErrorCode, NotificationError } from '../errors';
import type {
  NotificationManagerOptions,
  NotificationOptions,
  NotificationPosition,
  NotificationVariant,
} from '../types/index';

export function isValidPosition(value: unknown): value is NotificationPosition {
  return typeof value === 'string' && (VALID_POSITIONS as readonly string[]).includes(value);
}

export function isValidVariant(value: unknown): value is NotificationVariant {
  return typeof value === 'string' && (VALID_VARIANTS as readonly string[]).includes(value);
}

export function isValidDuration(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function assertFiniteNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new NotificationError(`${name} must be a finite number`, ErrorCode.INVALID_OPTIONS);
  }
}

function assertNonNegativeNumber(name: string, value: unknown): void {
  assertFiniteNumber(name, value);
  if (value < 0) {
    throw new NotificationError(`${name} must be >= 0`, ErrorCode.INVALID_OPTIONS);
  }
}

function assertPositiveNumber(name: string, value: unknown): void {
  assertFiniteNumber(name, value);
  if (value <= 0) throw new NotificationError(`${name} must be > 0`, ErrorCode.INVALID_OPTIONS);
}

export function validateManagerOptions(options: unknown): asserts options is NotificationManagerOptions {
  if (typeof options !== 'object' || options === null) {
    throw new NotificationError('Manager options must be an object', ErrorCode.INVALID_OPTIONS);
  }
  const o = options as Record<string, unknown>;

  if (o.position !== undefined && !isValidPosition(o.position)) {
    throw new NotificationError(`Invalid position: ${String(o.position)}`, ErrorCode.INVALID_POSITION);
  }

  if (o.width !== undefined) assertPositiveNumber('width', o.width);
  if (o.height !== undefined) assertPositiveNumber('height', o.height);
  if (o.margin !== undefined) assertNonNegativeNumber('margin', o.margin);
  if (o.gap !== undefined) assertNonNegativeNumber('gap', o.gap);
}

export function validateNotificationOptions(options: unknown): asserts options is NotificationOptions {
  if (typeof options !== 'object' || options === null) {
    throw new NotificationError('Notification options must be an object', ErrorCode.INVALID_OPTIONS);
  }
  const o = options as Record<string, unknown>;

  if (typeof o.title !== 'string' || o.title.trim().length === 0) {
    throw new NotificationError('title is required and must be a non-empty string', ErrorCode.INVALID_OPTIONS);
  }
  if (o.title.length > 100) {
    throw new NotificationError('title must be <= 100 chars', ErrorCode.INVALID_OPTIONS);
  }
  if (typeof o.description !== 'string' || o.description.trim().length === 0) {
    throw new NotificationError(
      'description is required and must be a non-empty string',
      ErrorCode.INVALID_OPTIONS,
    );
  }
  if (o.duration !== undefined) {
    assertFiniteNumber('duration', o.duration);
    if (o.duration < 0) {
      throw new NotificationError('duration must be >= 0', ErrorCode.INVALID_OPTIONS);
    }
  }
  if (o.description.length > 300) {
    throw new NotificationError('description must be <= 300 chars', ErrorCode.INVALID_OPTIONS);
  }
  if (o.variant !== undefined && !isValidVariant(o.variant)) {
    throw new NotificationError(`variant is invalid: ${String(o.variant)}`, ErrorCode.INVALID_OPTIONS);
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
    assertFiniteNumber('progress', o.progress);
    if (o.progress < 0 || o.progress > 100) {
      throw new NotificationError('progress must be between 0 and 100', ErrorCode.INVALID_OPTIONS);
    }
  }
}

