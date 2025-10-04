import { createContext, useContext, useState, ReactNode } from 'react';

// Types for our program data
export interface Session {
  id: string;
  title: string;
  duration: number;
  description?: string;
  facilitatorRequirements?: string[];
  participantFilters?: any;
  locationFilters?: any;
}

export interface TrainingBlock {
  id: string;
  name: string;
  sessions: Session[];
  weeks: number; // calculated or set
}

export interface ScheduledSession extends Session {
  day: string;
  startTime: string;
  weekIndex: number;
  blockId: string;
}

export interface ProgramData {
  // Step 1 data
  name: string;
  description: string;
  duration: number;
  
  // Step 2 data
  sessions: Session[];
  
  // Step 3 data
  trainingBlocks: TrainingBlock[];
  
  // Step 4 data
  scheduledSessions: ScheduledSession[];
  
  // Future steps...
  cohorts?: any[];
}

interface ProgramContextType {
  programData: ProgramData;
  updateProgramData: (updates: Partial<ProgramData>) => void;
  resetProgram: () => void;
}

const initialProgramData: ProgramData = {
  name: '',
  description: '',
  duration: 0,
  sessions: [],
  trainingBlocks: [],
  scheduledSessions: [],
};

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [programData, setProgramData] = useState<ProgramData>(initialProgramData);

  const updateProgramData = (updates: Partial<ProgramData>) => {
    setProgramData(prev => ({ ...prev, ...updates }));
  };

  const resetProgram = () => {
    setProgramData(initialProgramData);
  };

  return (
    <ProgramContext.Provider value={{ programData, updateProgramData, resetProgram }}>
      {children}
    </ProgramContext.Provider>
  );
}

// Custom hook for easy access
export function useProgramContext() {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error('useProgramContext must be used within ProgramProvider');
  }
  return context;
}