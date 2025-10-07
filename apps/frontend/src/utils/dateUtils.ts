/**
 * Parse a date string (YYYY-MM-DD) in local timezone to avoid timezone shift issues.
 *
 * Using `new Date('2025-10-01')` parses as UTC midnight, which can shift to the
 * previous day in your local timezone. This function ensures the date stays as-is.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a Date object to YYYY-MM-DD string in local timezone.
 *
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string (YYYY-MM-DD) to a localized string.
 * Safely handles timezone by parsing in local timezone first.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDateString(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }
): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', options);
}

/**
 * Format a DateTime string (ISO 8601) to a localized date string.
 * Extracts just the date part to avoid timezone shifts.
 *
 * @param dateTimeStr - DateTime string in ISO 8601 format (e.g., "2025-10-01T00:00:00.000Z")
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDateTime(
  dateTimeStr: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }
): string {
  // Extract just the date part (YYYY-MM-DD) from ISO datetime
  const dateStr = typeof dateTimeStr === 'string'
    ? dateTimeStr.split('T')[0]
    : dateTimeStr.toISOString().split('T')[0];
  return parseLocalDate(dateStr).toLocaleDateString('en-US', options);
}
