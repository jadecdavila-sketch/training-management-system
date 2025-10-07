import { useState } from 'react';
import { X, User, Calendar, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { participantsApi, programsApi, cohortEnrollmentApi } from '@/services/api';
import { formatDateTime } from '@/utils/dateUtils';

interface ParticipantDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  participant: any;
  cohortId: string;
  cohortName: string;
  programId: string;
}

type TabType = 'details' | 'sessions';

export function ParticipantDetailDrawer({
  open,
  onClose,
  participant,
  cohortId,
  cohortName,
  programId,
}: ParticipantDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all programs and cohorts for move functionality
  const { data: programsData } = useQuery({
    queryKey: ['programs'],
    queryFn: () => programsApi.getAll({ page: 1, pageSize: 100 }),
    enabled: showMoveModal,
  });

  // Fetch cohort data with schedules to display participant's sessions
  const { data: cohortData } = useQuery({
    queryKey: ['cohort', cohortId],
    queryFn: async () => {
      const allPrograms = await programsApi.getAll({ page: 1, pageSize: 100 });
      for (const program of allPrograms.data) {
        const cohort = program.cohorts?.find((c: any) => c.id === cohortId);
        if (cohort) {
          return { program, cohort };
        }
      }
      return null;
    },
    enabled: open && !!cohortId && activeTab === 'sessions',
  });

  // Get participant's sessions from the cohort schedules and sort chronologically
  const participantSessions = [...(cohortData?.cohort?.schedules || [])].sort((a: any, b: any) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Mutation to remove participant from cohort
  const removeMutation = useMutation({
    mutationFn: () => cohortEnrollmentApi.removeParticipant(participant.id, cohortId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohort'] });
      setShowRemoveConfirm(false);
      onClose();
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to remove participant from cohort');
    },
  });

  // Mutation to move participant to another cohort
  const moveMutation = useMutation({
    mutationFn: (targetCohortId: string) =>
      cohortEnrollmentApi.moveParticipant(participant.id, cohortId, targetCohortId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohort'] });
      setShowMoveModal(false);
      onClose();
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to move participant to cohort');
    },
  });

  const handleRemoveFromCohort = () => {
    removeMutation.mutate();
  };

  const handleMoveToCohort = (targetCohortId: string) => {
    moveMutation.mutate(targetCohortId);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="border-b border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <User className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-secondary-900">
                  {participant.firstName} {participant.lastName}
                </h2>
                <p className="text-sm text-secondary-600">{participant.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-secondary-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-secondary-200 -mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 border-b-2 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`pb-3 border-b-2 font-medium transition-colors ${
                activeTab === 'sessions'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Sessions
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Participant Information */}
              <div>
                <h3 className="text-sm font-semibold text-secondary-900 mb-4">Participant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-secondary-600">Job Title</label>
                    <p className="text-sm font-medium text-secondary-900 mt-1">
                      {participant.jobTitle || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-secondary-600">Department</label>
                    <p className="text-sm font-medium text-secondary-900 mt-1">
                      {participant.department || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-secondary-600">Location</label>
                    <p className="text-sm font-medium text-secondary-900 mt-1">
                      {participant.location || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-secondary-600">Hire Date</label>
                    <p className="text-sm font-medium text-secondary-900 mt-1">
                      {participant.hireDate
                        ? new Date(participant.hireDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-secondary-600">Status</label>
                    <p className="text-sm font-medium text-secondary-900 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        participant.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cohort Information */}
              <div>
                <h3 className="text-sm font-semibold text-secondary-900 mb-4">Cohort Information</h3>
                <div className="bg-secondary-50 rounded-lg p-4">
                  <p className="text-sm text-secondary-600">Currently enrolled in</p>
                  <p className="text-base font-semibold text-secondary-900 mt-1">{cohortName}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Sessions Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-secondary-900">Scheduled Sessions</h3>
                <p className="text-xs text-secondary-600">
                  {participantSessions.length} {participantSessions.length === 1 ? 'session' : 'sessions'}
                </p>
              </div>

              <p className="text-sm text-secondary-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                This participant is scheduled for all cohort sessions that match their profile and the session's participant type filters.
              </p>

              {!cohortData ? (
                <div className="text-center py-12 bg-secondary-50 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                  <p className="text-secondary-600">Loading sessions...</p>
                </div>
              ) : participantSessions.length === 0 ? (
                <div className="text-center py-12 bg-secondary-50 rounded-lg">
                  <Calendar className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                  <p className="text-secondary-600">No sessions scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participantSessions.map((schedule: any) => (
                    <div
                      key={schedule.id}
                      className="bg-white border border-secondary-200 rounded-lg p-4 hover:border-teal-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-secondary-900 mb-2">
                            {schedule.session?.title}
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-secondary-600">Date & Time</p>
                              <p className="font-medium text-secondary-900">
                                {formatDateTime(schedule.startTime)}
                              </p>
                              <p className="text-secondary-700 text-xs">
                                {new Date(schedule.startTime).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })} - {new Date(schedule.endTime).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-secondary-600">Facilitator</p>
                              <p className="font-medium text-secondary-900">
                                {schedule.facilitator?.user?.name || 'Not assigned'}
                              </p>
                            </div>
                            <div>
                              <p className="text-secondary-600">Location</p>
                              <p className="font-medium text-secondary-900">
                                {schedule.location?.name || 'Not assigned'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove from Cohort
            </button>
            <button
              onClick={() => setShowMoveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Move to Another Cohort
            </button>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowRemoveConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900">Remove Participant</h3>
            </div>
            <p className="text-secondary-700 mb-6">
              Are you sure you want to remove <strong>{participant.firstName} {participant.lastName}</strong> from <strong>{cohortName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 border border-secondary-300 text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveFromCohort}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Remove Participant
              </button>
            </div>
          </div>
        </>
      )}

      {/* Move to Cohort Modal */}
      {showMoveModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMoveModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">Move to Another Cohort</h3>
              <button onClick={() => setShowMoveModal(false)}>
                <X className="w-5 h-5 text-secondary-600" />
              </button>
            </div>
            <p className="text-secondary-700 mb-6">
              Select a cohort to move <strong>{participant.firstName} {participant.lastName}</strong> to:
            </p>

            {/* List of Programs and Cohorts */}
            <div className="space-y-4">
              {programsData?.data.map((program: any) => (
                <div key={program.id} className="border border-secondary-200 rounded-lg p-4">
                  <h4 className="font-medium text-secondary-900 mb-3">{program.name}</h4>
                  <div className="space-y-2">
                    {program.cohorts?.filter((c: any) => c.id !== cohortId).map((cohort: any) => (
                      <button
                        key={cohort.id}
                        onClick={() => handleMoveToCohort(cohort.id)}
                        className="w-full text-left p-3 border border-secondary-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-secondary-900">{cohort.name}</p>
                            <p className="text-sm text-secondary-600">
                              {cohort.startDate && cohort.endDate && (
                                <>
                                  {formatDateTime(cohort.startDate)} - {formatDateTime(cohort.endDate)}
                                </>
                              )}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-secondary-400" />
                        </div>
                      </button>
                    ))}
                    {(!program.cohorts || program.cohorts.filter((c: any) => c.id !== cohortId).length === 0) && (
                      <p className="text-sm text-secondary-500 italic">No other cohorts available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
