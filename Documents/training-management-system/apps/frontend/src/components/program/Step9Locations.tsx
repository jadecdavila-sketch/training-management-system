import { MapPin, Calendar, AlertCircle } from 'lucide-react';

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
  // Mock location pool for demonstration
  const mockLocations = [
    { name: 'Conference Room A', type: 'Conference Room', capacity: 12, building: 'Main', floor: '3' },
    { name: 'Training Center 1', type: 'Training Room', capacity: 20, building: 'East', floor: '2' },
    { name: 'Board Room', type: 'Conference Room', capacity: 16, building: 'Main', floor: '5' },
    { name: 'Workshop Space', type: 'Workshop', capacity: 30, building: 'West', floor: '1' },
    { name: 'Virtual Meeting Room 1', type: 'Virtual', capacity: 100 },
    { name: 'Collaboration Hub', type: 'Open Space', capacity: 25, building: 'North', floor: '2' },
    { name: 'Executive Suite', type: 'Conference Room', capacity: 8, building: 'Main', floor: '6' },
  ];

  // Generate round-robin assignments if not already done
  const generateAssignments = () => {
    if (formData.locationAssignments && formData.locationAssignments.length > 0) {
      return formData.locationAssignments;
    }

    const assignments: LocationAssignment[] = [];
    let locationIndex = 0;

    formData.cohortDetails.forEach(cohort => {
      formData.scheduledSessions.forEach(scheduledSession => {
        const session = formData.sessions.find(s => s.id === scheduledSession.sessionId);

        if (session) {
          // Find location with matching type or assign round-robin
          let location = mockLocations[locationIndex % mockLocations.length];

          // Try to match location types if specified
          if (session.locationTypes && session.locationTypes.length > 0) {
            const matchingLocation = mockLocations.find(l =>
              session.locationTypes.includes(l.type)
            );
            if (matchingLocation) {
              location = matchingLocation;
            }
          }

          // Check capacity requirements
          if (session.groupSizeMax > location.capacity) {
            // Find a larger location
            const largerLocation = mockLocations.find(l => l.capacity >= session.groupSizeMax);
            if (largerLocation) {
              location = largerLocation;
            }
          }

          assignments.push({
            cohortId: cohort.id,
            sessionId: scheduledSession.sessionId,
            locationName: location.name,
            locationType: location.type,
            capacity: location.capacity,
            building: location.building,
            floor: location.floor
          });

          locationIndex++;
        }
      });
    });

    updateFormData({ locationAssignments: assignments });
    return assignments;
  };

  const assignments = generateAssignments();

  // Group assignments by cohort
  const assignmentsByCohort = formData.cohortDetails.map(cohort => ({
    cohort,
    assignments: assignments.filter(a => a.cohortId === cohort.id)
  }));

  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Location Assignments</h1>
        <p className="text-gray-600 mt-1">
          Review automatically assigned locations for each session. Assignments are based on location type preferences and capacity requirements.
        </p>
      </div>

      {assignments.length === 0 ? (
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
          {assignmentsByCohort.map(({ cohort, assignments: cohortAssignments }) => (
            <div key={cohort.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Cohort Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{cohort.name}</h3>
                    <p className="text-sm text-gray-600">
                      Starts: {formatDate(cohort.startDate)}
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

                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{session?.name}</div>
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
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {assignments.length > 0 && (
        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-900">Total Assignments</p>
              <p className="text-2xl font-bold text-teal-700">{assignments.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-teal-900">Unique Locations</p>
              <p className="text-2xl font-bold text-teal-700">
                {new Set(assignments.map(a => a.locationName)).size}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-teal-900">Location Types</p>
              <p className="text-2xl font-bold text-teal-700">
                {new Set(assignments.map(a => a.locationType)).size}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
