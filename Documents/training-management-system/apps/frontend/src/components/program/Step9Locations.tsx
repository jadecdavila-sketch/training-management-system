import { useMemo, useState, useEffect } from 'react';
import { MapPin, Calendar, AlertCircle } from 'lucide-react';
import { locationsApi } from '@/services/api';
import { formatDateString } from '@/utils/dateUtils';

interface Session {
  id: string;
  blockId?: string;
  name: string;
  description: string;
  groupSizeMin: number;
  groupSizeMax: number;
  participantTypes: string[];
  requiresFacilitator: boolean;
  facilitatorSkills: string[];
  locationTypes: string[];
}

interface ScheduledSession {
  sessionId: string;
  startWeek: number;
  startDay: string;
  startTime: string;
  endWeek: number;
  endDay: string;
  endTime: string;
  blockId: string;
}

interface CohortDetail {
  id: string;
  name: string;
  startDate: string;
}

interface LocationAssignment {
  cohortId: string;
  sessionId: string;
  locationName: string;
  locationType: string;
  capacity: number;
  building?: string;
  floor?: string;
}

interface UnmatchedSession {
  cohortId: string;
  sessionId: string;
  requiredTypes: string[];
  requiredCapacity: number;
  reason: string;
}

interface FormData {
  sessions: Session[];
  scheduledSessions: ScheduledSession[];
  cohortDetails: CohortDetail[];
  locationAssignments?: LocationAssignment[];
}

