import { useState, useEffect } from 'react';
import { CheckCircle2, Calendar, Users, BookOpen } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { programsApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { parseLocalDate, formatDateString } from '@/utils/dateUtils';

interface ProgramFormData {
  programName: string;
  region: string;
  description: string;
  useBlocks: boolean;
  numberOfSessions: number;
  programDuration: number;
  blocks: Array<{
    id: string;
    name: string;
    numberOfSessions: number;
    duration: number;
  }>;
  sessions: Array<{
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
  }>;
  scheduledSessions: Array<{
    sessionId: string;
    startWeek: number;
    startDay: string;
    startTime: string;
  }>;
  numberOfCohorts: number;
  blackoutPeriods: Array<{
    id: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  cohortDetails: Array<{
    id: string;
    name: string;
    startDate: string;
  }>;
  facilitatorAssignments?: Array<{
    cohortId: string;
    sessionId: string;
    facilitatorName: string;
  }>;
  locationAssignments?: Array<{
    cohortId: string;
    sessionId: string;
    locationName: string;
  }>;
}

interface Step10Props {
  formData: ProgramFormData;
  updateFormData: (updates: Partial<ProgramFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  programId?: string;
  isEditMode?: boolean;
  onCreateProgram?: (callback: () => void) => void;
}

export function Step10ProgramSummary({ formData, onBack, programId, isEditMode, onCreateProgram }: Step10Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const createProgramMutation = useMutation({
    mutationFn: programsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      navigate('/admin/programs');
    },
    onError: (error: any) => {
      console.error('Full error:', error);
      const errorMessage = error.response?.data?.details || error.message || 'Unknown error';
      alert(`Failed to create program: ${errorMessage}`);
      setIsSaving(false);
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: (data: any) => programsApi.update(programId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      navigate(`/admin/programs/${programId}/cohorts`);
    },
    onError: (error: any) => {
      console.error('Full error:', error);
      const errorMessage = error.response?.data?.details || error.message || 'Unknown error';
      alert(`Failed to update program: ${errorMessage}`);
      setIsSaving(false);
    },
  });

  // Register the create program callback with the parent wizard
  useEffect(() => {
    if (onCreateProgram) {
      onCreateProgram(handleSaveProgram);
    }
  }, [onCreateProgram]);

  const handleSaveProgram = () => {
    setIsSaving(true);

    if (isEditMode) {
      // In edit mode, just update the formData
      const updateData = {
        programName: formData.programName,
        region: formData.region,
        description: formData.description,
        formData: formData, // Update the stored formData
      };
      updateProgramMutation.mutate(updateData);
    } else {
      // Transform scheduledSessions from relative (week/day/time) to absolute timestamps
      // Use the first cohort's start date as the base
      const baseStartDate = formData.cohortDetails[0]?.startDate
        ? parseLocalDate(formData.cohortDetails[0].startDate)
        : new Date();

      const transformedScheduledSessions = formData.scheduledSessions.map(session => {
        // Convert day name to day index (Mon=0, Tue=1, etc.)
        const dayMap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };
        const startDayIndex = dayMap[session.startDay] ?? 0;
        const endDayIndex = dayMap[session.endDay] ?? 0;

        // Calculate start timestamp: base date + (startWeek * 7 days) + startDayIndex
        const startDate = new Date(baseStartDate);
        startDate.setDate(startDate.getDate() + (session.startWeek * 7) + startDayIndex);

        // Parse time (e.g., "09:00") and set it
        const [startHours, startMinutes] = session.startTime.split(':').map(Number);
        startDate.setHours(startHours, startMinutes, 0, 0);

        // Calculate end timestamp
        const endDate = new Date(baseStartDate);
        endDate.setDate(endDate.getDate() + (session.endWeek * 7) + endDayIndex);
        const [endHours, endMinutes] = session.endTime.split(':').map(Number);
        endDate.setHours(endHours, endMinutes, 0, 0);

        // Find the session name from the sessions list
        const sessionDetail = formData.sessions.find(s => s.id === session.sessionId);

        return {
          sessionId: session.sessionId,
          sessionName: sessionDetail?.name || '',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        };
      });

      // Also calculate endDate for each cohort based on the last scheduled session
      const cohortsWithEndDates = formData.cohortDetails.map(cohort => {
        const cohortStartDate = parseLocalDate(cohort.startDate);

        // Find the latest scheduled session end time
        let latestEndDate = new Date(cohortStartDate);
        if (transformedScheduledSessions.length > 0) {
          const lastSession = transformedScheduledSessions[transformedScheduledSessions.length - 1];
          latestEndDate = new Date(lastSession.endTime);
        } else {
          // Default to 12 weeks after start
          latestEndDate.setDate(latestEndDate.getDate() + (12 * 7));
        }

        return {
          ...cohort,
          startDate: cohort.startDate,
          endDate: latestEndDate.toISOString()
        };
      });

      const transformedData = {
        ...formData,
        scheduledSessions: transformedScheduledSessions,
        cohortDetails: cohortsWithEndDates,
        // Store original formData for editing (before transformation)
        originalFormData: formData
      };

      createProgramMutation.mutate(transformedData);
    }
  };


  const totalDuration = formData.useBlocks
    ? formData.blocks.reduce((sum, block) => sum + block.duration, 0)
    : formData.programDuration;

  const sessionsRequiringFacilitators = formData.sessions.filter(s => s.requiresFacilitator).length;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Program Summary</h1>
        </div>
        <p className="text-gray-600">
          Review your program configuration before finalizing. You can go back to any step to make changes.
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
          <p className="text-3xl font-bold text-gray-900">{formData.sessions.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Cohorts</p>
          <p className="text-3xl font-bold text-teal-600">{formData.numberOfCohorts}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Duration (Weeks)</p>
          <p className="text-3xl font-bold text-gray-900">{totalDuration}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Program Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Program Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Program Name</p>
              <p className="font-medium text-gray-900">{formData.programName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Region</p>
              <p className="font-medium text-gray-900">{formData.region}</p>
            </div>
            {formData.description && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium text-gray-900">{formData.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Program Structure */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Program Structure</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Structure Type</p>
              <p className="font-medium text-gray-900">
                {formData.useBlocks ? `${formData.blocks.length} Training Blocks` : 'Simple Sessions'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="font-medium text-gray-900">{formData.sessions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Duration</p>
              <p className="font-medium text-gray-900">{totalDuration} weeks</p>
            </div>
          </div>

          {formData.useBlocks && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Training Blocks</p>
              <div className="space-y-2">
                {formData.blocks.map((block, idx) => (
                  <div key={block.id} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded">
                    <span className="font-medium">{block.name}</span>
                    <span className="text-gray-600">{block.numberOfSessions} sessions · {block.duration} weeks</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cohorts */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Cohorts
          </h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Number of Cohorts</p>
            <p className="font-medium text-gray-900">{formData.numberOfCohorts}</p>
          </div>

          {formData.cohortDetails.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Cohort Schedule</p>
              <div className="space-y-2">
                {formData.cohortDetails.map(cohort => (
                  <div key={cohort.id} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded">
                    <span className="font-medium">{cohort.name}</span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateString(cohort.startDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.blackoutPeriods.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Blackout Periods</p>
              <div className="space-y-2">
                {formData.blackoutPeriods.map(period => (
                  <div key={period.id} className="text-sm bg-orange-50 p-3 rounded">
                    <p className="font-medium text-orange-900">{period.description}</p>
                    <p className="text-orange-700 text-xs mt-1">
                      {formatDateString(period.startDate)} - {formatDateString(period.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resource Assignments */}
        {formData.facilitatorAssignments && formData.facilitatorAssignments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facilitators</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="font-medium text-gray-900">{formData.facilitatorAssignments.length}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Unique Facilitators</p>
                <p className="font-medium text-gray-900">
                  {new Set(formData.facilitatorAssignments.map(a => a.facilitatorName)).size}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Sessions Requiring Facilitators</p>
                <p className="font-medium text-gray-900">{sessionsRequiringFacilitators}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
