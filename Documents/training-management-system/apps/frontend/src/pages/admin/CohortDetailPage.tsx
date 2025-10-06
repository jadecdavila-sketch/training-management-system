import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsApi } from '@/services/api';
import { ChevronLeft, Calendar, Users, LayoutList, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

type TabType = 'sessions' | 'participants';

export const CohortDetailPage = () => {
  const { cohortId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('sessions');

  // For now, we'll need to fetch the program and find the cohort
  // TODO: Create a dedicated cohort API endpoint
  const { data, isLoading } = useQuery({
    queryKey: ['cohort', cohortId],
    queryFn: async () => {
      // This is a temporary solution - we should create a proper cohort endpoint
      const allPrograms = await programsApi.getAll({ page: 1, pageSize: 100 });
      for (const program of allPrograms.data) {
        const cohort = program.cohorts?.find((c: any) => c.id === cohortId);
        if (cohort) {
          return { program, cohort };
        }
      }
      throw new Error('Cohort not found');
    },
    enabled: !!cohortId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-secondary-600">Loading cohort...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Cohort not found</p>
      </div>
    );
  }

  const { program, cohort } = data;
  const schedules = cohort.schedules || [];
  const participants = cohort.participants || [];
  const unassignedCount = schedules.filter((s: any) => !s.facilitatorId || !s.locationId).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-secondary-100 text-secondary-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-8 py-6">
        <button
          onClick={() => navigate(`/admin/programs/${program.id}/cohorts`)}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {program.name}
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">{cohort.name}</h1>
            <p className="text-secondary-600">
              {formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}
            </p>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-600">Status:</span>
            <button
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                cohort.status === 'active' ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  cohort.status === 'active' ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${cohort.status === 'active' ? 'text-green-700' : 'text-gray-600'}`}>
              {cohort.status === 'active' ? 'Active' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Overall Progress</h3>
            <span className="text-sm font-semibold text-gray-900">
              {(() => {
                const now = new Date();
                const start = new Date(cohort.startDate);
                const end = new Date(cohort.endDate);
                const total = end.getTime() - start.getTime();
                const elapsed = now.getTime() - start.getTime();
                const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
                return Math.round(progress);
              })()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all"
              style={{
                width: `${(() => {
                  const now = new Date();
                  const start = new Date(cohort.startDate);
                  const end = new Date(cohort.endDate);
                  const total = end.getTime() - start.getTime();
                  const elapsed = now.getTime() - start.getTime();
                  const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
                  return progress;
                })()}%`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>{formatDate(cohort.startDate)}</span>
            <span>{formatDate(cohort.endDate)}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
                <p className="text-sm text-gray-600">Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
            </div>
          </div>

          {unassignedCount > 0 && (
            <div className="bg-white border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-900">{unassignedCount}</p>
                  <p className="text-sm text-orange-700">Need Assignment</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{cohort.capacity}</p>
                <p className="text-sm text-gray-600">Capacity</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200 bg-white">
        <div className="px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'sessions'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'participants'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Participants
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-8 py-8">
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900">Session Schedule</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-secondary-300 text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors">
                  <LayoutList className="w-4 h-4 inline mr-2" />
                  List View
                </button>
                <button className="px-4 py-2 border border-secondary-300 text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Calendar View
                </button>
              </div>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-12 bg-secondary-50 rounded-lg">
                <p className="text-secondary-600">No sessions scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule: any) => {
                  const hasIssues = !schedule.facilitatorId || !schedule.locationId;

                  return (
                    <div
                      key={schedule.id}
                      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all ${
                        hasIssues ? 'border-orange-300' : 'border-secondary-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-secondary-900">
                              {schedule.session?.title}
                            </h3>
                            {!hasIssues && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-secondary-600 mb-1">Date & Time</p>
                              <p className="font-medium text-secondary-900">
                                {formatDate(schedule.startTime)}
                              </p>
                              <p className="text-secondary-700">
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                              </p>
                            </div>

                            <div>
                              <p className="text-secondary-600 mb-1">Facilitator</p>
                              {schedule.facilitator ? (
                                <p className="font-medium text-secondary-900">
                                  {schedule.facilitator.user.name}
                                </p>
                              ) : (
                                <p className="text-orange-600 font-medium">Not assigned</p>
                              )}
                            </div>

                            <div>
                              <p className="text-secondary-600 mb-1">Location</p>
                              {schedule.location ? (
                                <p className="font-medium text-secondary-900">
                                  {schedule.location.name}
                                </p>
                              ) : (
                                <p className="text-orange-600 font-medium">Not assigned</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <button className="px-4 py-2 text-sm border border-secondary-300 text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors">
                          Manage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'participants' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900">
                Participants ({participants.length})
              </h2>
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                Add Participants
              </button>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-12 bg-secondary-50 rounded-lg">
                <p className="text-secondary-600">No participants enrolled yet</p>
              </div>
            ) : (
              <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {participants.map((enrollment: any) => (
                      <tr key={enrollment.participantId} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 text-sm text-secondary-900">
                          {enrollment.participant.firstName} {enrollment.participant.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-700">
                          {enrollment.participant.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-700">
                          {enrollment.participant.department || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-teal-600 hover:text-teal-700">
                            Move
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
