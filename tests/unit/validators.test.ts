import { NotificationError } from '../../src/errors';
import { isValidPosition, validateManagerOptions, validateNotificationOptions } from '../../src/utils/validators';

describe('validators', () => {
  describe('validateManagerOptions', () => {
    it('should accept empty options object', () => {
      expect(() => validateManagerOptions({})).not.toThrow();
    });

    it('should reject invalid position', () => {
      expect(() => validateManagerOptions({ position: 'nope' })).toThrow();
    });

    it('should reject negative width', () => {
      expect(() => validateManagerOptions({ width: -1 })).toThrow();
    });
  });

  describe('validateNotificationOptions', () => {
    it('should accept valid notification options', () => {
      expect(() =>
        validateNotificationOptions({
          title: 't',
          description: 'd',
          duration: 0,
        }),
      ).not.toThrow();
    });

    it('should reject missing title', () => {
      expect(() => validateNotificationOptions({ description: 'd' })).toThrow();
    });

    it('should reject negative duration', () => {
      expect(() => validateNotificationOptions({ title: 't', description: 'd', duration: -1 })).toThrow();
    });
  });

  describe('validators - edge cases', () => {
    it('should throw if title is empty string', () => {
      expect(() => validateNotificationOptions({ title: '', description: 'desc' })).toThrow(NotificationError);
    });

    it('should throw if description is missing', () => {
      expect(() => validateNotificationOptions({ title: 'Title' })).toThrow(NotificationError);
    });

    it('should throw if description is empty string', () => {
      expect(() => validateNotificationOptions({ title: 'Title', description: '' })).toThrow(NotificationError);
    });

    it('should throw if duration is not finite number', () => {
      expect(() =>
        validateNotificationOptions({
          title: 'Title',
          description: 'Desc',
          duration: Number.NaN as unknown as number,
        }),
      ).toThrow(NotificationError);
    });

    it('should throw if duration is non-integer', () => {
      expect(() =>
        validateNotificationOptions({
          title: 'Title',
          description: 'Desc',
          duration: 1.5,
        }),
      ).toThrow(NotificationError);
    });

    it('should throw if image is not a string', () => {
      expect(() =>
        validateNotificationOptions({
          title: 'Title',
          description: 'Desc',
          image: 123 as unknown as string,
        }),
      ).toThrow(NotificationError);
    });

    it('should throw if image is empty string', () => {
      expect(() =>
        validateNotificationOptions({
          title: 'Title',
          description: 'Desc',
          image: '',
        }),
      ).toThrow(NotificationError);
    });

    it('should throw if onClick is not a function', () => {
      expect(() =>
        validateNotificationOptions({
          title: 'Title',
          description: 'Desc',
          onClick: 'nope' as unknown as () => void,
        }),
      ).toThrow(NotificationError);
    });

    it('should throw if onClose is not a function', () => {
      expect(() =>
        validateNotificationOptions({
          title: 'Title',
          description: 'Desc',
          onClose: 'nope' as unknown as () => void,
        }),
      ).toThrow(NotificationError);
    });

    it('should return false for invalid position values', () => {
      expect(isValidPosition('middleCenter')).toBe(false);
      expect(isValidPosition('')).toBe(false);
      expect(isValidPosition(null)).toBe(false);
      expect(isValidPosition(undefined)).toBe(false);
      expect(isValidPosition(123)).toBe(false);
    });

    it('should throw if manager options is not an object', () => {
      expect(() => validateManagerOptions(null)).toThrow(NotificationError);
      expect(() => validateManagerOptions('nope')).toThrow(NotificationError);
    });

    it('should throw if manager option numeric values are invalid', () => {
      expect(() => validateManagerOptions({ width: Number.NaN })).toThrow(NotificationError);
      expect(() => validateManagerOptions({ width: -100 })).toThrow(NotificationError);
      expect(() => validateManagerOptions({ width: 1.2 })).toThrow(NotificationError);
      expect(() => validateManagerOptions({ height: -1 })).toThrow(NotificationError);
    });

    it('should accept duration 0 as sticky notification', () => {
      expect(() =>
        validateNotificationOptions({
          title: 'Title',
          description: 'Desc',
          duration: 0,
        }),
      ).not.toThrow();
    });

    it('should accept fully valid options', () => {
      expect(() =>
        validateNotificationOptions({
          title: 'TaskEra',
          description: 'New notification arrived',
          duration: 4000,
          image: '/path/to/icon.png',
          onClick: () => {},
          onClose: () => {},
        }),
      ).not.toThrow();
    });
  });
});

