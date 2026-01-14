import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

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

interface FormData {
  useBlocks: boolean;
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
  scheduledSessions: ScheduledSession[];
}

interface Step4Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const SESSION_COLORS = [
  { bg: '#2C5F8D', hover: '#234A6E', text: '#FFFFFF' },  // Dark blue - WCAG AA
  { bg: '#008B8B', hover: '#006B6B', text: '#FFFFFF' },  // Dark cyan - WCAG AA
  { bg: '#0D2539', hover: '#091a28', text: '#FFFFFF' },  // Very dark blue - WCAG AAA
  { bg: '#D97706', hover: '#B45F06', text: '#FFFFFF' },  // Dark orange - WCAG AA
  { bg: '#CA8A04', hover: '#A16A03', text: '#000000' },  // Dark yellow - WCAG AA with black text
  { bg: '#65A30D', hover: '#4D7C0F', text: '#FFFFFF' }   // Dark green - WCAG AA
];

// Helper function to convert 24h time to 12h AM/PM format
const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
};

// Helper function to get color for a session
const getSessionColor = (sessionId: string) => {
  const hash = sessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SESSION_COLORS[hash % SESSION_COLORS.length];
};

export function Step4SessionCadence({ formData, updateFormData, onNext, onBack }: Step4Props) {
  // For non-block mode, use a dummy blockId
  const SIMPLE_BLOCK_ID = 'simple-program';

  const [activeBlockId, setActiveBlockId] = useState(
    formData.useBlocks ? (formData.blocks[0]?.id || '') : SIMPLE_BLOCK_ID
  );
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);

  // Get training blocks or create a virtual block for simple mode
  const trainingBlocks = formData.useBlocks
    ? formData.blocks
    : [{ id: SIMPLE_BLOCK_ID, name: 'Program', numberOfSessions: formData.sessions.length, duration: formData.programDuration }];

  const activeBlock = trainingBlocks.find(b => b.id === activeBlockId)!;

  // Get sessions for this block (or all sessions in simple mode)
  const blockSessions = formData.useBlocks
    ? formData.sessions.filter(s => s.blockId === activeBlockId)
    : formData.sessions;

  // Calculate weeks based on block duration (in weeks)
  const totalWeeks = activeBlock?.duration || formData.programDuration || 1;

  const handleSlotClick = (day: string, time: string) => {
    setSelectedSlot({ day, time });
    setShowAddModal(true);
  };

  const handleAddSession = (sessionId: string, startWeek: number, startDay: string, startTime: string, endWeek: number, endDay: string, endTime: string) => {
    const newScheduledSession: ScheduledSession = {
      sessionId,
      startWeek,
      startDay,
      startTime,
      endWeek,
      endDay,
      endTime,
      blockId: activeBlockId
    };

    updateFormData({
      scheduledSessions: [...formData.scheduledSessions, newScheduledSession]
    });

    setShowAddModal(false);
    setSelectedSlot(null);
  };

  const handleRemoveSession = (sessionToRemove: ScheduledSession) => {
    updateFormData({
      scheduledSessions: formData.scheduledSessions.filter(
        s => !(s.sessionId === sessionToRemove.sessionId &&
               s.startWeek === sessionToRemove.startWeek &&
               s.startDay === sessionToRemove.startDay &&
               s.startTime === sessionToRemove.startTime &&
               s.blockId === sessionToRemove.blockId)
      )
    });
  };

  const getSessionsForSlot = (day: string, time: string) => {
    const dayIndex = DAYS.indexOf(day);
    const timeIndex = TIME_SLOTS.indexOf(time);

    // Get sessions that start in this slot
    const sessionsStartingHere = formData.scheduledSessions.filter(
      s => s.startDay === day &&
           s.startTime === time &&
           s.startWeek === currentWeekIndex &&
           s.blockId === activeBlockId
    );

    // For Monday at the first time slot, also check for sessions continuing from previous week
    if (dayIndex === 0 && timeIndex === 0) {
      const continuingSessions = formData.scheduledSessions.filter(
        s => s.blockId === activeBlockId &&
             s.startWeek < currentWeekIndex &&
             s.endWeek === currentWeekIndex
      );
      return [...sessionsStartingHere, ...continuingSessions];
    }

    return sessionsStartingHere;
  };

  const isPartOfMultiDaySession = (day: string, time: string) => {
    const dayIndex = DAYS.indexOf(day);
    const timeIndex = TIME_SLOTS.indexOf(time);
    if (dayIndex === -1 || timeIndex === -1) return null;

    // Check if this slot is part of a multi-day session (but not the starting slot)
    return formData.scheduledSessions.find(session => {
      if (session.blockId !== activeBlockId) return false;
      if (session.startWeek !== currentWeekIndex || session.endWeek !== currentWeekIndex) return false;

      const sessionStartDayIndex = DAYS.indexOf(session.startDay);
      const sessionEndDayIndex = DAYS.indexOf(session.endDay);

      // Only multi-day sessions
      if (sessionStartDayIndex === sessionEndDayIndex) return false;

      // Check if current slot is between start and end (but not the start itself)
      const sessionStartTimeIndex = TIME_SLOTS.indexOf(session.startTime);

      // If we're on a day after the start day and before/on the end day
      if (dayIndex > sessionStartDayIndex && dayIndex <= sessionEndDayIndex) {
        // If we're on the end day, only show if before end time
        if (dayIndex === sessionEndDayIndex) {
          const sessionEndTimeIndex = TIME_SLOTS.indexOf(session.endTime);
          return timeIndex < sessionEndTimeIndex;
        }
        return true; // We're on a middle day, show it
      }

      return false;
    });
  };

  const getScheduledCount = () => {
    const uniqueSessionIds = new Set(
      formData.scheduledSessions
        .filter(s => s.blockId === activeBlockId)
        .map(s => s.sessionId)
    );
    return uniqueSessionIds.size;
  };

  const allScheduled = getScheduledCount() === blockSessions.length && blockSessions.length > 0;

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Session Cadence</h1>
        <p className="text-gray-600 mt-1">
          Set scheduling and timing preferences for your training sessions.
        </p>
      </div>

      {/* Training Block Tabs - Only show if using blocks */}
      {formData.useBlocks && trainingBlocks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Training Block:</span>
            <div className="flex gap-2">
              {trainingBlocks.map(block => (
                <button
                  key={block.id}
                  onClick={() => {
                    setActiveBlockId(block.id);
                    setCurrentWeekIndex(0);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeBlockId === block.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {block.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Week Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.useBlocks
                ? `Week ${currentWeekIndex + 1} of ${activeBlock.name}`
                : `Week ${currentWeekIndex + 1}`
              }
            </h2>
            {allScheduled && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                <span>All sessions scheduled</span>
              </div>
            )}
            {!allScheduled && blockSessions.length > 0 && (
              <div className="text-sm text-gray-600">
                {getScheduledCount()} of {blockSessions.length} sessions scheduled
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
              disabled={currentWeekIndex === 0}
              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              {currentWeekIndex + 1} of {totalWeeks}
            </span>
            <button
              onClick={() => setCurrentWeekIndex(Math.min(totalWeeks - 1, currentWeekIndex + 1))}
              disabled={currentWeekIndex >= totalWeeks - 1}
              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-Week Spanning Sessions */}
        {formData.scheduledSessions.filter(
          s => s.blockId === activeBlockId &&
               ((s.startWeek < currentWeekIndex && s.endWeek >= currentWeekIndex) ||
                (s.startWeek <= currentWeekIndex && s.endWeek > currentWeekIndex))
        ).length > 0 && (
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-sm font-medium text-purple-900 mb-3">Multi-Week Sessions</h3>
            <div className="space-y-2">
              {formData.scheduledSessions
                .filter(s => s.blockId === activeBlockId &&
                             ((s.startWeek < currentWeekIndex && s.endWeek >= currentWeekIndex) ||
                              (s.startWeek <= currentWeekIndex && s.endWeek > currentWeekIndex)))
                .map((scheduledSession, idx) => {
                  const session = formData.sessions.find(s => s.id === scheduledSession.sessionId);
                  const isStartingThisWeek = scheduledSession.startWeek === currentWeekIndex;
                  const isEndingThisWeek = scheduledSession.endWeek === currentWeekIndex;
                  const isContinuing = scheduledSession.startWeek < currentWeekIndex && scheduledSession.endWeek > currentWeekIndex;

                  let statusLabel = '';
                  if (isContinuing) {
                    statusLabel = 'Continuing from previous week';
                  } else if (isStartingThisWeek) {
                    statusLabel = `Continues to Week ${scheduledSession.endWeek + 1}`;
                  } else if (isEndingThisWeek) {
                    statusLabel = `Started Week ${scheduledSession.startWeek + 1}`;
                  }

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white rounded border border-purple-300 group relative"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{session?.name}</div>
                        <div className="text-sm text-gray-600">
                          Week {scheduledSession.startWeek + 1} {scheduledSession.startDay} {formatTime12Hour(scheduledSession.startTime)} →
                          Week {scheduledSession.endWeek + 1} {scheduledSession.endDay} {formatTime12Hour(scheduledSession.endTime)}
                        </div>
                        <div className="text-xs text-purple-700 mt-1">{statusLabel}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSession(scheduledSession);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
            <div className="p-3 text-xs font-medium text-gray-500">Time</div>
            {DAYS.map(day => (
              <div key={day} className="p-3 text-xs font-medium text-gray-700 border-l border-gray-200">
                {day}
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {TIME_SLOTS.map((time, idx) => (
            <div key={time} className={`grid grid-cols-6 ${idx < TIME_SLOTS.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="p-3 text-sm text-gray-600 bg-gray-50">
                {formatTime12Hour(time)} - {formatTime12Hour(TIME_SLOTS[idx + 1] || '16:00')}
              </div>
              {DAYS.map(day => {
                const sessionsInSlot = getSessionsForSlot(day, time);
                const multiDaySession = isPartOfMultiDaySession(day, time);
                const timeIndex = TIME_SLOTS.indexOf(time);

                return (
                  <div
                    key={day}
                    onClick={() => handleSlotClick(day, time)}
                    className="p-2 border-l border-gray-200 min-h-[80px] relative hover:bg-gray-50 cursor-pointer"
                  >
                    {/* Show continuation block for multi-day sessions - only at first time slot */}
                    {multiDaySession && timeIndex === 0 && (() => {
                      const dayIndex = DAYS.indexOf(day);
                      const sessionEndDayIndex = DAYS.indexOf(multiDaySession.endDay);
                      const sessionEndTimeIndex = TIME_SLOTS.indexOf(multiDaySession.endTime);

                      // If this is the end day, calculate height to end time
                      let blockHeight = TIME_SLOTS.length * 80 - 16;
                      if (dayIndex === sessionEndDayIndex && sessionEndTimeIndex !== -1) {
                        // Height should be from top to the end time slot
                        blockHeight = (sessionEndTimeIndex + 1) * 80 - 16;
                      }

                      const sessionColor = getSessionColor(multiDaySession.sessionId);

                      return (
                        <div
                          className="absolute inset-2 rounded flex flex-col items-center justify-center text-xs group"
                          style={{
                            height: `${blockHeight}px`,
                            backgroundColor: sessionColor.bg,
                            color: sessionColor.text,
                            zIndex: 10,
                            pointerEvents: 'none'
                          }}
                        >
                          <div className="font-medium">↔</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSession(multiDaySession);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ pointerEvents: 'auto' }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })()}
                    {sessionsInSlot.map((scheduledSession, sessionIdx) => {
                      const session = formData.sessions.find(s => s.id === scheduledSession.sessionId);

                      const isContinuingFromPrevious = scheduledSession.startWeek < currentWeekIndex;
                      const isContinuingToNext = scheduledSession.endWeek > currentWeekIndex;

                      // Calculate duration in time slots
                      let durationSlots = 1;
                      let durationLabel = '';
                      let displayStartTime = scheduledSession.startTime;
                      let displayEndTime = scheduledSession.endTime;

                      // Session continuing from previous week - show from start of week
                      if (isContinuingFromPrevious && scheduledSession.endWeek === currentWeekIndex) {
                        // Ends this week
                        durationLabel = `Ends ${scheduledSession.endDay} ${scheduledSession.endTime}`;
                        durationSlots = TIME_SLOTS.length; // Full height
                        displayStartTime = '(Cont.)';
                      }
                      // Session continuing to next week - show to end of week
                      else if (scheduledSession.startWeek === currentWeekIndex && isContinuingToNext) {
                        durationLabel = `Continues to Week ${scheduledSession.endWeek + 1}`;
                        durationSlots = TIME_SLOTS.length; // Full height
                        displayEndTime = '(Cont.)';
                      }
                      // Session fully within current week
                      else if (scheduledSession.startWeek === scheduledSession.endWeek) {
                        // Same day
                        if (scheduledSession.startDay === scheduledSession.endDay) {
                          // Calculate hour difference
                          const [startHour, startMin] = scheduledSession.startTime.split(':').map(Number);
                          const [endHour, endMin] = scheduledSession.endTime.split(':').map(Number);
                          const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                          const hours = Math.floor(totalMinutes / 60);
                          const minutes = totalMinutes % 60;
                          durationLabel = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
                          durationSlots = Math.max(1, Math.ceil(totalMinutes / 60)); // At least 1 slot
                        }
                        // Different days same week
                        else {
                          const startDayIndex = DAYS.indexOf(scheduledSession.startDay);
                          const endDayIndex = DAYS.indexOf(scheduledSession.endDay);
                          const daySpan = endDayIndex - startDayIndex;
                          durationLabel = `${daySpan + 1} day${daySpan > 0 ? 's' : ''}`;
                          durationSlots = TIME_SLOTS.length;
                        }
                      }

                      const heightPx = durationSlots * 80;
                      const sessionColor = getSessionColor(scheduledSession.sessionId);

                      // Calculate left position and width for side-by-side display
                      const totalSessions = sessionsInSlot.length;
                      const widthPercent = 100 / totalSessions;
                      const leftPercent = (sessionIdx * widthPercent);

                      // Calculate span for multi-day sessions
                      const startDayIndex = DAYS.indexOf(scheduledSession.startDay);
                      const endDayIndex = DAYS.indexOf(scheduledSession.endDay);
                      const isMultiDay = startDayIndex !== endDayIndex && scheduledSession.startWeek === scheduledSession.endWeek;

                      // Calculate width to span multiple day columns
                      const daySpan = isMultiDay ? (endDayIndex - startDayIndex + 1) : 1;
                      const spanWidth = daySpan * 100; // span across multiple cells

                      return (
                        <div
                          key={sessionIdx}
                          className="rounded p-2 mb-2 group absolute top-2 transition-all border border-white/20"
                          style={{
                            backgroundColor: sessionColor.bg,
                            color: sessionColor.text,
                            height: `${heightPx - 16}px`,
                            left: `${leftPercent}%`,
                            width: isMultiDay
                              ? `calc(${spanWidth}% + ${(daySpan - 1) * 2}px)` // Span across day columns, accounting for borders
                              : `calc(${widthPercent}% - 8px)`,
                            marginLeft: '4px',
                            opacity: '0.75',
                            zIndex: 10,
                            pointerEvents: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = sessionColor.hover;
                            e.currentTarget.style.opacity = '0.85';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = sessionColor.bg;
                            e.currentTarget.style.opacity = '0.75';
                          }}
                        >
                          <div className="text-sm font-medium truncate">{session?.name}</div>
                          <div className="text-xs opacity-90 mt-1">
                            {displayStartTime === '(Cont.)' ? displayStartTime : formatTime12Hour(displayStartTime)} - {displayEndTime === '(Cont.)' ? displayEndTime : formatTime12Hour(displayEndTime)}
                          </div>
                          <div className="text-xs opacity-90">
                            {durationLabel}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSession(scheduledSession);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ pointerEvents: 'auto' }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <AddSessionModal
          sessions={blockSessions}
          selectedSlot={selectedSlot}
          totalWeeks={totalWeeks}
          currentWeek={currentWeekIndex}
          scheduledSessionIds={new Set(formData.scheduledSessions.filter(s => s.blockId === activeBlockId).map(s => s.sessionId))}
          onAdd={handleAddSession}
          onCancel={() => {
            setShowAddModal(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}

interface AddSessionModalProps {
  sessions: Array<{ id: string; name: string }>;
  selectedSlot: { day: string; time: string } | null;
  totalWeeks: number;
  currentWeek: number;
  scheduledSessionIds: Set<string>;
  onAdd: (sessionId: string, startWeek: number, startDay: string, startTime: string, endWeek: number, endDay: string, endTime: string) => void;
  onCancel: () => void;
}

function AddSessionModal({ sessions, selectedSlot, totalWeeks, currentWeek, scheduledSessionIds, onAdd, onCancel }: AddSessionModalProps) {
  // Ensure time is in HH:MM format
  const formatTime = (time: string | undefined) => {
    if (!time) return '08:00';
    // If already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    // Otherwise default
    return '08:00';
  };

  const initialStartTime = formatTime(selectedSlot?.time);

  // Find first unscheduled session as default
  const firstUnscheduledSession = sessions.find(s => !scheduledSessionIds.has(s.id));
  const [selectedSessionId, setSelectedSessionId] = useState(firstUnscheduledSession?.id || sessions[0]?.id || '');
  const [startWeek, setStartWeek] = useState(currentWeek);
  const [startDay, setStartDay] = useState(selectedSlot?.day || 'Mon');
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endWeek, setEndWeek] = useState(currentWeek);
  const [endDay, setEndDay] = useState(selectedSlot?.day || 'Mon');

  // Calculate default end time (1 hour after start)
  const calculateEndTime = (start: string) => {
    const [hours, minutes] = start.split(':').map(Number);
    const endHours = (hours + 1) % 24;
    return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const [endTime, setEndTime] = useState(calculateEndTime(initialStartTime));

  if (sessions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4">No Sessions Available</h3>
          <p className="text-gray-600 mb-6">
            There are no sessions defined for this training block. Please go back and add sessions first.
          </p>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    onAdd(selectedSessionId, startWeek, startDay, startTime, endWeek, endDay, endTime);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Schedule Session</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {sessions.map(session => {
              const isScheduled = scheduledSessionIds.has(session.id);
              return (
                <option
                  key={session.id}
                  value={session.id}
                  disabled={isScheduled}
                  className={isScheduled ? 'text-gray-400' : ''}
                >
                  {session.name}{isScheduled ? ' (Already Scheduled)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Start Time */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Start Time</h4>
          <div className="grid grid-cols-3 gap-3">
            {totalWeeks > 1 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Week</label>
                <select
                  value={startWeek}
                  onChange={(e) => setStartWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  {Array.from({ length: totalWeeks }, (_, i) => (
                    <option key={i} value={i}>Week {i + 1}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Day</label>
              <select
                value={startDay}
                onChange={(e) => setStartDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              >
                {Array.from({ length: 40 }, (_, i) => {
                  const hour = Math.floor(i / 4) + 8;
                  const minute = (i % 4) * 15;
                  if (hour > 17) return null;
                  const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                  return <option key={time24} value={time24}>{formatTime12Hour(time24)}</option>;
                }).filter(Boolean)}
              </select>
            </div>
          </div>
        </div>

        {/* End Time */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">End Time</h4>
          <div className="grid grid-cols-3 gap-3">
            {totalWeeks > 1 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Week</label>
                <select
                  value={endWeek}
                  onChange={(e) => setEndWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  {Array.from({ length: totalWeeks }, (_, i) => (
                    <option key={i} value={i}>Week {i + 1}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Day</label>
              <select
                value={endDay}
                onChange={(e) => setEndDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              >
                {Array.from({ length: 40 }, (_, i) => {
                  const hour = Math.floor(i / 4) + 8;
                  const minute = (i % 4) * 15;
                  if (hour > 17) return null;
                  const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                  return <option key={time24} value={time24}>{formatTime12Hour(time24)}</option>;
                }).filter(Boolean)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Add Session
          </button>
        </div>
      </div>
    </div>
  );
}