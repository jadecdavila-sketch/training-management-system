import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/common/Button';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { usersApi, locationsApi, programsApi } from '@/services/api';
import { filterParticipantsByCascade } from '@/utils/participantFilters';

interface SessionEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: any;
  programId: string;
  cohortId: string;
}

type TabType = 'details' | 'participants';

export const SessionEditDrawer: React.FC<SessionEditDrawerProps> = ({
  open,
  onOpenChange,
  schedule,
  programId,
  cohortId,
}) => {
  const [facilitatorId, setFacilitatorId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('details');

  const queryClient = useQueryClient();

  // Fetch facilitators
  const { data: facilitatorsData } = useQuery({
    queryKey: ['facilitators'],
    queryFn: () => usersApi.getFacilitators(),
    enabled: open,
  });

  // Fetch locations
  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getAll({ pageSize: 1000 }),
    enabled: open,
  });

  // Fetch cohort data with participants
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
    enabled: open && !!cohortId,
  });

  const facilitators = facilitatorsData?.data || [];
  const locations = locationsData?.data || [];
  const allCohortParticipants = cohortData?.cohort?.participants || [];
  const program = cohortData?.program;
  const cohort = cohortData?.cohort;

  // Cascading filter: Program region → Cohort date range → Session participantTypes
  const filteredParticipants = React.useMemo(() => {
    const participantTypes = schedule?.session?.participantTypes || [];
    const programRegion = program?.formData?.region;
    const cohortFilters = cohort?.formData?.participantFilters;

    // Extract participants from enrollments
    const participants = allCohortParticipants.map((enrollment: any) => enrollment.participant);

    console.log('Session filtering:', {
      totalInCohort: participants.length,
      participantTypes,
      programRegion,
      cohortFilters,
      sampleParticipant: participants[0],
      allEnrollments: allCohortParticipants.length
    });

    // Apply cascading filters using utility function
    const filtered = filterParticipantsByCascade(
      participants,
      programRegion,
      cohortFilters,
      participantTypes
    );

    console.log('After filtering:', filtered.length);

    // Map back to enrollments for display
    return allCohortParticipants.filter((enrollment: any) =>
      filtered.includes(enrollment.participant)
    );
  }, [allCohortParticipants, schedule?.session?.participantTypes, program?.formData?.region, cohort?.formData?.participantFilters]);

  useEffect(() => {
    if (schedule && open) {
      setFacilitatorId(schedule.facilitatorId || '');
      setLocationId(schedule.locationId || '');

      // Parse date and time from ISO string
      const start = new Date(schedule.startTime);
      const end = new Date(schedule.endTime);

      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5)); // HH:MM format
      setEndTime(end.toTimeString().slice(0, 5));
    }
  }, [schedule, open]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // Update schedule via API
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update schedule' }));
        throw new Error(errorData.error || errorData.details || 'Failed to update schedule');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohort', cohortId] });
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Schedule update error:', error);
      alert(error.message || 'Failed to update session');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine date and time into ISO strings
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${startDate}T${endTime}`);

    const data: any = {
      facilitatorId: facilitatorId || null,
      locationId: locationId || null,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };

    console.log('Submitting schedule update:', {
      scheduleId: schedule.id,
      data,
      url: `/api/schedules/${schedule.id}`
    });

    updateMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  if (!schedule) return null;

  const hasIssues = !schedule.facilitatorId || !schedule.locationId;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-secondary-200">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-2xl font-bold text-secondary-900">
                  {schedule.session?.title || 'Session Details'}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-secondary-600">
                  Update facilitator, location, and scheduling details for this session.
                </Dialog.Description>
                {hasIssues && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>This session needs a facilitator and/or location assignment</span>
                  </div>
                )}
              </div>
              <Dialog.Close className="text-secondary-400 hover:text-secondary-600 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Dialog.Close>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-secondary-200 bg-white">
            <div className="px-8">
              <div className="flex gap-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`py-4 border-b-2 font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('participants')}
                  className={`py-4 border-b-2 font-medium transition-colors ${
                    activeTab === 'participants'
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  Participants ({filteredParticipants.length})
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {activeTab === 'details' && (
                <>
              {/* Session Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Session Information
                </h3>

                {schedule.session?.description && (
                  <p className="text-sm text-secondary-600 mb-4">
                    {schedule.session.description}
                  </p>
                )}

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">
                      Currently scheduled: {formatDate(schedule.startTime)} at {formatTime(schedule.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">
                      Duration: {Math.round((new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime()) / (1000 * 60))} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Session Filters */}
              <div className="mb-8 space-y-4">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Session Requirements
                </h3>

                {/* Participant Types Filter */}
                {schedule.session?.participantTypes?.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Participant Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {schedule.session.participantTypes.map((type: string) => (
                        <span key={type} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          {type}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-blue-700">
                      Only participants matching these departments or job titles will be included
                    </p>
                  </div>
                )}

                {/* Facilitator Skills Filter */}
                {schedule.session?.facilitatorSkills?.length > 0 && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 mb-2">Required Facilitator Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {schedule.session.facilitatorSkills.map((skill: string) => (
                        <span key={skill} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-purple-700">
                      Facilitator must have ALL of these skills
                    </p>
                  </div>
                )}

                {/* Location Types Filter */}
                {schedule.session?.locationTypes?.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2">Preferred Location Type:</p>
                    <div className="flex flex-wrap gap-2">
                      {schedule.session.locationTypes.map((type: string) => (
                        <span key={type} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Facilitator Assignment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Facilitator
                  </div>
                </label>
                <select
                  value={facilitatorId}
                  onChange={(e) => setFacilitatorId(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">No facilitator assigned</option>
                  {facilitators.map((facilitator: any) => (
                    <option key={facilitator.id} value={facilitator.id}>
                      {facilitator.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Assignment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">No location assigned</option>
                  {locations.map((location: any) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="mb-6 pt-6 border-t border-secondary-200">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Schedule
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
                </>
              )}

              {activeTab === 'participants' && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    Session Participants
                  </h3>

                  {schedule.session?.participantTypes?.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium mb-1">Filtered by participant type:</p>
                      <div className="flex flex-wrap gap-2">
                        {schedule.session.participantTypes.map((type: string) => (
                          <span key={type} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredParticipants.length === 0 ? (
                    <div className="text-center py-12 bg-secondary-50 rounded-lg">
                      <p className="text-secondary-600">
                        {allCohortParticipants.length === 0
                          ? 'No participants enrolled in this cohort yet'
                          : 'No participants match the session filters'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-secondary-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-600 uppercase">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-600 uppercase">
                              Department
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-600 uppercase">
                              Job Title
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-200">
                          {filteredParticipants.map((enrollment: any) => (
                            <tr key={enrollment.participantId} className="hover:bg-secondary-50">
                              <td className="px-4 py-3 text-sm text-secondary-900">
                                {enrollment.participant.firstName} {enrollment.participant.lastName}
                              </td>
                              <td className="px-4 py-3 text-sm text-secondary-700">
                                {enrollment.participant.department || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-secondary-700">
                                {enrollment.participant.jobTitle || '-'}
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

            {/* Footer */}
            <div className="px-8 py-6 border-t border-secondary-200 bg-white flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-teal-600 hover:bg-teal-700"
                loading={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
