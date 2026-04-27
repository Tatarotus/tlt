import { add, isEven, calculateDiscount, isPositive } from '../lib/math-utils';
import { describe, it, expect } from '@jest/globals';

describe('Math Utils', () => {
  describe('add', () => {
    it('should add two positive numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers correctly', () => {
      expect(add(-1, 1)).toBe(0);
    });

    it('should add two negative numbers correctly', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('should handle zero', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('isEven', () => {
    it('should return true for even numbers', () => {
      expect(isEven(4)).toBe(true);
    });

    it('should return false for odd numbers', () => {
      expect(isEven(3)).toBe(false);
    });

    it('should return true for zero', () => {
      expect(isEven(0)).toBe(true);
    });

    it('should return true for negative even numbers', () => {
      expect(isEven(-4)).toBe(true);
    });

    it('should return false for negative odd numbers', () => {
      expect(isEven(-3)).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('should return true for positive numbers', () => {
      expect(isPositive(5)).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(isPositive(-5)).toBe(false);
    });

    it('should return false for zero', () => {
      expect(isPositive(0)).toBe(false);
    });

    it('should return true for small positive numbers', () => {
      expect(isPositive(1)).toBe(true);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount correctly', () => {
      expect(calculateDiscount(100, 10)).toBe(90);
    });

    it('should return original price when discount is 0', () => {
      expect(calculateDiscount(100, 0)).toBe(100);
    });

    it('should return original price for negative discounts', () => {
      expect(calculateDiscount(100, -10)).toBe(100);
    });

    it('should handle 100% discount', () => {
      expect(calculateDiscount(100, 100)).toBe(0);
    });

    it('should handle 50% discount', () => {
      expect(calculateDiscount(200, 50)).toBe(100);
    });

    it('should handle decimal prices', () => {
      expect(calculateDiscount(99.99, 10)).toBe(89.991);
    });

    it('should handle large discounts', () => {
      expect(calculateDiscount(1000, 25)).toBe(750);
    });
  });
});