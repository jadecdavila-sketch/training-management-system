import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { programsApi } from '@/services/api';
import { Step1ProgramDetails } from '@/components/program/Step1ProgramDetails';
import { Step2TrainingSessions } from '@/components/program/Step2TrainingSessions';
import { Step3SessionDetails } from '@/components/program/Step3SessionDetails';
import { Step4SessionCadence } from '@/components/program/Step4SessionCadence';
import { Step5ProgramStructure } from '@/components/program/Step5ProgramStructure';
import { Step6CohortsBlackout } from '@/components/program/Step6CohortsBlackout';
import { Step7CohortDetails } from '@/components/program/Step7CohortDetails';
import { Step8Facilitators } from '@/components/program/Step8Facilitators';
import { Step9Locations } from '@/components/program/Step9Locations';
import { Step10ProgramSummary } from '@/components/program/Step10ProgramSummary';

interface ProgramFormData {
  programName: string;
  region: string;
  description: string;
  sharedEmail: string;
  useBlocks: boolean;
  numberOfSessions: number;
  programDuration: number;
  blocks: Array<{
    id: string;
    name: string;
    numberOfSessions: number;
    duration: number;
  }>;
  blockDelays: Record<string, number>;
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
    endWeek: number;
    endDay: string;
    endTime: string;
    blockId: string;
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
    participantFilters: {
      employeeStartDateFrom?: string;
      employeeStartDateTo?: string;
      regions?: string[];
      departments?: string[];
    };
  }>;
  facilitatorAssignments?: Array<{
    cohortId: string;
    sessionId: string;
    facilitatorName: string;
    facilitatorEmail: string;
    skills: string[];
  }>;
  locationAssignments?: Array<{
    cohortId: string;
    sessionId: string;
    locationName: string;
    locationType: string;
    capacity: number;
    building?: string;
    floor?: string;
  }>;
}

const TOTAL_STEPS = 10;

export const ProgramCreationWizard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProgramFormData>({
    programName: '',
    region: '',
    description: '',
    sharedEmail: '',
    useBlocks: false,
    numberOfSessions: 1,
    programDuration: 1,
    blocks: [],
    blockDelays: {},
    sessions: [],
    scheduledSessions: [],
    numberOfCohorts: 2,
    blackoutPeriods: [],
    cohortDetails: [],
  });

  // Fetch program data if in edit mode
  const { data: programData, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: () => programsApi.getById(id!),
    enabled: isEditMode,
  });

  // Populate form data when program data is loaded
  useEffect(() => {
    if (programData?.data) {
      const program = programData.data;
      // If we have the original formData stored, use it directly
      if (program.formData) {
        setFormData(program.formData as ProgramFormData);
      } else {
        // Fallback: only populate basic fields if formData wasn't stored
        setFormData(prev => ({
          ...prev,
          programName: program.name || '',
          region: program.region || '',
          description: program.description || '',
        }));
      }
    }
  }, [programData]);

  if (isEditMode && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading program...</p>
        </div>
      </div>
    );
  }

  const updateFormData = (updates: Partial<ProgramFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.programName && formData.region);
      case 2:
        if (formData.useBlocks) {
          return formData.blocks.length > 0 && formData.blocks.every(b => b.numberOfSessions > 0 && b.duration > 0);
        }
        return formData.numberOfSessions > 0 && formData.programDuration > 0;
      case 3:
        return formData.sessions.every(s => s.name && s.groupSizeMin > 0 && s.groupSizeMax >= s.groupSizeMin);
      case 4:
        return true;
      case 5:
        return true; // Review step, always valid
      case 6:
        return formData.numberOfCohorts > 0;
      case 7:
        return true;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (currentStep < TOTAL_STEPS && validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canNavigateToStep = (stepNumber: number): boolean => {
    // Can always go to current step
    if (stepNumber === currentStep) return true;

    // Can always go back to previous steps
    if (stepNumber < currentStep) return true;

    // Can go to next step if current step is valid
    if (stepNumber === currentStep + 1 && validateCurrentStep()) return true;

    // Cannot jump ahead more than one step
    return false;
  };

  const handleStepClick = (stepNumber: number) => {
    if (canNavigateToStep(stepNumber)) {
      setCurrentStep(stepNumber);
    }
  };

  const handleSaveAndClose = () => {
    console.log('Saving program:', formData);
    navigate('/admin/programs');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      navigate('/admin/programs');
    }
  };

  const steps = [
    { number: 1, title: 'Program Type Details', completed: currentStep > 1 },
    { number: 2, title: 'Training Sessions', completed: currentStep > 2 },
    { number: 3, title: 'Session Details', completed: currentStep > 3 },
    { number: 4, title: 'Session Cadence', completed: currentStep > 4 },
    { number: 5, title: 'Program Structure', completed: currentStep > 5 },
    { number: 6, title: 'Cohorts', completed: currentStep > 6 },
    { number: 7, title: 'Cohort Details', completed: currentStep > 7 },
    { number: 8, title: 'Facilitators', completed: currentStep > 8 },
    { number: 9, title: 'Locations', completed: currentStep > 9 },
    { number: 10, title: 'Program Summary', completed: currentStep > 10 },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ProgramDetails 
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
          />
        );
      case 2:
        return (
          <Step2TrainingSessions 
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        return (
          <Step3SessionDetails 
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 4:
        return (
          <Step4SessionCadence
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 5:
        return (
          <Step5ProgramStructure
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 6:
        return (
          <Step6CohortsBlackout
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 7:
        return (
          <Step7CohortDetails
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 8:
        return (
          <Step8Facilitators
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 9:
        return (
          <Step9Locations
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 10:
        return (
          <Step10ProgramSummary
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      default:
        return (
          <Step1ProgramDetails
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-teal-700 text-white p-8 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold">New Program Type</h1>
          <p className="text-sm text-teal-200 mt-1">Step {currentStep} of {TOTAL_STEPS}</p>
        </div>

        <nav className="flex-1 space-y-2">
          {steps.map((step) => {
            const isClickable = canNavigateToStep(step.number);
            const isCurrent = currentStep === step.number;
            const isCompleted = step.completed;

            return (
              <div
                key={step.number}
                onClick={() => handleStepClick(step.number)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-teal-600'
                    : isCompleted
                    ? 'bg-teal-800/50'
                    : 'opacity-60'
                } ${
                  isClickable ? 'cursor-pointer hover:bg-teal-600/80' : 'cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-white text-teal-700'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            );
          })}
        </nav>

        <div className="mt-8 space-y-2">
          <button
            onClick={handleSaveAndClose}
            className="w-full px-4 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors"
          >
            Save & Close
          </button>
          <button
            onClick={handleCancel}
            className="w-full px-4 py-3 bg-transparent text-white border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        <div className="border-t border-secondary-200 px-8 py-6 flex items-center justify-between bg-white">
          <span className="text-sm text-secondary-600">
            Step {currentStep} of {TOTAL_STEPS}
          </span>

          <button
            onClick={goToNextStep}
            disabled={currentStep === TOTAL_STEPS || !validateCurrentStep()}
            className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};