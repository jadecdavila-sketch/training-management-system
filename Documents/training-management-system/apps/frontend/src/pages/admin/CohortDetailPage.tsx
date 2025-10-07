import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsApi } from '@/services/api';
import { ChevronLeft, Calendar, Users, LayoutList, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { SessionEditDrawer } from '@/components/admin/SessionEditDrawer';
import { formatDateTime } from '@/utils/dateUtils';

type TabType = 'sessions' | 'participants';

// Calendar View Component
const CalendarView = ({ schedules, cohortStartDate, cohortEndDate, onSessionClick }: {
  schedules: any[];
  cohortStartDate: string;
  cohortEndDate: string;
  onSessionClick: (schedule: any) => void;
}) => {
  // Group sessions by date
  const sessionsByDate = schedules.reduce((acc: Record<string, any[]>, schedule) => {
    const dateKey = new Date(schedule.startTime).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {});

  // Get all dates in the cohort range
  const startDate = new Date(cohortStartDate);
  const endDate = new Date(cohortEndDate);
  const allDates: Date[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    allDates.push(new Date(d));
  }

  // Group dates by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  allDates.forEach((date, index) => {
    if (index === 0) {
      // Add empty cells for days before the first date
      const dayOfWeek = date.getDay();
      const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
      for (let i = 0; i < offset; i++) {
        currentWeek.push(null as any);
      }
    }

    currentWeek.push(date);

    if (currentWeek.length === 7 || index === allDates.length - 1) {
      // Fill remaining days with null
      while (currentWeek.length < 7) {
        currentWeek.push(null as any);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 bg-secondary-50 border-b border-secondary-200">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="px-2 py-3 text-center text-xs font-semibold text-secondary-600 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 border-b border-secondary-200 last:border-b-0">
          {week.map((date, dayIndex) => {
            if (!date) {
              return <div key={dayIndex} className="min-h-24 bg-secondary-25 border-r border-secondary-200 last:border-r-0" />;
            }

            const dateKey = date.toISOString().split('T')[0];
            const daySessions = sessionsByDate[dateKey] || [];
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div
                key={dayIndex}
                className={`min-h-24 border-r border-secondary-200 last:border-r-0 p-2 ${
                  isToday ? 'bg-teal-50' : 'bg-white'
                }`}
              >
                <div className={`text-right text-sm mb-1 ${
                  isToday ? 'font-bold text-teal-700' : 'text-secondary-700'
                }`}>
                  {date.getDate()}
                </div>

                <div className="space-y-1">
                  {daySessions.map((session, idx) => {
                    const hasIssues = !session.facilitatorId || !session.locationId;
                    return (
                      <button
                        key={idx}
                        onClick={() => onSessionClick(session)}
                        className={`w-full text-left px-1.5 py-1 rounded text-xs transition-all hover:shadow-sm ${
                          hasIssues
                            ? 'bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300'
                            : 'bg-teal-100 hover:bg-teal-200 text-teal-900 border border-teal-300'
                        }`}
                      >
                        <div className="font-medium truncate">
                          {formatTime(session.startTime)}
                        </div>
                        <div className="truncate">
                          {session.session?.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const CohortDetailPage = () => {
  const { cohortId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [participantSearch, setParticipantSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  // Sort schedules chronologically by startTime
  const sortedSchedules = [...(cohort.schedules || [])].sort((a: any, b: any) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Filter and search schedules
  const filteredSchedules = sortedSchedules.filter((schedule: any) => {
    // Status filter
    const hasAssignments = schedule.facilitatorId && schedule.locationId;
    if (statusFilter === 'assigned' && !hasAssignments) return false;
    if (statusFilter === 'unassigned' && hasAssignments) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const sessionTitle = schedule.session?.title?.toLowerCase() || '';
      const facilitatorName = schedule.facilitator?.user?.name?.toLowerCase() || '';
      const locationName = schedule.location?.name?.toLowerCase() || '';

      return sessionTitle.includes(query) ||
             facilitatorName.includes(query) ||
             locationName.includes(query);
    }

    return true;
  });

  const schedules = sortedSchedules;
  const participants = cohort.participants || [];
  const unassignedCount = schedules.filter((s: any) => !s.facilitatorId || !s.locationId).length;

  // Get unique departments from participants
  const uniqueDepartments = Array.from(
    new Set(participants.map((p: any) => p.participant?.department).filter(Boolean))
  ).sort();

  // Filter participants
  const filteredParticipants = participants.filter((enrollment: any) => {
    const participant = enrollment.participant;

    // Department filter
    if (departmentFilter !== 'all' && participant.department !== departmentFilter) {
      return false;
    }

    // Search filter
    if (participantSearch) {
      const query = participantSearch.toLowerCase();
      const fullName = `${participant.firstName} ${participant.lastName}`.toLowerCase();
      const email = participant.email?.toLowerCase() || '';
      const dept = participant.department?.toLowerCase() || '';
      const jobTitle = participant.jobTitle?.toLowerCase() || '';

      return fullName.includes(query) ||
             email.includes(query) ||
             dept.includes(query) ||
             jobTitle.includes(query);
    }

    return true;
  });


  const formatDateTime = (dateString: string) => {
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
              {formatDateTime(cohort.startDate)} - {formatDateTime(cohort.endDate)}
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
            <span>{formatDateTime(cohort.startDate)}</span>
            <span>{formatDateTime(cohort.endDate)}</span>
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
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                    viewMode === 'calendar'
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Calendar View
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search sessions, facilitators, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-600">Status:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  All ({schedules.length})
                </button>
                <button
                  onClick={() => setStatusFilter('assigned')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === 'assigned'
                      ? 'bg-teal-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  Assigned ({schedules.length - unassignedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('unassigned')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === 'unassigned'
                      ? 'bg-orange-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  Needs Assignment ({unassignedCount})
                </button>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="ml-2 text-sm text-secondary-600 hover:text-secondary-900"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {filteredSchedules.length === 0 ? (
              <div className="text-center py-12 bg-secondary-50 rounded-lg">
                <p className="text-secondary-600">
                  {schedules.length === 0
                    ? 'No sessions scheduled yet'
                    : 'No sessions match your filters'}
                </p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {filteredSchedules.map((schedule: any) => {
                  const hasIssues = !schedule.facilitatorId || !schedule.locationId;

                  return (
                    <div
                      key={schedule.id}
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setDrawerOpen(true);
                      }}
                      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                        hasIssues ? 'border-orange-300 hover:border-orange-400' : 'border-secondary-200 hover:border-teal-300'
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
                                {formatDateTime(schedule.startTime)}
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
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Calendar View */
              <CalendarView
                schedules={filteredSchedules}
                cohortStartDate={cohort.startDate}
                cohortEndDate={cohort.endDate}
                onSessionClick={(schedule) => {
                  setSelectedSchedule(schedule);
                  setDrawerOpen(true);
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'participants' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900">
                Participants ({participants.length})
              </h2>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search participants by name, email, department, or job title..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-600">Department:</span>
                <button
                  onClick={() => setDepartmentFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    departmentFilter === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  All ({participants.length})
                </button>
                {uniqueDepartments.map((dept: string) => {
                  const count = participants.filter((p: any) => p.participant?.department === dept).length;
                  return (
                    <button
                      key={dept}
                      onClick={() => setDepartmentFilter(dept)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        departmentFilter === dept
                          ? 'bg-teal-600 text-white'
                          : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                      }`}
                    >
                      {dept} ({count})
                    </button>
                  );
                })}
                {(participantSearch || departmentFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setParticipantSearch('');
                      setDepartmentFilter('all');
                    }}
                    className="ml-2 text-sm text-secondary-600 hover:text-secondary-900"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {filteredParticipants.length === 0 ? (
              <div className="text-center py-12 bg-secondary-50 rounded-lg">
                <p className="text-secondary-600">
                  {participants.length === 0
                    ? 'No participants enrolled yet'
                    : 'No participants match your filters'}
                </p>
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
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase">
                        Hire Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {filteredParticipants.map((enrollment: any) => (
                      <tr key={enrollment.participantId} className="hover:bg-secondary-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-secondary-900">
                            {enrollment.participant.firstName} {enrollment.participant.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-700">
                          {enrollment.participant.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-700">
                          {enrollment.participant.department || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-700">
                          {enrollment.participant.jobTitle || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-700">
                          {enrollment.participant.hireDate
                            ? new Date(enrollment.participant.hireDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : '-'}
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

      {/* Session Edit Drawer */}
      <SessionEditDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        schedule={selectedSchedule}
        programId={program?.id || ''}
        cohortId={cohortId || ''}
      />
    </div>
  );
};
