import { describe, it, expect } from 'vitest';
import { parseLocalDate, formatLocalDate, formatDateString, formatDateTime } from './dateUtils';

describe('parseLocalDate', () => {
  it('should parse YYYY-MM-DD string to local date', () => {
    const result = parseLocalDate('2025-10-01');
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(9); // October is month 9 (0-indexed)
    expect(result.getDate()).toBe(1);
  });

  it('should handle dates at year boundaries', () => {
    const result = parseLocalDate('2025-01-01');
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });

  it('should handle end of month dates', () => {
    const result = parseLocalDate('2025-09-30');
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(8); // September
    expect(result.getDate()).toBe(30);
  });

  it('should not shift dates due to timezone', () => {
    // This is the key test - Oct 1 should stay Oct 1, not shift to Sept 30
    const oct1 = parseLocalDate('2025-10-01');
    expect(oct1.getDate()).toBe(1);
    expect(oct1.getMonth()).toBe(9);

    const sept30 = parseLocalDate('2025-09-30');
    expect(sept30.getDate()).toBe(30);
    expect(sept30.getMonth()).toBe(8);
  });
});

describe('formatLocalDate', () => {
  it('should format Date to YYYY-MM-DD string', () => {
    const date = new Date(2025, 9, 1); // Oct 1, 2025
    const result = formatLocalDate(date);
    expect(result).toBe('2025-10-01');
  });

  it('should pad single digit months and days', () => {
    const date = new Date(2025, 0, 5); // Jan 5, 2025
    const result = formatLocalDate(date);
    expect(result).toBe('2025-01-05');
  });

  it('should handle end of month', () => {
    const date = new Date(2025, 8, 30); // Sept 30, 2025
    const result = formatLocalDate(date);
    expect(result).toBe('2025-09-30');
  });
});

describe('formatDateString', () => {
  it('should format date string to readable format', () => {
    const result = formatDateString('2025-10-01');
    expect(result).toContain('October');
    expect(result).toContain('1');
    expect(result).toContain('2025');
  });

  it('should handle custom format options', () => {
    const result = formatDateString('2025-10-01', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    expect(result).toContain('Oct');
    expect(result).toContain('1');
    expect(result).toContain('2025');
  });

  it('should not shift dates when formatting', () => {
    const result = formatDateString('2025-10-01');
    expect(result).toContain('October'); // Should be October, not September
    expect(result).toContain('1'); // Should be 1, not 30
  });
});

describe('formatDateTime', () => {
  it('should extract date part from ISO datetime string', () => {
    const result = formatDateTime('2025-10-01T00:00:00.000Z');
    expect(result).toContain('Oct');
    expect(result).toContain('1');
    expect(result).toContain('2025');
  });

  it('should handle Date objects', () => {
    const date = new Date(2025, 9, 1);
    const result = formatDateTime(date);
    expect(result).toContain('Oct');
    expect(result).toContain('1');
    expect(result).toContain('2025');
  });

  it('should not shift dates from UTC to local', () => {
    // This is critical - UTC midnight Oct 1 should display as Oct 1, not Sept 30
    const result = formatDateTime('2025-10-01T00:00:00.000Z');
    expect(result).toContain('Oct');
    expect(result).toContain('1');
  });

  it('should handle dates with different times', () => {
    const morning = formatDateTime('2025-10-01T08:00:00.000Z');
    const evening = formatDateTime('2025-10-01T20:00:00.000Z');

    // Both should show Oct 1, regardless of time
    expect(morning).toContain('Oct');
    expect(morning).toContain('1');
    expect(evening).toContain('Oct');
    expect(evening).toContain('1');
  });
});

describe('Date comparison edge cases', () => {
  it('should correctly compare dates at boundaries', () => {
    const sept30 = parseLocalDate('2025-09-30');
    const oct1 = parseLocalDate('2025-10-01');

    expect(sept30 < oct1).toBe(true);
    expect(oct1 > sept30).toBe(true);
    expect(sept30.getTime()).toBeLessThan(oct1.getTime());
  });

  it('should handle same date comparisons', () => {
    const date1 = parseLocalDate('2025-10-01');
    const date2 = parseLocalDate('2025-10-01');

    expect(date1.getTime()).toBe(date2.getTime());
  });
});
