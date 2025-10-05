import { Users, Calendar, AlertCircle } from 'lucide-react';

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

interface FacilitatorAssignment {
  cohortId: string;
  sessionId: string;
  facilitatorName: string;
  facilitatorEmail: string;
  skills: string[];
}

interface FormData {
  sessions: Session[];
  scheduledSessions: ScheduledSession[];
  cohortDetails: CohortDetail[];
  facilitatorAssignments?: FacilitatorAssignment[];
}

interface Step8Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step8Facilitators({ formData, updateFormData, onNext, onBack }: Step8Props) {
  // Mock facilitator pool for demonstration
  const mockFacilitators = [
    { name: 'Sarah Johnson', email: 'sarah.j@company.com', skills: ['Leadership', 'Communication', 'Strategy'] },
    { name: 'Michael Chen', email: 'michael.c@company.com', skills: ['Technical', 'Data Analysis', 'Problem Solving'] },
    { name: 'Emily Rodriguez', email: 'emily.r@company.com', skills: ['Team Building', 'Conflict Resolution', 'Coaching'] },
    { name: 'James Wilson', email: 'james.w@company.com', skills: ['Project Management', 'Agile', 'Leadership'] },
    { name: 'Lisa Anderson', email: 'lisa.a@company.com', skills: ['Communication', 'Presentation', 'Facilitation'] },
  ];

  // Generate round-robin assignments if not already done
  const generateAssignments = () => {
    if (formData.facilitatorAssignments && formData.facilitatorAssignments.length > 0) {
      return formData.facilitatorAssignments;
    }

    const assignments: FacilitatorAssignment[] = [];
    let facilitatorIndex = 0;

    formData.cohortDetails.forEach(cohort => {
      formData.scheduledSessions.forEach(scheduledSession => {
        const session = formData.sessions.find(s => s.id === scheduledSession.sessionId);

        if (session?.requiresFacilitator) {
          // Find facilitators with matching skills or assign round-robin
          let facilitator = mockFacilitators[facilitatorIndex % mockFacilitators.length];

          // Try to match skills if specified
          if (session.facilitatorSkills && session.facilitatorSkills.length > 0) {
            const matchingFacilitator = mockFacilitators.find(f =>
              session.facilitatorSkills.some(skill => f.skills.includes(skill))
            );
            if (matchingFacilitator) {
              facilitator = matchingFacilitator;
            }
          }

          assignments.push({
            cohortId: cohort.id,
            sessionId: scheduledSession.sessionId,
            facilitatorName: facilitator.name,
            facilitatorEmail: facilitator.email,
            skills: facilitator.skills
          });

          facilitatorIndex++;
        }
      });
    });

    updateFormData({ facilitatorAssignments: assignments });
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
        <h1 className="text-2xl font-semibold text-gray-900">Facilitator Assignments</h1>
        <p className="text-gray-600 mt-1">
          Review automatically assigned facilitators for each session. Assignments are based on required skills and availability.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">No Facilitators Required</h3>
            <p className="text-sm text-blue-700">
              None of the sessions in your program require facilitators. If this is incorrect, go back to Step 3 and configure facilitator requirements for your sessions.
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
                  <Users className="w-5 h-5 text-gray-600" />
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
                        Facilitator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skills
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cohortAssignments.map((assignment, idx) => {
                      const session = formData.sessions.find(s => s.id === assignment.sessionId);
                      const scheduledSession = formData.scheduledSessions.find(
                        s => s.sessionId === assignment.sessionId
                      );

                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{session?.name}</div>
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
                            <div className="text-sm font-medium text-gray-900">{assignment.facilitatorName}</div>
                            <div className="text-xs text-gray-500">{assignment.facilitatorEmail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {assignment.skills.slice(0, 3).map((skill, skillIdx) => (
                                <span
                                  key={skillIdx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800"
                                >
                                  {skill}
                                </span>
                              ))}
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
              <p className="text-sm font-medium text-teal-900">Unique Facilitators</p>
              <p className="text-2xl font-bold text-teal-700">
                {new Set(assignments.map(a => a.facilitatorEmail)).size}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-teal-900">Cohorts</p>
              <p className="text-2xl font-bold text-teal-700">{formData.cohortDetails.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
