import { describe, expect, it } from '@jest/globals';
import { 
  HIGHLIGHT_COLORS, 
  COLOR_GROUPS, 
  VALID_COLOR_NAMES, 
  getColorByName, 
  isValidColor 
} from '@/lib/highlight-colors';

describe('highlight-colors', () => {
  describe('HIGHLIGHT_COLORS', () => {
    it('has 12 colors', () => {
      expect(HIGHLIGHT_COLORS).toHaveLength(12);
    });

    it('all colors have required properties', () => {
      HIGHLIGHT_COLORS.forEach(color => {
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('hex');
        expect(color).toHaveProperty('description');
        expect(color).toHaveProperty('category');
        expect(color).toHaveProperty('bg');
        expect(color).toHaveProperty('border');
        expect(color).toHaveProperty('text');
        expect(color).toHaveProperty('ring');
        expect(color).toHaveProperty('dot');
      });
    });

    it('all hex codes are valid', () => {
      HIGHLIGHT_COLORS.forEach(color => {
        expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('categories are valid', () => {
      const validCategories = ['primary', 'secondary', 'accent', 'neutral'];
      HIGHLIGHT_COLORS.forEach(color => {
        expect(validCategories).toContain(color.category);
      });
    });
  });

  describe('COLOR_GROUPS', () => {
    it('has all four groups', () => {
      expect(COLOR_GROUPS).toHaveProperty('primary');
      expect(COLOR_GROUPS).toHaveProperty('secondary');
      expect(COLOR_GROUPS).toHaveProperty('accent');
      expect(COLOR_GROUPS).toHaveProperty('neutral');
    });

    it('primary group has 6 colors', () => {
      expect(COLOR_GROUPS.primary).toHaveLength(6);
    });

    it('secondary group has 3 colors', () => {
      expect(COLOR_GROUPS.secondary).toHaveLength(3);
    });

    it('accent group has 2 colors', () => {
      expect(COLOR_GROUPS.accent).toHaveLength(2);
    });

    it('neutral group has 1 color', () => {
      expect(COLOR_GROUPS.neutral).toHaveLength(1);
    });

    it('all groups contain only colors from main palette', () => {
      const allGroupColors = [
        ...COLOR_GROUPS.primary,
        ...COLOR_GROUPS.secondary,
        ...COLOR_GROUPS.accent,
        ...COLOR_GROUPS.neutral
      ];
      
      allGroupColors.forEach(groupColor => {
        const foundInPalette = HIGHLIGHT_COLORS.find(c => c.name === groupColor.name);
        expect(foundInPalette).toBeDefined();
      });
    });
  });

  describe('VALID_COLOR_NAMES', () => {
    it('contains all color names in lowercase', () => {
      HIGHLIGHT_COLORS.forEach(color => {
        expect(VALID_COLOR_NAMES).toContain(color.name.toLowerCase());
      });
    });

    it('has 12 unique color names', () => {
      const uniqueNames = new Set(VALID_COLOR_NAMES);
      expect(uniqueNames.size).toBe(12);
    });
  });

  describe('getColorByName', () => {
    it('finds color by exact name', () => {
      const result = getColorByName('Crimson');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Crimson');
      expect(result?.hex).toBe('#DC2626');
    });

    it('finds color case-insensitively', () => {
      const result = getColorByName('crimson');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Crimson');
    });

    it('returns undefined for unknown color', () => {
      const result = getColorByName('Unknown');
      expect(result).toBeUndefined();
    });

    it('finds all colors in palette', () => {
      HIGHLIGHT_COLORS.forEach(color => {
        const result = getColorByName(color.name);
        expect(result).toEqual(color);
      });
    });
  });

  describe('isValidColor', () => {
    it('returns true for valid colors', () => {
      expect(isValidColor('Crimson')).toBe(true);
      expect(isValidColor('Emerald')).toBe(true);
      expect(isValidColor('Ocean')).toBe(true);
    });

    it('returns true case-insensitively', () => {
      expect(isValidColor('crimson')).toBe(true);
      expect(isValidColor('CRIMSON')).toBe(true);
      expect(isValidColor('Crimson')).toBe(true);
    });

    it('returns false for invalid colors', () => {
      expect(isValidColor('Invalid')).toBe(false);
      expect(isValidColor('')).toBe(false);
      expect(isValidColor('#FF0000')).toBe(false);
    });

    it('validates all colors in palette', () => {
      HIGHLIGHT_COLORS.forEach(color => {
        expect(isValidColor(color.name)).toBe(true);
        expect(isValidColor(color.name.toLowerCase())).toBe(true);
      });
    });
  });
});
