import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { programsApi } from '@/services/api';
import { ChevronLeft, Calendar, Users, AlertCircle, Edit } from 'lucide-react';
import { formatDateTime } from '@/utils/dateUtils';

export const ProgramCohortsPage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();

  const { data: programData, isLoading } = useQuery({
    queryKey: ['program', programId],
    queryFn: () => programsApi.getById(programId!),
    enabled: !!programId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-secondary-600">Loading cohorts...</p>
      </div>
    );
  }

  const program = programData?.data;
  const cohorts = program?.cohorts || [];

  // Debug logging
  if (program) {
    console.log('Program data:', JSON.stringify(program, null, 2));
    console.log('First cohort:', cohorts[0]);
    if (cohorts[0]) {
      console.log('First cohort schedules:', cohorts[0].schedules);
      console.log('Schedules length:', cohorts[0].schedules?.length);
    }
  }


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
          onClick={() => navigate('/admin/programs')}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Programs
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{program?.name}</h1>
            <p className="text-secondary-600 mt-1">{program?.description}</p>
          </div>
          <button
            onClick={() => navigate(`/admin/programs/edit/${programId}`)}
            className="flex items-center gap-2 px-4 py-2 border border-secondary-300 text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Program
          </button>
        </div>
      </div>

      {/* Cohorts Grid */}
      <div className="px-8 py-8">
        {cohorts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary-600">No cohorts found for this program</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cohorts.map((cohort: any) => {
              const scheduleCount = cohort.schedules?.length || 0;
              const participantCount = cohort.participants?.length || 0;
              const unassignedSessions = cohort.schedules?.filter((s: any) => {
                // Check if session requires facilitator assignment
                const needsFacilitator = s.session?.requiresFacilitator && !s.facilitatorId;

                // Check if session requires location assignment (not virtual)
                const isVirtual = s.session?.locationTypes?.some((type: string) =>
                  type.toLowerCase() === 'virtual'
                );
                const needsLocation = !isVirtual && !s.locationId;

                return needsFacilitator || needsLocation;
              }).length || 0;

              return (
                <div
                  key={cohort.id}
                  onClick={() => navigate(`/admin/cohorts/${cohort.id}`)}
                  className="bg-white border border-secondary-200 rounded-xl p-6 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {cohort.name}
                      </h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        {cohort.startDate && cohort.endDate ? (
                          <>
                            {formatDateTime(cohort.startDate)} - {formatDateTime(cohort.endDate)}
                          </>
                        ) : 'No dates set'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(cohort.status)}`}>
                      {cohort.status}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-secondary-500" />
                      <span className="text-secondary-700">{scheduleCount} sessions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-secondary-500" />
                      <span className="text-secondary-700">
                        {participantCount} / {cohort.capacity} participants
                      </span>
                    </div>
                    {unassignedSessions > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-700">
                          {unassignedSessions} session{unassignedSessions !== 1 ? 's' : ''} need assignment
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