interface Step9Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step9Locations({ formData, updateFormData, onNext, onBack }: Step9Props) {
  const [locations, setLocations] = useState<Array<{ id: string; name: string; type: string; capacity: number; address?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations from the database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await locationsApi.getAll({ pageSize: 1000 }); // Get all locations
        // Transform the data to match the expected format
        const locationsData = response.data.map(loc => ({
          id: loc.id,
          name: loc.name,
          type: loc.type,
          capacity: loc.capacity,
          address: loc.address
        }));
        setLocations(locationsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
        setError('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Generate location assignments using useMemo to prevent infinite loops
  const { assignments, unmatched } = useMemo(() => {
    const assignments: LocationAssignment[] = [];
    const unmatched: UnmatchedSession[] = [];

    // Don't generate assignments if locations haven't loaded yet
    if (locations.length === 0) {
      return { assignments, unmatched };
    }

    formData.cohortDetails.forEach(cohort => {
      formData.scheduledSessions.forEach(scheduledSession => {
        const session = formData.sessions.find(s => s.id === scheduledSession.sessionId);

        if (session) {
          const requiredTypes = session.locationTypes || [];
          const requiredCapacity = session.groupSizeMax;

          // Check if session is off-site or virtual (doesn't need a physical location)
          const isOffSiteOrVirtual = requiredTypes.some(type =>
            type.toLowerCase() === 'off-site' || type.toLowerCase() === 'virtual'
          );

          if (isOffSiteOrVirtual) {
            // Mark as off-site/virtual - no physical location needed
            const locationType = requiredTypes.find(type =>
              type.toLowerCase() === 'off-site' || type.toLowerCase() === 'virtual'
            );
            assignments.push({
              cohortId: cohort.id,
              sessionId: scheduledSession.sessionId,
              locationName: locationType || 'Off-site',
              locationType: locationType || 'Off-site',
              capacity: requiredCapacity,
              building: 'N/A',
              floor: undefined
            });
          } else {
            // Try to find a location that matches requirements
            let matchingLocation = null;

            if (requiredTypes.length > 0) {
              // Find location with matching type AND adequate capacity
              matchingLocation = locations.find(l =>
                requiredTypes.includes(l.type) && l.capacity >= requiredCapacity
              );
            } else {
              // No type required, just find adequate capacity
              matchingLocation = locations.find(l => l.capacity >= requiredCapacity);
            }

            if (matchingLocation) {
              assignments.push({
                cohortId: cohort.id,
                sessionId: scheduledSession.sessionId,
                locationName: matchingLocation.name,
                locationType: matchingLocation.type,
                capacity: matchingLocation.capacity,
                building: matchingLocation.address,
                floor: undefined
              });
            } else {
              // No matching location found
              unmatched.push({
                cohortId: cohort.id,
                sessionId: scheduledSession.sessionId,
                requiredTypes,
                requiredCapacity,
                reason: requiredTypes.length > 0
                  ? `No locations with type ${requiredTypes.join(' or ')} and capacity ${requiredCapacity}+`
                  : `No locations with capacity ${requiredCapacity}+`
              });
            }
          }
        }
      });
    });

    return { assignments, unmatched };
  }, [formData.cohortDetails, formData.scheduledSessions, formData.sessions, locations]);

  // Save assignments to formData whenever they change
  useEffect(() => {
    if (assignments.length > 0 && !loading) {
      updateFormData({ locationAssignments: assignments });
    }
  }, [assignments, loading]);

  // Group assignments and unmatched by cohort
  const assignmentsByCohort = formData.cohortDetails.map(cohort => ({
    cohort,
    assignments: assignments.filter(a => a.cohortId === cohort.id),
    unmatched: unmatched.filter(u => u.cohortId === cohort.id)
  }));

  // Calculate KPIs
  const uniqueLocations = new Set(assignments.map(a => a.locationName)).size;
  const locationTypes = new Set(assignments.map(a => a.locationType)).size;

  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
  };


  if (loading) {
    return (
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Location Assignments</h1>
          <p className="text-gray-600 mt-1">Loading locations from database...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Location Assignments</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Failed to load locations</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Location Assignments</h1>
        <p className="text-gray-600 mt-1">
          Review automatically assigned locations for each session. Assignments are based on location type preferences and capacity requirements.
        </p>
      </div>

      {/* KPI Summary */}
      {(assignments.length > 0 || unmatched.length > 0) && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Assignments</p>
            <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Unique Locations</p>
            <p className="text-3xl font-bold text-teal-600">{uniqueLocations}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Unmatched Sessions</p>
            <p className={`text-3xl font-bold ${unmatched.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {unmatched.length}
            </p>
          </div>
        </div>
      )}

      {assignments.length === 0 && unmatched.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">No Sessions Configured</h3>
            <p className="text-sm text-blue-700">
              There are no scheduled sessions to assign locations to.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {assignmentsByCohort.map(({ cohort, assignments: cohortAssignments, unmatched: cohortUnmatched }) => (
            <div key={cohort.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Cohort Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{cohort.name}</h3>
                    <p className="text-sm text-gray-600">
                      Starts: {formatDateString(cohort.startDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignments Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cohortAssignments.map((assignment, idx) => {
                      const session = formData.sessions.find(s => s.id === assignment.sessionId);
                      const scheduledSession = formData.scheduledSessions.find(
                        s => s.sessionId === assignment.sessionId
                      );

                      const capacityStatus = session && assignment.capacity >= session.groupSizeMax
                        ? 'adequate'
                        : 'warning';

                      const isOffSiteOrVirtual = assignment.locationType?.toLowerCase() === 'off-site' ||
                                                  assignment.locationType?.toLowerCase() === 'virtual';

                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">{session?.name}</div>
                              {!isOffSiteOrVirtual && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Matched
                                </span>
                              )}
                            </div>
                            {session && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                Group size: {session.groupSizeMin}-{session.groupSizeMax}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {scheduledSession && (
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Week {scheduledSession.startWeek + 1}, {scheduledSession.startDay} {formatTime12Hour(scheduledSession.startTime)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{assignment.locationName}</div>
                            {assignment.building && (
                              <div className="text-xs text-gray-500">
                                {assignment.building}, Floor {assignment.floor}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {assignment.locationType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm font-medium ${
                              capacityStatus === 'adequate' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {assignment.capacity} people
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Unmatched sessions */}
                    {cohortUnmatched.map((unmatchedSession, idx) => {
                      const session = formData.sessions.find(s => s.id === unmatchedSession.sessionId);
                      const scheduledSession = formData.scheduledSessions.find(
                        s => s.sessionId === unmatchedSession.sessionId
                      );

                      return (
                        <tr key={`unmatched-${idx}`} className="bg-red-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">{session?.name}</div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                No Match
                              </span>
                            </div>
                            {session && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                Group size: {session.groupSizeMin}-{session.groupSizeMax}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {scheduledSession && (
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Week {scheduledSession.startWeek + 1}, {scheduledSession.startDay} {formatTime12Hour(scheduledSession.startTime)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-red-700">No location assigned</div>
                            <div className="text-xs text-red-600">{unmatchedSession.reason}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-red-700 font-medium">Required:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {unmatchedSession.requiredTypes.length > 0 ? (
                                unmatchedSession.requiredTypes.map((type, typeIdx) => (
                                  <span
                                    key={typeIdx}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                                  >
                                    {type}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">Any type</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-red-700">
                              {unmatchedSession.requiredCapacity}+ people
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
