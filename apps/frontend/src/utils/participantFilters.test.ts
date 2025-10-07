import { describe, it, expect } from 'vitest';
import { filterParticipantsByCascade } from './participantFilters';

describe('filterParticipantsByCascade', () => {
  const mockParticipants = [
    {
      department: 'Engineering',
      jobTitle: 'Engineer',
      location: 'North America',
      hireDate: '2025-10-15',
    },
    {
      department: 'Design',
      jobTitle: 'Designer',
      location: 'Europe',
      hireDate: '2025-11-01',
    },
    {
      department: 'Marketing',
      jobTitle: 'Marketing Manager',
      location: 'North America',
      hireDate: '2025-09-20',
    },
    {
      department: 'Engineering',
      jobTitle: 'Engineer',
      location: 'Asia Pacific',
      hireDate: '2025-10-25',
    },
  ];

  describe('Level 1: Program region filter', () => {
    it('filters by program region (North America)', () => {
      const result = filterParticipantsByCascade(mockParticipants, 'North America');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.location === 'North America')).toBe(true);
    });

    it('filters by program region (Europe)', () => {
      const result = filterParticipantsByCascade(mockParticipants, 'Europe');

      expect(result).toHaveLength(1);
      expect(result[0].location).toBe('Europe');
    });

    it('returns all participants when region is Global', () => {
      const result = filterParticipantsByCascade(mockParticipants, 'Global');

      expect(result).toHaveLength(4);
    });

    it('returns all participants when no region specified', () => {
      const result = filterParticipantsByCascade(mockParticipants);

      expect(result).toHaveLength(4);
    });
  });

  describe('Level 2: Cohort date range filter', () => {
    it('filters by hire date range (Oct 2025)', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        undefined,
        { employeeStartDateFrom: '2025-10-01', employeeStartDateTo: '2025-10-31' }
      );

      expect(result).toHaveLength(2);
      expect(result.every(p => {
        const date = new Date(p.hireDate!);
        return date >= new Date('2025-10-01') && date <= new Date('2025-10-31');
      })).toBe(true);
    });

    it('filters by hire date from only', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        undefined,
        { employeeStartDateFrom: '2025-10-20' }
      );

      expect(result).toHaveLength(2);
      expect(result.every(p => new Date(p.hireDate!) >= new Date('2025-10-20'))).toBe(true);
    });

    it('filters by hire date to only', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        undefined,
        { employeeStartDateTo: '2025-10-20' }
      );

      expect(result).toHaveLength(2);
      expect(result.every(p => new Date(p.hireDate!) <= new Date('2025-10-20'))).toBe(true);
    });

    it('excludes participants without hire date when date filter is set', () => {
      const participantsWithMissingDate = [
        ...mockParticipants,
        { department: 'Sales', jobTitle: 'Sales Rep', location: 'North America' }, // no hireDate
      ];

      const result = filterParticipantsByCascade(
        participantsWithMissingDate,
        undefined,
        { employeeStartDateFrom: '2025-10-01' }
      );

      expect(result).toHaveLength(3); // Should exclude the one without hireDate
      expect(result.every(p => p.hireDate)).toBe(true);
    });
  });

  describe('Level 3: Session participant types filter', () => {
    it('filters by department', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        undefined,
        undefined,
        ['Engineering']
      );

      expect(result).toHaveLength(2);
      expect(result.every(p => p.department === 'Engineering')).toBe(true);
    });

    it('filters by job title', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        undefined,
        undefined,
        ['Designer']
      );

      expect(result).toHaveLength(1);
      expect(result[0].jobTitle).toBe('Designer');
    });

    it('filters by multiple participant types (OR logic)', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        undefined,
        undefined,
        ['Engineering', 'Design']
      );

      expect(result).toHaveLength(3);
    });

    it('returns all when participant types is empty array', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        undefined,
        undefined,
        []
      );

      expect(result).toHaveLength(4);
    });
  });

  describe('Cascading filters (multiple levels)', () => {
    it('applies region + date range filters', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        'North America',
        { employeeStartDateFrom: '2025-10-01', employeeStartDateTo: '2025-10-31' }
      );

      expect(result).toHaveLength(1);
      expect(result[0].location).toBe('North America');
      expect(result[0].hireDate).toBe('2025-10-15');
    });

    it('applies region + participant types filters', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        'North America',
        undefined,
        ['Engineering']
      );

      expect(result).toHaveLength(1);
      expect(result[0].location).toBe('North America');
      expect(result[0].department).toBe('Engineering');
    });

    it('applies date range + participant types filters', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        undefined,
        { employeeStartDateFrom: '2025-10-01', employeeStartDateTo: '2025-10-31' },
        ['Engineering']
      );

      expect(result).toHaveLength(2);
      expect(result.every(p => p.department === 'Engineering')).toBe(true);
    });

    it('applies all three filters', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        'North America',
        { employeeStartDateFrom: '2025-10-01', employeeStartDateTo: '2025-10-31' },
        ['Engineering']
      );

      expect(result).toHaveLength(1);
      expect(result[0].location).toBe('North America');
      expect(result[0].department).toBe('Engineering');
      expect(result[0].hireDate).toBe('2025-10-15');
    });

    it('returns empty array when no participants match all filters', () => {
      const result = filterParticipantsByCascade(
        mockParticipants,
        'North America',
        { employeeStartDateFrom: '2025-10-01', employeeStartDateTo: '2025-10-31' },
        ['Sales'] // No one in North America, hired in Oct, in Sales
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('handles empty participant array', () => {
      const result = filterParticipantsByCascade([], 'North America');

      expect(result).toHaveLength(0);
    });

    it('handles participants with undefined/null values', () => {
      const participantsWithNulls = [
        { department: undefined, jobTitle: undefined, location: undefined, hireDate: undefined },
        { department: 'Engineering', jobTitle: 'Engineer', location: 'North America', hireDate: '2025-10-15' },
      ];

      const result = filterParticipantsByCascade(
        participantsWithNulls,
        'North America',
        undefined,
        ['Engineering']
      );

      expect(result).toHaveLength(1);
      expect(result[0].department).toBe('Engineering');
    });
  });
});
