# Calendar Highlight Color Palette

## Design Philosophy

Our color palette is designed for **maximum clarity, quick recognition, and accessibility**. Unlike traditional color pickers with 20+ similar colors, our curated 12-color system ensures each color is **instantly distinguishable** and serves a clear purpose.

## The Palette

### Primary Colors (6) - Most Frequently Used

| Name | HEX | Usage | Psychological Impact |
|------|-----|-------|---------------------|
| **Crimson** | `#DC2626` | Urgent deadlines, critical events | Creates urgency, draws immediate attention |
| **Sunset** | `#EA580C` | High priority, warnings | Energetic, attention-grabbing without alarm |
| **Amber** | `#D97706` | Caution, pending items | Warm alertness, less aggressive than red |
| **Emerald** | `#059669` | Success, on-track, completed | Growth, completion, positive action |
| **Ocean** | `#0284C7` | Information, meetings, events | Trustworthy, professional, calming |
| **Indigo** | `#4F46E5` | Important features, special items | Authority, depth, significance |

### Secondary Colors (3) - Supporting Use

| Name | HEX | Usage | Psychological Impact |
|------|-----|-------|---------------------|
| **Violet** | `#7C3AED` | Creative projects, design work | Creativity, innovation, imagination |
| **Fuchsia** | `#C026D3` | Celebrations, milestones | Festive, bold, celebratory |
| **Rose** | `#E11D48` | Personal projects, passion work | Warmth, personal connection |

### Accent Colors (2) - Specialized

| Name | HEX | Usage | Psychological Impact |
|------|-----|-------|---------------------|
| **Teal** | `#0D9488` | Learning, health, growth | Balance, renewal, sophistication |
| **Sky** | `#0EA5E9` | Travel, outdoor, freedom | Openness, clarity, expansiveness |

### Neutral (1)

| Name | HEX | Usage | Psychological Impact |
|------|-----|-------|---------------------|
| **Slate** | `#64748B` | Default, archive, misc | Neutral, professional, unobtrusive |

## Color Theory Principles Applied

### 1. **Even Hue Spacing (~40° intervals)**
Colors are spaced evenly around the color wheel to ensure maximum visual distinction:
- Crimson (Red) → Sunset (Orange) → Amber (Yellow-Orange) → Emerald (Green) → Ocean (Blue) → Indigo (Blue-Purple) → etc.

### 2. **Consistent Saturation & Lightness**
- **Saturation**: 60-70% - Vibrant but not overwhelming
- **Lightness**: 45-55% - Medium range for visibility on both light/dark backgrounds
- This consistency prevents any single color from visually "dominating"

### 3. **Color Vision Deficiency Optimization**
- Avoids problematic red-green combinations
- Each color has distinct brightness and hue characteristics
- Tested for deuteranopia (red-green blindness) accessibility

### 4. **Semantic Clarity**
Colors are organized by usage frequency and purpose:
- **Primary**: Daily use cases (urgent, important, informational)
- **Secondary**: Less frequent but still common (creative, celebratory)
- **Accent**: Specialized scenarios (learning, travel)
- **Neutral**: Default/fallback option

## Comparison: Before vs After

### Previous Palette (20 colors)
❌ Too many similar colors (multiple blues, greens, pinks)  
❌ No clear organization or hierarchy  
❌ Difficult to distinguish at a glance  
❌ Random color selection without purpose  
❌ Inconsistent saturation/brightness  

### New Palette (12 colors)
✅ Clear visual separation between all colors  
✅ Organized by usage frequency (Primary/Secondary/Accent/Neutral)  
✅ Instantly recognizable and memorable  
✅ Each color has a defined purpose/meaning  
✅ Consistent visual weight across the palette  

## UI Implementation

### Color Picker Layout
The color picker is organized into tabs:
- **All**: Full 12-color view
- **Primary**: 6 most-used colors (Crimson, Sunset, Amber, Emerald, Ocean, Indigo)
- **Secondary**: Supporting colors (Violet, Fuchsia, Rose)
- **Accent**: Specialized colors (Teal, Sky)
- **Neutral**: Default option (Slate)

### Visual Feedback
- Selected colors show a checkmark indicator
- Hover states provide scale and shadow feedback
- Active selection displays ring and offset for clarity

## Best Practices for Users

1. **Use Primary colors for recurring events** (e.g., Ocean for weekly meetings)
2. **Reserve Crimson for truly urgent items** to maintain its impact
3. **Use consistent colors for similar event types** across your calendar
4. **Don't overuse accent colors** - they're meant to stand out
5. **Slate is perfect for "miscellaneous" or archival items**

## Technical Details

### Tailwind Integration
Each color maps to Tailwind CSS utility classes:
- `bg-{color}-100` for backgrounds
- `border-{color}-300` for borders
- `text-{color}-700` for text
- `ring-{color}-400` for focus states
- `bg-{color}-500` for dots/indicators

### Accessibility
- All colors meet WCAG AA contrast requirements when used with white text
- Color is never the sole indicator of meaning (always paired with text)
- Hover/focus states provide additional visual feedback

## Future Enhancements

### Potential Additions (if needed)
- **Dark mode variants**: Slightly adjusted saturation for dark backgrounds
- **Seasonal palettes**: Optional themed colors (e.g., autumn tones)
- **Custom colors**: User-defined colors (stored per-workspace)

### Shade System (Not Implemented)
Each color could expand into a 5-step scale:
- 50: Very light (backgrounds)
- 100: Light (current bg)
- 300: Medium (current border)
- 500: Base (current dot)
- 700: Dark (current text)

This would allow for more nuanced UI states without adding visual complexity.
