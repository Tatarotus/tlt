// lib/date-utils.ts

export function toLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Returns a YYYY-MM-DD string in the LOCAL timezone.
 * Useful for sending to the server without UTC shifts.
 */
export function toISOLocalDate(date: Date): string {
  const d = toLocalMidnight(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toDateOnlyString(dateValue: Date | string | number | null | undefined): string | null {
  if (!dateValue) return null;

  let date: Date;
  if (dateValue instanceof Date) {
    date = dateValue;
    if (isNaN(date.getTime())) return null;
    // If it's a Date object, we prefer the UTC parts to avoid timezone shifts
    // which is common for "date-only" values from databases.
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const dateStr = String(dateValue);
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  
  // For other string formats, if it doesn't look like an ISO date-only string,
  // we use the local parts to be consistent with picking dates in the UI.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatLocalDate(
  dateValue: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locales?: Intl.LocalesArgument
): string | null {
  if (!dateValue) return null;
  const dateOnly = toDateOnlyString(dateValue);
  if (!dateOnly) return null;
  return parseISOLocal(dateOnly).toLocaleDateString(locales, options);
}

/**
 * Parses a date value into a local Date object (midnight).
 * Handles Date objects, ISO strings, and snake_case database objects.
 * Prevents timezone shifting by parsing YYYY-MM-DD components directly from strings.
 */
export function parseISOLocal(dateValue: Date | string | number | { startDate?: string; start_date?: string } | null | undefined): Date {
  if (!dateValue) return new Date();

  // Handle Date objects
  if (dateValue instanceof Date) {
    return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
  }

  // Handle objects with startDate/start_date properties
  if (typeof dateValue === 'object' && ('startDate' in dateValue || 'start_date' in dateValue)) {
    const val = dateValue.startDate || dateValue.start_date;
    const dateStr = String(val);
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(year, month, day);
    }
    return new Date();
  }

  // Handle string dates
  const dateStr = String(dateValue);
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

// Fallback for other formats
const date = new Date(dateStr);
if (isNaN(date.getTime())) return new Date();

return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = toLocalMidnight(date);
  const s = toLocalMidnight(start);
  const e = toLocalMidnight(end);
  return d >= s && d <= e;
}

/**
 * Safely converts a value to an ISO string.
 * Used for API responses.
 */
export function safeToISOString(value: Date | string | number | { startDate?: string; start_date?: string; endDate?: string; end_date?: string } | null): string {
if (!value) return new Date().toISOString();

let date: Date;
if (value instanceof Date) {
date = value;
} else if (typeof value === 'string' || typeof value === 'number') {
date = new Date(value);
} else {
// Check for common DB property names if passed the whole object by mistake
const possibleDate = value.startDate || value.start_date || value.endDate || value.end_date;
if (possibleDate) return safeToISOString(possibleDate);
date = new Date(String(value));
}
  
  if (isNaN(date.getTime())) {
    console.warn("safeToISOString: Invalid date value received:", value);
    return new Date().toISOString();
  }
  
  return date.toISOString();
}
