export const LABEL_COLOR_OPTIONS = [
  { name: 'Green', className: 'bg-green-500' },
  { name: 'Yellow', className: 'bg-yellow-500' },
  { name: 'Red', className: 'bg-red-500' },
  { name: 'Blue', className: 'bg-blue-500' },
  { name: 'Purple', className: 'bg-purple-500' },
] as const;

export type LabelColorName = (typeof LABEL_COLOR_OPTIONS)[number]['name'];

const LABEL_SEPARATOR = '::';

export const LABEL_COLOR_MAP: Record<string, string> = LABEL_COLOR_OPTIONS.reduce(
  (map, label) => ({ ...map, [label.name]: label.className }),
  {},
);

export function createColoredLabel(colorName: string, text: string) {
  return `${colorName}${LABEL_SEPARATOR}${text.trim()}`;
}

export function parseLabel(label: string) {
  const [maybeColor, ...textParts] = label.split(LABEL_SEPARATOR);
  const text = textParts.join(LABEL_SEPARATOR).trim();

  if (text && LABEL_COLOR_MAP[maybeColor]) {
    return {
      text,
      colorName: maybeColor,
      colorClass: LABEL_COLOR_MAP[maybeColor],
    };
  }

  return {
    text: label,
    colorName: LABEL_COLOR_MAP[label] ? label : null,
    colorClass: LABEL_COLOR_MAP[label] || 'bg-gray-400',
  };
}
