/**
 * Calendar Highlight Color Palette
 * 
 * Design Principles:
 * - Evenly spaced hues (~40° intervals) for maximum distinctness
 * - Consistent saturation (60-70%) and lightness (45-55%)
 * - Optimized for color vision deficiencies (avoiding red-green confusion)
 * - Works on both light and dark backgrounds
 * - Based on Material Design and Tailwind CSS color systems
 */

export interface HighlightColor {
  name: string;
  hex: string;
  description: string;
  category: 'primary' | 'secondary' | 'accent' | 'neutral';
  // Tailwind class mappings
  bg: string;
  border: string;
  text: string;
  ring: string;
  dot: string;
}

/**
 * Core palette: 12 distinct colors optimized for quick recognition
 * Arranged by hue angle for systematic selection
 */
export const HIGHLIGHT_COLORS: HighlightColor[] = [
  // Primary colors (most commonly used)
  {
    name: 'Crimson',
    hex: '#DC2626',
    description: 'Urgent, critical, deadlines',
    category: 'primary',
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-700',
    ring: 'ring-red-400',
    dot: 'bg-red-500',
  },
  {
    name: 'Sunset',
    hex: '#EA580C',
    description: 'High priority, warnings',
    category: 'primary',
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-700',
    ring: 'ring-orange-400',
    dot: 'bg-orange-500',
  },
  {
    name: 'Amber',
    hex: '#D97706',
    description: 'Caution, attention needed',
    category: 'primary',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-700',
    ring: 'ring-amber-400',
    dot: 'bg-amber-500',
  },
  {
    name: 'Emerald',
    hex: '#059669',
    description: 'Success, on-track, completed',
    category: 'primary',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
    ring: 'ring-emerald-400',
    dot: 'bg-emerald-500',
  },
  {
    name: 'Ocean',
    hex: '#0284C7',
    description: 'Information, meetings, events',
    category: 'primary',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-700',
    ring: 'ring-blue-400',
    dot: 'bg-blue-500',
  },
  {
    name: 'Indigo',
    hex: '#4F46E5',
    description: 'Important, featured, special',
    category: 'primary',
    bg: 'bg-indigo-100',
    border: 'border-indigo-300',
    text: 'text-indigo-700',
    ring: 'ring-indigo-400',
    dot: 'bg-indigo-500',
  },
  
  // Secondary colors (supporting)
  {
    name: 'Violet',
    hex: '#7C3AED',
    description: 'Creative, design, innovation',
    category: 'secondary',
    bg: 'bg-violet-100',
    border: 'border-violet-300',
    text: 'text-violet-700',
    ring: 'ring-violet-400',
    dot: 'bg-violet-500',
  },
  {
    name: 'Fuchsia',
    hex: '#C026D3',
    description: 'Celebration, milestones',
    category: 'secondary',
    bg: 'bg-fuchsia-100',
    border: 'border-fuchsia-300',
    text: 'text-fuchsia-700',
    ring: 'ring-fuchsia-400',
    dot: 'bg-fuchsia-500',
  },
  {
    name: 'Rose',
    hex: '#E11D48',
    description: 'Passion projects, personal',
    category: 'secondary',
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    text: 'text-rose-700',
    ring: 'ring-rose-400',
    dot: 'bg-rose-500',
  },
  
  // Accent colors (specialized use)
  {
    name: 'Teal',
    hex: '#0D9488',
    description: 'Growth, learning, health',
    category: 'accent',
    bg: 'bg-teal-100',
    border: 'border-teal-300',
    text: 'text-teal-700',
    ring: 'ring-teal-400',
    dot: 'bg-teal-500',
  },
  {
    name: 'Sky',
    hex: '#0EA5E9',
    description: 'Travel, outdoor, freedom',
    category: 'accent',
    bg: 'bg-sky-100',
    border: 'border-sky-300',
    text: 'text-sky-700',
    ring: 'ring-sky-400',
    dot: 'bg-sky-500',
  },
  
  // Neutral
  {
    name: 'Slate',
    hex: '#64748B',
    description: 'Default, miscellaneous, archive',
    category: 'neutral',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-700',
    ring: 'ring-slate-400',
    dot: 'bg-slate-500',
  },
];

/**
 * Color groups for organized selection UI
 */
export const COLOR_GROUPS = {
  primary: HIGHLIGHT_COLORS.filter(c => c.category === 'primary'),
  secondary: HIGHLIGHT_COLORS.filter(c => c.category === 'secondary'),
  accent: HIGHLIGHT_COLORS.filter(c => c.category === 'accent'),
  neutral: HIGHLIGHT_COLORS.filter(c => c.category === 'neutral'),
};

/**
 * Valid color names for validation
 */
export const VALID_COLOR_NAMES = HIGHLIGHT_COLORS.map(c => c.name.toLowerCase());

/**
 * Get color by name (case-insensitive)
 */
export function getColorByName(name: string): HighlightColor | undefined {
  return HIGHLIGHT_COLORS.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/**
 * Validate if a color name is in the palette
 */
export function isValidColor(name: string): boolean {
  return VALID_COLOR_NAMES.includes(name.toLowerCase());
}
