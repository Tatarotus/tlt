import { isDateInRange, safeToISOString } from '../lib/date-utils';
import { describe, it, expect, jest } from '@jest/globals';

describe('Date Utils - Range and ISO Utilities', () => {
  describe('isDateInRange', () => {
    it('should return true for date inside range', () => {
      const d = new Date(2023, 5, 10);
      const s = new Date(2023, 5, 1);
      const e = new Date(2023, 5, 20);
      expect(isDateInRange(d, s, e)).toBe(true);
    });

    it('should return false for date outside range (before)', () => {
      const d = new Date(2023, 5, 25);
      const s = new Date(2023, 5, 1);
      const e = new Date(2023, 5, 20);
      expect(isDateInRange(d, s, e)).toBe(false);
    });

    it('should return false for date outside range (after)', () => {
      const d = new Date(2023, 4, 25);
      const s = new Date(2023, 5, 1);
      const e = new Date(2023, 5, 20);
      expect(isDateInRange(d, s, e)).toBe(false);
    });

    it('should return true for date at start boundary', () => {
      const d = new Date(2023, 5, 1);
      const s = new Date(2023, 5, 1);
      const e = new Date(2023, 5, 20);
      expect(isDateInRange(d, s, e)).toBe(true);
    });

    it('should return true for date at end boundary', () => {
      const d = new Date(2023, 5, 20);
      const s = new Date(2023, 5, 1);
      const e = new Date(2023, 5, 20);
      expect(isDateInRange(d, s, e)).toBe(true);
    });

    it('should return true when range is a single day', () => {
      const d = new Date(2023, 5, 15);
      const s = new Date(2023, 5, 15);
      const e = new Date(2023, 5, 15);
      expect(isDateInRange(d, s, e)).toBe(true);
    });
  });

  describe('safeToISOString', () => {
    it('should convert Date to ISO string', () => {
      const d = new Date(Date.UTC(2023, 0, 1));
      expect(safeToISOString(d)).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should handle Invalid Date object and call console.warn', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidDate = new Date('invalid');
      expect(isNaN(invalidDate.getTime())).toBe(true);
      const result = safeToISOString(invalidDate);
      expect(typeof result).toBe('string');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('safeToISOString: Invalid date value received:'),
        invalidDate
      );
      warnSpy.mockRestore();
    });

    it('should handle string input that is not a valid date and call console.warn', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = safeToISOString('not-a-date-string');
      expect(typeof result).toBe('string');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should handle number input NaN (falsy, returns current date)', () => {
      const result = safeToISOString(Number.NaN);
      expect(typeof result).toBe('string');
    });

    it('should handle null by returning current date ISO', () => {
      const result = safeToISOString(null);
      expect(typeof result).toBe('string');
    });

    it('should handle string date', () => {
      const result = safeToISOString('2023-06-15T10:30:00Z');
      expect(result).toContain('2023-06-15');
    });

    it('should handle number (timestamp) that creates valid date', () => {
      const timestamp = new Date('2023-07-20').getTime();
      const result = safeToISOString(timestamp);
      expect(result).toContain('2023-07-20');
    });

    it('should handle number input 0 (falsy, returns current date)', () => {
      const result = safeToISOString(0);
      expect(typeof result).toBe('string');
    });

    it('should handle object with startDate', () => {
      const result = safeToISOString({ startDate: '2023-08-10' });
      expect(result).toContain('2023-08-10');
    });

    it('should handle object with start_date (snake_case)', () => {
      const result = safeToISOString({ start_date: '2023-09-15' });
      expect(result).toContain('2023-09-15');
    });

    it('should handle object with endDate', () => {
      const result = safeToISOString({ endDate: '2023-10-20' });
      expect(result).toContain('2023-10-20');
    });

    it('should handle object with end_date (snake_case)', () => {
      const result = safeToISOString({ end_date: '2023-11-25' });
      expect(result).toContain('2023-11-25');
    });

    it('should handle object with invalid date values', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = safeToISOString({ startDate: 'invalid' });
      expect(typeof result).toBe('string');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should handle number value 123 in safeToISOString', () => {
      const result = safeToISOString(123);
      expect(typeof result).toBe('string');
      expect(result).toContain('1970');
    });

    it('should handle Date with invalid time in safeToISOString', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidDate = new Date('invalid');
      const result = safeToISOString(invalidDate);
      expect(typeof result).toBe('string');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
