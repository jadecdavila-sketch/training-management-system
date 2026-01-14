import React, { useEffect, useState } from 'react';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { participantsApi } from '@/services/api';
import { RichTextEditor } from '@/components/common/RichTextEditor';

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

interface Block {
  id: string;
  name: string;
  numberOfSessions: number;
  duration: number;
}

interface FormData {
  useBlocks: boolean;
  numberOfSessions: number;
  blocks: Block[];
  sessions: Session[];
  blockDelays: Record<string, number>;
}

interface Step3Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Facilitator skills - must match exactly with skills in database seed
const FACILITATOR_SKILLS = [
  'Change Management',
  'Communication',
  'Compliance Training',
  'Customer Service',
  'Diversity & Inclusion',
  'Leadership Development',
  'Onboarding',
  'Performance Management',
  'Process Improvement',
  'Project Management',
  'Safety Training',
  'Sales Training',
  'Team Building',
  'Technical Skills',
  'Time Management'
];
const LOCATION_TYPES = ['Conference Room', 'Auditorium', 'Training Room', 'Workshop Space', 'Meeting Room', 'Classroom', 'Virtual', 'Off-site'];

export function Step3SessionDetails({ formData, updateFormData, onNext, onBack }: Step3Props) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(() => {
    // Open the first session by default
    const firstSession = formData.sessions[0];
    return firstSession ? new Set([firstSession.id]) : new Set();
  });

  // Fetch all participants to extract unique departments and job titles
  const { data: participantsData } = useQuery({
    queryKey: ['participants'],
    queryFn: () => participantsApi.getAll({ page: 1, pageSize: 100 }),
  });

  // Extract unique departments and job titles
  const { departments, jobTitles } = React.useMemo(() => {
    if (!participantsData?.data) return { departments: [], jobTitles: [] };

    const deptSet = new Set<string>();
    const jobSet = new Set<string>();

    participantsData.data.forEach((participant: any) => {
      if (participant.department) deptSet.add(participant.department);
      if (participant.jobTitle) jobSet.add(participant.jobTitle);
    });

    return {
      departments: Array.from(deptSet).sort(),
      jobTitles: Array.from(jobSet).sort(),
    };
  }, [participantsData]);

  // Initialize sessions based on blocks or numberOfSessions
  useEffect(() => {
    const initialSessions: Session[] = [];

    if (formData.useBlocks && formData.blocks.length > 0) {
      // Auto-generate sessions for each block based on numberOfSessions
      formData.blocks.forEach(block => {
        // Keep existing sessions for this block if they exist
        const existingSessions = formData.sessions.filter(s => s.blockId === block.id);

        for (let i = 0; i < block.numberOfSessions; i++) {
          if (existingSessions[i]) {
            // Keep existing session
            initialSessions.push(existingSessions[i]);
          } else {
            // Create new session
            initialSessions.push({
              id: `session-${block.id}-${i}-${Date.now()}`,
              blockId: block.id,
              name: `Session ${i + 1}`,
              description: '',
              groupSizeMin: 1,
              groupSizeMax: 20,
              participantTypes: [],
              requiresFacilitator: true,
              facilitatorSkills: [],
              locationTypes: [],
            });
          }
        }
      });
    } else if (!formData.useBlocks && formData.numberOfSessions > 0) {
      // Keep existing sessions without blockId
      const existingSessions = formData.sessions.filter(s => !s.blockId);

      // Auto-generate sessions based on numberOfSessions
      for (let i = 0; i < formData.numberOfSessions; i++) {
        if (existingSessions[i]) {
          // Keep existing session
          initialSessions.push(existingSessions[i]);
        } else {
          // Create new session
          initialSessions.push({
            id: `session-${i}-${Date.now()}`,
            name: `Session ${i + 1}`,
            description: '',
            groupSizeMin: 1,
            groupSizeMax: 20,
            participantTypes: [],
            requiresFacilitator: true,
            facilitatorSkills: [],
            locationTypes: [],
          });
        }
      }
    }

    // Only update if sessions have changed
    if (JSON.stringify(initialSessions) !== JSON.stringify(formData.sessions)) {
      updateFormData({ sessions: initialSessions });

      // Open the first session by default when sessions change
      if (initialSessions.length > 0) {
        setExpandedSessions(new Set([initialSessions[0].id]));
      }
    }
  }, [formData.blocks, formData.useBlocks, formData.numberOfSessions]);

  // Auto-expand first session when sessions exist
  useEffect(() => {
    if (formData.sessions.length > 0 && expandedSessions.size === 0) {
      setExpandedSessions(new Set([formData.sessions[0].id]));
    }
  }, [formData.sessions]);

  const handleUpdateSession = (id: string, updates: Partial<Session>) => {
    updateFormData({
      sessions: formData.sessions.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const handleRemoveSession = (id: string) => {
    updateFormData({ sessions: formData.sessions.filter(s => s.id !== id) });
  };

  const handleAddSession = (blockId?: string) => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      blockId,
      name: '',
      description: '',
      groupSizeMin: 1,
      groupSizeMax: 20,
      participantTypes: [],
      requiresFacilitator: true,
      facilitatorSkills: [],
      locationTypes: [],
    };
    updateFormData({ sessions: [...formData.sessions, newSession] });
    // Auto-expand the new session
    setExpandedSessions(new Set([...expandedSessions, newSession.id]));
  };

  const handleUpdateBlockName = (blockId: string, newName: string) => {
    updateFormData({
      blocks: formData.blocks.map(b => b.id === blockId ? { ...b, name: newName } : b)
    });
  };

  const handleUpdateBlockDelay = (blockId: string, weeks: number) => {
    updateFormData({
      blockDelays: { ...formData.blockDelays, [blockId]: weeks }
    });
  };

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const getSessionsForBlock = (blockId: string) => {
    return formData.sessions.filter(s => s.blockId === blockId);
  };

  const getSessionsWithoutBlock = () => {
    return formData.sessions.filter(s => !s.blockId);
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Session Details</h1>
        <p className="text-gray-600 mt-1">
          Configure detailed information for each training session.
        </p>
      </div>

      {/* Add Session button for non-blocks mode */}
      {!formData.useBlocks && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => handleAddSession()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded transition-colors"
          >
            + Add Session
          </button>
        </div>
      )}

      {formData.useBlocks ? (
        <div className="space-y-6">
          {formData.blocks.map((block, blockIndex) => {
            const blockSessions = getSessionsForBlock(block.id);
            return (
              <div key={block.id} className="bg-stone-50 border border-stone-200 rounded-lg p-6">
                {/* Block Header */}
                <div className="flex items-center gap-4 mb-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-stone-700">Block Name:</div>
                    <input
                      type="text"
                      value={block.name}
                      onChange={(e) => handleUpdateBlockName(block.id, e.target.value)}
                      className="px-3 py-1 border-0 bg-white rounded text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {blockIndex > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-stone-600">Delay after previous block:</div>
                      <select
                        value={formData.blockDelays[block.id] || 0}
                        onChange={(e) => handleUpdateBlockDelay(block.id, parseInt(e.target.value))}
                        className="px-3 py-1 pr-8 border-0 bg-white rounded text-sm focus:ring-2 focus:ring-teal-500"
                      >
                        <option value={0}>No delay</option>
                        <option value={1}>1 week</option>
                        <option value={2}>2 weeks</option>
                        <option value={3}>3 weeks</option>
                        <option value={4}>4 weeks</option>
                        <option value={6}>6 weeks</option>
                        <option value={8}>8 weeks</option>
                        <option value={12}>12 weeks</option>
                        <option value={16}>16 weeks</option>
                        <option value={20}>20 weeks</option>
                        <option value={24}>24 weeks</option>
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => handleAddSession(block.id)}
                    className="px-4 py-1 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded transition-colors"
                  >
                    + Add Session
                  </button>
                </div>

                {/* Sessions */}
                <div className="space-y-3">
                  {blockSessions.map((session, sessionIndex) => (
                    <SessionAccordion
                      key={session.id}
                      session={session}
                      sessionIndex={sessionIndex}
                      isExpanded={expandedSessions.has(session.id)}
                      onToggle={() => toggleSession(session.id)}
                      onUpdate={handleUpdateSession}
                      onRemove={handleRemoveSession}
                      departments={departments}
                      jobTitles={jobTitles}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {getSessionsWithoutBlock().map((session, index) => (
            <SessionAccordion
              key={session.id}
              session={session}
              sessionIndex={index}
              isExpanded={expandedSessions.has(session.id)}
              onToggle={() => toggleSession(session.id)}
              onUpdate={handleUpdateSession}
              onRemove={handleRemoveSession}
              departments={departments}
              jobTitles={jobTitles}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SessionAccordionProps {
  session: Session;
  sessionIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<Session>) => void;
  onRemove: (id: string) => void;
  departments: string[];
  jobTitles: string[];
}

function SessionAccordion({ session, sessionIndex, isExpanded, onToggle, onUpdate, onRemove, departments, jobTitles }: SessionAccordionProps) {
  const toggleMultiSelect = (field: 'participantTypes' | 'facilitatorSkills' | 'locationTypes', value: string) => {
    const currentValues = session[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onUpdate(session.id, { [field]: newValues });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3 flex-1">
          {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
          <span className="font-medium text-gray-900">
            {session.name || `Session ${sessionIndex + 1}`}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(session.id);
          }}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 pt-0 space-y-5">
          {/* Session Name and Group Size */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Name
              </label>
              <input
                type="text"
                value={session.name}
                onChange={(e) => onUpdate(session.id, { name: e.target.value })}
                placeholder="e.g., Health Benefits Overview"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Size
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  min="1"
                  value={session.groupSizeMin}
                  onChange={(e) => onUpdate(session.id, { groupSizeMin: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  min={session.groupSizeMin}
                  value={session.groupSizeMax}
                  onChange={(e) => onUpdate(session.id, { groupSizeMax: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Email Body)
            </label>
            <RichTextEditor
              value={session.description}
              onChange={(value) => onUpdate(session.id, { description: value })}
              placeholder="Describe the session content and objectives. This will be used as the email invitation body."
              className="border border-gray-300 rounded-lg"
            />
          </div>

          {/* Requires Facilitator Toggle */}
          <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Requires Facilitator</h4>
              <p className="text-xs text-gray-600 mt-0.5">Enable if this session needs a facilitator</p>
            </div>
            <button
              onClick={() => onUpdate(session.id, { requiresFacilitator: !session.requiresFacilitator })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                session.requiresFacilitator ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  session.requiresFacilitator ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Multi-selects */}
          <div className="grid grid-cols-3 gap-6">
            {/* Participant Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participant Types
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value && !session.participantTypes.includes(e.target.value)) {
                    toggleMultiSelect('participantTypes', e.target.value);
                  }
                }}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 mb-2"
              >
                <option value="">Add participant types</option>
                {departments.length > 0 && (
                  <optgroup label="Departments">
                    {departments.filter(d => !session.participantTypes.includes(d)).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </optgroup>
                )}
                {jobTitles.length > 0 && (
                  <optgroup label="Job Titles">
                    {jobTitles.filter(j => !session.participantTypes.includes(j)).map((job) => (
                      <option key={job} value={job}>{job}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              {session.participantTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {session.participantTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => toggleMultiSelect('participantTypes', type)}
                        className="hover:text-teal-900"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Facilitator Skills - only show if requiresFacilitator is true */}
            {session.requiresFacilitator && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facilitator Skills
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !session.facilitatorSkills.includes(e.target.value)) {
                      toggleMultiSelect('facilitatorSkills', e.target.value);
                    }
                  }}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 mb-2"
                >
                  <option value="">Add facilitator skills</option>
                  {FACILITATOR_SKILLS.filter(s => !session.facilitatorSkills.includes(s)).map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                {session.facilitatorSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {session.facilitatorSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => toggleMultiSelect('facilitatorSkills', skill)}
                          className="hover:text-teal-900"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Location Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Types
              </label>
              <select
                value={session.locationTypes[0] || ''}
                onChange={(e) => onUpdate(session.id, { locationTypes: e.target.value ? [e.target.value] : [] })}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select location type</option>
                {LOCATION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
