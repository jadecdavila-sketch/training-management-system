import { parseLocalDate } from './dateUtils';

interface Participant {
  department?: string;
  jobTitle?: string;
  location?: string;
  hireDate?: string | Date;
}

interface CohortFilters {
  employeeStartDateFrom?: string;
  employeeStartDateTo?: string;
}

/**
 * Cascading filter for participants through 3 levels:
 * 1. Program region - filters by participant location
 * 2. Cohort date range - filters by participant hire date
 * 3. Session participant types - filters by department or job title
 *
 * Participants must pass ALL applicable filters to be included.
 */
export function filterParticipantsByCascade(
  participants: Participant[],
  programRegion?: string,
  cohortFilters?: CohortFilters,
  sessionParticipantTypes?: string[]
): Participant[] {
  console.log('filterParticipantsByCascade called with:', {
    totalParticipants: participants.length,
    programRegion,
    cohortFilters,
    sessionParticipantTypes
  });

  const filtered = participants.filter((participant) => {
    // Level 1: Program region filter (if set and not Global)
    if (programRegion && programRegion !== 'Global') {
      if (participant.location !== programRegion) {
        console.log(`Participant ${participant.firstName} excluded: location "${participant.location}" !== "${programRegion}"`);
        return false;
      }
    }

    // Level 2: Cohort employee start date range filter (if set)
    if (cohortFilters?.employeeStartDateFrom || cohortFilters?.employeeStartDateTo) {
      if (participant.hireDate) {
        const hireDate = parseLocalDate(participant.hireDate);

        if (cohortFilters.employeeStartDateFrom) {
          const fromDate = parseLocalDate(cohortFilters.employeeStartDateFrom);
          if (hireDate < fromDate) {
            console.log(`Participant ${participant.firstName} excluded: hireDate ${hireDate.toISOString()} < ${fromDate.toISOString()}`);
            return false;
          }
        }

        if (cohortFilters.employeeStartDateTo) {
          const toDate = parseLocalDate(cohortFilters.employeeStartDateTo);
          if (hireDate > toDate) {
            console.log(`Participant ${participant.firstName} excluded: hireDate ${hireDate.toISOString()} > ${toDate.toISOString()}`);
            return false;
          }
        }
      } else {
        // If cohort has date filters but participant has no hireDate, exclude
        console.log(`Participant ${participant.firstName} excluded: no hireDate but cohort has date filters`);
        return false;
      }
    }

    // Level 3: Session participant types filter (if set)
    if (sessionParticipantTypes && sessionParticipantTypes.length > 0) {
      const matches = sessionParticipantTypes.includes(participant.department || '') ||
             sessionParticipantTypes.includes(participant.jobTitle || '');
      if (!matches) {
        console.log(`Participant ${participant.firstName} excluded: dept "${participant.department}" and job "${participant.jobTitle}" not in`, sessionParticipantTypes);
      }
      return matches;
    }

    return true;
  });

  console.log(`Filtered ${filtered.length} participants from ${participants.length}`);
  return filtered;
}
