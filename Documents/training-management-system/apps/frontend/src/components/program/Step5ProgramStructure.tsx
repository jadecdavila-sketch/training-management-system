import { useState } from 'react';
import { Calendar, Users, Clock, ChevronDown, ChevronRight } from 'lucide-react';

interface Block {
  id: string;
  name: string;
  numberOfSessions: number;
  duration: number;
}

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

interface FormData {
  useBlocks: boolean;
  blocks: Block[];
  blockDelays: Record<string, number>;
  sessions: Session[];
  scheduledSessions: ScheduledSession[];
  programDuration: number;
}

interface Step5Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step5ProgramStructure({ formData, updateFormData, onNext, onBack }: Step5Props) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set([formData.blocks[0]?.id]));
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0]));

  const toggleBlock = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  const toggleWeek = (weekIndex: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekIndex)) {
      newExpanded.delete(weekIndex);
    } else {
      newExpanded.add(weekIndex);
    }
    setExpandedWeeks(newExpanded);
  };

  // Calculate total duration
  const totalDuration = formData.useBlocks
    ? formData.blocks.reduce((sum, block) => sum + block.duration, 0) +
      Object.values(formData.blockDelays).reduce((sum, delay) => sum + delay, 0)
    : formData.programDuration;

  // Calculate scheduling progress
  const totalSessions = formData.sessions.length;
  const scheduledSessionIds = new Set(formData.scheduledSessions.map(s => s.sessionId));
  const scheduledCount = scheduledSessionIds.size;
  const progressPercentage = totalSessions > 0 ? (scheduledCount / totalSessions) * 100 : 0;

  // Build timeline data
  const buildTimeline = () => {
    const timeline: Array<{ type: 'block' | 'gap'; name?: string; blockId?: string; startWeek: number; duration: number }> = [];
    let currentWeek = 0;

    formData.blocks.forEach((block, index) => {
      // Add gap before this block (if not first block)
      if (index > 0) {
        const delay = formData.blockDelays[block.id] || 0;
        if (delay > 0) {
          timeline.push({
            type: 'gap',
            startWeek: currentWeek,
            duration: delay
          });
          currentWeek += delay;
        }
      }

      // Add block
      timeline.push({
        type: 'block',
        name: block.name,
        blockId: block.id,
        startWeek: currentWeek,
        duration: block.duration
      });
      currentWeek += block.duration;
    });

    return timeline;
  };

  const timeline = buildTimeline();

  // Get sessions for a specific block and week
  const getSessionsForBlockWeek = (blockId: string, weekIndex: number) => {
    const blockSessions = formData.sessions.filter(s => s.blockId === blockId);
    const scheduled = formData.scheduledSessions.filter(s =>
      s.blockId === blockId && s.startWeek === weekIndex
    );

    return scheduled.map(sch => {
      const session = blockSessions.find(s => s.id === sch.sessionId);
      return { ...sch, session };
    });
  };

  // Group sessions by week for a block
  const getWeeksForBlock = (block: Block) => {
    const weeks: Array<{ weekIndex: number; sessions: any[] }> = [];
    const blockTimeline = timeline.find(t => t.blockId === block.id);
    if (!blockTimeline) return weeks;

    for (let i = 0; i < block.duration; i++) {
      const weekIndex = blockTimeline.startWeek + i;
      const sessions = getSessionsForBlockWeek(block.id, weekIndex);
      weeks.push({ weekIndex, sessions });
    }

    return weeks;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper functions for simple mode
  const getSessionsForWeek = (weekIndex: number) => {
    const SIMPLE_BLOCK_ID = 'simple-program';
    const scheduled = formData.scheduledSessions.filter(s =>
      s.startWeek === weekIndex && s.blockId === SIMPLE_BLOCK_ID
    );

    return scheduled.map(sch => {
      const session = formData.sessions.find(s => s.id === sch.sessionId);
      return { ...sch, session };
    });
  };

  // Build timeline for simple mode showing sessions and gaps
  const buildSimpleTimeline = () => {
    const SIMPLE_BLOCK_ID = 'simple-program';
    const sessionsByWeek = new Map<number, any[]>();

    // Group sessions by week
    formData.scheduledSessions
      .filter(s => s.blockId === SIMPLE_BLOCK_ID)
      .forEach(scheduled => {
        const session = formData.sessions.find(s => s.id === scheduled.sessionId);
        if (!sessionsByWeek.has(scheduled.startWeek)) {
          sessionsByWeek.set(scheduled.startWeek, []);
        }
        sessionsByWeek.get(scheduled.startWeek)!.push({ ...scheduled, session });
      });

    // Build timeline with sessions and gaps
    const timeline: Array<{ type: 'sessions' | 'gap'; weekIndex?: number; sessions?: any[]; duration: number }> = [];
    let lastWeek = -1;

    // Sort weeks and build timeline
    const sortedWeeks = Array.from(sessionsByWeek.keys()).sort((a, b) => a - b);

    sortedWeeks.forEach((weekIndex) => {
      // Add gap if there's a space between sessions
      if (lastWeek >= 0 && weekIndex > lastWeek + 1) {
        const gapDuration = weekIndex - lastWeek - 1;
        timeline.push({ type: 'gap', duration: gapDuration });
      }

      // Add session week
      timeline.push({
        type: 'sessions',
        weekIndex,
        sessions: sessionsByWeek.get(weekIndex),
        duration: 1
      });

      lastWeek = weekIndex;
    });

    return timeline;
  };

  const simpleTimeline = !formData.useBlocks ? buildSimpleTimeline() : [];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Program Structure</h1>
        <p className="text-gray-600 mt-1">
          Review the complete timeline and structure of your training program.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Total Duration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-sm text-gray-600">Total Duration</div>
          </div>
          <div className="text-3xl font-semibold text-gray-900">
            {totalDuration} week{totalDuration !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Training Blocks or Sessions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-sm text-gray-600">
              {formData.useBlocks ? 'Training Blocks' : 'Total Sessions'}
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900">
            {formData.useBlocks ? formData.blocks.length : formData.sessions.length}
          </div>
        </div>

        {/* Scheduling Progress */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-sm text-gray-600">Scheduling Progress</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-semibold text-gray-900">
              {scheduledCount}/{totalSessions}
            </div>
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Program Timeline</h2>
          </div>

          {formData.useBlocks ? (
            <>
              {/* Week Labels */}
              <div className="flex mb-2">
                {Array.from({ length: totalDuration }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-xs text-gray-500">
                    W{i + 1}
                  </div>
                ))}
              </div>

              {/* Timeline Bars */}
              <div className="flex gap-1 mb-4">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`relative ${
                      item.type === 'block'
                        ? 'bg-teal-500 rounded'
                        : 'bg-gray-300 border-2 border-dashed border-gray-400 rounded'
                    }`}
                    style={{
                      flex: item.duration,
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.type === 'block' ? (
                      <div className="text-white text-sm font-medium px-2 text-center truncate">
                        {item.name}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-600">
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mb-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        </div>
                        <div className="text-xs">{item.duration} week{item.duration !== 1 ? 's' : ''} gap</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-500 rounded" />
                  <span className="text-gray-600">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 border-2 border-dashed border-gray-400 rounded" />
                  <span className="text-gray-600">Gap Period</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Simple Mode Timeline */}
              {simpleTimeline.length > 0 ? (
                <>
                  <div className="flex gap-1 mb-4">
                    {simpleTimeline.map((item, index) => (
                      <div
                        key={index}
                        className={`relative ${
                          item.type === 'sessions'
                            ? 'bg-teal-500 rounded flex flex-col items-center justify-center p-3'
                            : 'bg-gray-300 border-2 border-dashed border-gray-400 rounded flex items-center justify-center'
                        }`}
                        style={{
                          flex: item.duration,
                          minHeight: '80px'
                        }}
                      >
                        {item.type === 'sessions' ? (
                          <div className="text-center">
                            <div className="text-white text-sm font-medium mb-1">
                              Week {item.weekIndex! + 1}
                            </div>
                            <div className="text-white text-xs opacity-90">
                              {item.sessions!.length} session{item.sessions!.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-600">
                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mb-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            </div>
                            <div className="text-xs">{item.duration} week{item.duration !== 1 ? 's' : ''} gap</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-teal-500 rounded" />
                      <span className="text-gray-600">Sessions Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 border-2 border-dashed border-gray-400 rounded" />
                      <span className="text-gray-600">Gap Period</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sessions scheduled yet. Go back to Step 4 to schedule sessions.
                </div>
              )}
            </>
          )}
      </div>

      {/* Block Details or Session Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {formData.useBlocks ? 'Block Details' : 'Session Details'}
        </h2>

        <div className="space-y-4">
          {formData.useBlocks ? (
            // Block Mode - Show blocks with sessions
            formData.blocks.map((block) => {
              const weeks = getWeeksForBlock(block);
              const blockSessions = formData.sessions.filter(s => s.blockId === block.id);
              const blockScheduledIds = new Set(
                formData.scheduledSessions
                  .filter(s => s.blockId === block.id)
                  .map(s => s.sessionId)
              );
              const blockScheduledCount = blockScheduledIds.size;

              return (
                <div key={block.id} className="border border-gray-200 rounded-lg">
                  {/* Block Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleBlock(block.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedBlocks.has(block.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                      <div className="w-3 h-3 bg-teal-500 rounded-full" />
                      <div>
                        <div className="font-medium text-gray-900">{block.name}</div>
                        <div className="text-sm text-gray-600">
                          Week {timeline.find(t => t.blockId === block.id)?.startWeek! + 1} - {timeline.find(t => t.blockId === block.id)?.startWeek! + block.duration} • {block.duration} week{block.duration !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full">
                      {blockScheduledCount}/{blockSessions.length} sessions
                    </div>
                  </div>

                  {/* Block Content */}
                  {expandedBlocks.has(block.id) && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      {weeks.map(({ weekIndex, sessions }) => (
                        <div key={weekIndex} className="mb-4 last:mb-0">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Week {weekIndex + 1} • {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                          </div>
                          {sessions.length > 0 ? (
                            <div className="space-y-2">
                              {sessions.map((scheduled, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded p-3">
                                  <div className="font-medium text-gray-900 mb-1">
                                    {scheduled.session?.name}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>{scheduled.startDay}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{formatTime(scheduled.startTime)} - {formatTime(scheduled.endTime)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">No sessions scheduled for this week</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Simple Mode - Show all scheduled sessions in chronological order
            simpleTimeline.length > 0 ? (
              simpleTimeline
                .filter(item => item.type === 'sessions')
                .flatMap(item => item.sessions!)
                .map((scheduled, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-gray-900 text-lg">
                        {scheduled.session?.name}
                      </div>
                      <div className="px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full">
                        Week {scheduled.startWeek + 1}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{scheduled.startDay}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(scheduled.startTime)} - {formatTime(scheduled.endTime)}</span>
                      </div>
                    </div>
                    {scheduled.session?.description && (
                      <div className="mt-2 text-sm text-gray-600">
                        {scheduled.session.description}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No sessions scheduled yet.</p>
                <p className="text-sm">Go back to Step 4 to schedule your sessions.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
