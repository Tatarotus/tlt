import { toLocalMidnight, toISOLocalDate, toDateOnlyString, formatLocalDate, parseISOLocal } from '../lib/date-utils';
import { describe, it, expect } from '@jest/globals';

describe('Date Utils - Date Parsing and Formatting', () => {
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
      const date = new Date(2023, 0, 5);
      expect(toISOLocalDate(date)).toBe('2023-01-05');
    });

    it('should handle single digit month and day with padding', () => {
      const date = new Date(2023, 8, 5);
      expect(toISOLocalDate(date)).toBe('2023-09-05');
    });
  });

  describe('toDateOnlyString', () => {
    it('preserves a plain YYYY-MM-DD date without applying timezone conversion', () => {
      expect(toDateOnlyString('2024-05-10')).toBe('2024-05-10');
    });

    it('extracts the calendar date from ISO date-time strings', () => {
      expect(toDateOnlyString('2024-05-10T00:00:00.000Z')).toBe('2024-05-10');
    });

    it('handles Date objects by using UTC parts to avoid timezone shifts', () => {
      const date = new Date('2024-05-20T00:00:00.000Z');
      expect(toDateOnlyString(date)).toBe('2024-05-20');
    });

    it('handles string that is a valid date but not in YYYY-MM-DD format', () => {
      const date = toDateOnlyString('05/10/2024');
      expect(date).toBe('2024-05-10');
    });

    it('returns null for invalid date strings', () => {
      expect(toDateOnlyString('not-a-date')).toBeNull();
    });
  });

  describe('formatLocalDate', () => {
    it('formats plain date strings as the selected calendar day', () => {
      expect(formatLocalDate('2024-05-10', { month: 'short', day: 'numeric' }, 'en-US')).toBe('May 10');
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
      const date = parseISOLocal('2024-02-29');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBe(29);
    });

    it('should handle undefined input by returning current date', () => {
      const date = parseISOLocal(undefined);
      expect(date instanceof Date).toBe(true);
    });

    it('should handle object with both startDate and start_date (prefers startDate)', () => {
      const date = parseISOLocal({ startDate: '2023-06-15', start_date: '2023-01-01' });
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(5);
      expect(date.getDate()).toBe(15);
    });

    it('should handle object with only start_date when startDate is undefined', () => {
      const date = parseISOLocal({ startDate: undefined, start_date: '2023-04-20' });
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(3);
      expect(date.getDate()).toBe(20);
    });

    it('should handle string with partial date format (YYYY-MM-DD with extra chars)', () => {
      const date = parseISOLocal('2023-05-15T10:30:00Z');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(4);
      expect(date.getDate()).toBe(15);
    });

    it('should handle string with only year-month (incomplete date)', () => {
      const date = parseISOLocal('2023-05');
      expect(date instanceof Date).toBe(true);
    });

    it('should handle string that is a valid date but not in YYYY-MM-DD format', () => {
      const date = parseISOLocal('05/15/2023');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(4);
      expect(date.getDate()).toBe(15);
    });

    it('should handle string with wrong format (DD-MM-YYYY)', () => {
      const date = parseISOLocal('15-05-2023');
      expect(date instanceof Date).toBe(true);
    });

    it('should handle number input by converting to string', () => {
      const date = parseISOLocal(12345);
      expect(date instanceof Date).toBe(true);
    });
  });
});
