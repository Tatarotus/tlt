import { toLocalMidnight, toISOLocalDate, parseISOLocal, isDateInRange, safeToISOString } from '../lib/date-utils';
import { describe, it, expect, jest } from '@jest/globals';

describe('Date Utils', () => {
  describe('toLocalMidnight', () => {
    it('should set time to midnight local time', () => {
      const date = new Date(2023, 5, 15, 14, 30, 45);
      const midnight = toLocalMidnight(date);
      expect(midnight.getFullYear()).toBe(2023);
      expect(midnight.getMonth()).toBe(5);
      expect(midnight.getDate()).toBe(15);
      expect(midnight.getHours()).toBe(0);
      expect(midnight.getMinutes()).toBe(0);
    });
  });

  describe('toISOLocalDate', () => {
    it('should format date as YYYY-MM-DD in local time', () => {
      const date = new Date(2023, 0, 5); // Jan 5
      expect(toISOLocalDate(date)).toBe('2023-01-05');
    });

    it('should handle single digit month and day with padding', () => {
      const date = new Date(2023, 8, 5); // Sept 5
      expect(toISOLocalDate(date)).toBe('2023-09-05');
    });
  });

  describe('parseISOLocal', () => {
    it('should parse YYYY-MM-DD string correctly', () => {
      const date = parseISOLocal('2023-05-20');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(4);
      expect(date.getDate()).toBe(20);
    });

    it('should handle Date objects', () => {
      const input = new Date(2022, 10, 10);
      const date = parseISOLocal(input);
      expect(date.getFullYear()).toBe(2022);
      expect(date.getMonth()).toBe(10);
    });

    it('should handle null/undefined by returning current date', () => {
      const date = parseISOLocal(null);
      expect(date instanceof Date).toBe(true);
    });

    it('should handle object with startDate', () => {
      const date = parseISOLocal({ startDate: '2023-12-25' });
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(11);
      expect(date.getDate()).toBe(25);
    });

    it('should handle object with start_date (snake_case)', () => {
      const date = parseISOLocal({ start_date: '2023-03-15' });
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(2);
      expect(date.getDate()).toBe(15);
    });

    it('should handle invalid date string by falling back', () => {
      const date = parseISOLocal('invalid-date');
      expect(date instanceof Date).toBe(true);
    });

    it('should handle empty string by returning current date', () => {
      const date = parseISOLocal('');
      expect(date instanceof Date).toBe(true);
    });

    it('should parse date at boundary (first day of month)', () => {
      const date = parseISOLocal('2023-01-01');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
    });

    it('should parse date at boundary (last day of month)', () => {
      const date = parseISOLocal('2023-01-31');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(31);
    });

    it('should handle February dates', () => {
      const date = parseISOLocal('2024-02-29'); // Leap year
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBe(29);
    });
  });

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

    it('should handle invalid values by returning current date ISO', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = safeToISOString('not-a-date');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(10);
      spy.mockRestore();
    });

    it('should handle null by returning current date ISO', () => {
      const result = safeToISOString(null);
      expect(typeof result).toBe('string');
    });

    it('should handle undefined by returning current date ISO', () => {
      const result = safeToISOString(undefined);
      expect(typeof result).toBe('string');
    });

    it('should handle string date', () => {
      const result = safeToISOString('2023-06-15T10:30:00Z');
      expect(result).toContain('2023-06-15');
    });

    it('should handle number (timestamp)', () => {
      const timestamp = new Date('2023-07-20').getTime();
      const result = safeToISOString(timestamp);
      expect(result).toContain('2023-07-20');
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
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = safeToISOString({ startDate: 'invalid' });
      expect(typeof result).toBe('string');
      spy.mockRestore();
    });

    it('should handle number value in safeToISOString', () => {
      const result = safeToISOString(123);
      expect(typeof result).toBe('string');
    });

    it('should handle Date with invalid time in safeToISOString', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidDate = new Date('invalid');
      const result = safeToISOString(invalidDate);
      expect(typeof result).toBe('string');
      spy.mockRestore();
    });
  });
});
