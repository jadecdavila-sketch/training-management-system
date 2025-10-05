import { CheckCircle2, Calendar, Users, MapPin, BookOpen } from 'lucide-react';

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
}

export function Step10ProgramSummary({ formData, onBack }: Step10Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
                      {formatDate(cohort.startDate)}
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
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resource Assignments */}
        <div className="grid grid-cols-2 gap-6">
          {/* Facilitators */}
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

          {/* Locations */}
          {formData.locationAssignments && formData.locationAssignments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Locations
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="font-medium text-gray-900">{formData.locationAssignments.length}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Unique Locations</p>
                  <p className="font-medium text-gray-900">
                    {new Set(formData.locationAssignments.map(a => a.locationName)).size}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-teal-900 mb-4">Program Statistics</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-700">{formData.sessions.length}</p>
              <p className="text-sm text-teal-600 mt-1">Total Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-700">{formData.scheduledSessions.length}</p>
              <p className="text-sm text-teal-600 mt-1">Scheduled</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-700">{formData.numberOfCohorts}</p>
              <p className="text-sm text-teal-600 mt-1">Cohorts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-700">{totalDuration}</p>
              <p className="text-sm text-teal-600 mt-1">Weeks</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border-2 border-teal-500 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Ready to Create Program?</h3>
              <p className="text-sm text-gray-600">
                Review all details above. Click "Create Program" to finalize or go back to make changes.
              </p>
            </div>
            <button
              onClick={() => {
                // This would typically save to the backend
                alert('Program created successfully!');
              }}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Program
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
