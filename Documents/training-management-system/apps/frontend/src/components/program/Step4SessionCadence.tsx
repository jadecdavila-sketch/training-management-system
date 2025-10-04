import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ScheduledSession {
  sessionId: string;
  day: string;
  startTime: string;
  weekIndex: number;
  blockId: string;
  duration: number;
}

interface FormData {
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
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

export function Step4SessionCadence({ formData, updateFormData, onNext, onBack }: Step4Props) {
  const [activeBlockId, setActiveBlockId] = useState(formData.blocks[0]?.id || '');
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);

  // Get training blocks
  const trainingBlocks = formData.blocks || [];
  
  if (trainingBlocks.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Training Blocks Found</h3>
          <p className="text-gray-600 mb-6">
            Please complete the previous steps to define your training blocks and sessions.
          </p>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Go Back to Previous Step
          </button>
        </div>
      </div>
    );
  }

  const activeBlock = trainingBlocks.find(b => b.id === activeBlockId)!;
  
  // Get sessions for this block
  const blockSessions = formData.sessions.filter(s => s.blockId === activeBlockId);
  
  // Calculate weeks based on block duration (in weeks)
  const totalWeeks = activeBlock.duration || 1;

  const handleSlotClick = (day: string, time: string) => {
    setSelectedSlot({ day, time });
    setShowAddModal(true);
  };

  const handleAddSession = (sessionId: string, duration: number) => {
    if (!selectedSlot) return;

    const newScheduledSession: ScheduledSession = {
      sessionId,
      day: selectedSlot.day,
      startTime: selectedSlot.time,
      weekIndex: currentWeekIndex,
      blockId: activeBlockId,
      duration
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
               s.day === sessionToRemove.day && 
               s.startTime === sessionToRemove.startTime &&
               s.weekIndex === sessionToRemove.weekIndex &&
               s.blockId === sessionToRemove.blockId)
      )
    });
  };

  const getSessionsForSlot = (day: string, time: string) => {
    return formData.scheduledSessions.filter(
      s => s.day === day && 
           s.startTime === time && 
           s.weekIndex === currentWeekIndex &&
           s.blockId === activeBlockId
    );
  };

  const getScheduledCount = () => {
    const uniqueSessionIds = new Set(
      formData.scheduledSessions
        .filter(s => s.blockId === activeBlockId && s.weekIndex === currentWeekIndex)
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

      {/* Training Block Tabs */}
      {trainingBlocks.length > 0 && (
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
              Week {currentWeekIndex + 1} of {activeBlock.name}
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
                {time} - {TIME_SLOTS[idx + 1] || '16:00'}
              </div>
              {DAYS.map(day => {
                const sessionsInSlot = getSessionsForSlot(day, time);
                return (
                  <div
                    key={day}
                    onClick={() => handleSlotClick(day, time)}
                    className="p-2 border-l border-gray-200 hover:bg-gray-50 cursor-pointer min-h-[80px] relative"
                  >
                    {sessionsInSlot.map((scheduledSession, idx) => {
                      const session = formData.sessions.find(s => s.id === scheduledSession.sessionId);
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSession(scheduledSession);
                          }}
                          className="bg-teal-500 text-white rounded p-2 mb-2 hover:bg-teal-600 cursor-pointer group"
                          style={{ minHeight: `${scheduledSession.duration * 30}px` }}
                          title="Click to remove"
                        >
                          <div className="text-sm font-medium">{session?.name}</div>
                          <div className="text-xs opacity-90 mt-1">
                            {scheduledSession.startTime} • {scheduledSession.duration}h
                          </div>
                          <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to remove
                          </div>
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
  onAdd: (sessionId: string, duration: number) => void;
  onCancel: () => void;
}

function AddSessionModal({ sessions, selectedSlot, onAdd, onCancel }: AddSessionModalProps) {
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id || '');
  const [duration, setDuration] = useState(2);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Add Session</h3>
        <p className="text-sm text-gray-600 mb-6">
          {selectedSlot?.day} at {selectedSlot?.time}
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
            <option value={4}>4 hours</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(selectedSessionId, duration)}
            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Add Session
          </button>
        </div>
      </div>
    </div>
  );
}