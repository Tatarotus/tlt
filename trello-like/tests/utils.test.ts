import { cn } from '../lib/utils';
import { describe, it, expect } from '@jest/globals';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge classes correctly', () => {
      expect(cn('class1', 'class2')).toContain('class1');
      expect(cn('class1', 'class2')).toContain('class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
    });

    it('should handle tailwind class conflicts', () => {
      // clsx + tailwind-merge behavior
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });
  });
});
