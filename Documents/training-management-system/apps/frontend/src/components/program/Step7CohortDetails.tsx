import { useState } from 'react';
import { Users, Calendar, Filter } from 'lucide-react';

interface CohortDetail {
  id: string;
  name: string;
  startDate: string;
  participantFilters: {
    employeeStartDateFrom?: string;
    employeeStartDateTo?: string;
    regions?: string[];
    departments?: string[];
  };
}

interface FormData {
  numberOfCohorts: number;
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
}

interface Step7Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step7CohortDetails({ formData, updateFormData, onNext, onBack }: Step7Props) {
  // Mock data from database
  const availableRegions = ['North America', 'EMEA', 'APAC', 'LATAM'];
  const availableDepartments = ['Sales', 'Engineering', 'Marketing', 'Operations', 'HR', 'Finance'];

  const [expandedCohorts, setExpandedCohorts] = useState<Set<string>>(
    new Set(formData.cohortDetails.length > 0 ? [formData.cohortDetails[0].id] : [])
  );

  // Initialize cohort details if not already present
  const initializeCohorts = () => {
    if (formData.cohortDetails.length !== formData.numberOfCohorts) {
      const newCohorts: CohortDetail[] = [];
      for (let i = 0; i < formData.numberOfCohorts; i++) {
        const existing = formData.cohortDetails[i];
        if (existing) {
          newCohorts.push(existing);
        } else {
          newCohorts.push({
            id: `cohort-${i + 1}`,
            name: `Cohort ${i + 1}`,
            startDate: '',
            participantFilters: {}
          });
        }
      }
      updateFormData({ cohortDetails: newCohorts });
      if (newCohorts.length > 0) {
        setExpandedCohorts(new Set([newCohorts[0].id]));
      }
    }
  };

  // Initialize on mount
  useState(() => {
    initializeCohorts();
  });

  const toggleCohort = (cohortId: string) => {
    const newExpanded = new Set(expandedCohorts);
    if (newExpanded.has(cohortId)) {
      newExpanded.delete(cohortId);
    } else {
      newExpanded.add(cohortId);
    }
    setExpandedCohorts(newExpanded);
  };

  const updateCohort = (cohortId: string, updates: Partial<CohortDetail>) => {
    const updatedCohorts = formData.cohortDetails.map(cohort =>
      cohort.id === cohortId ? { ...cohort, ...updates } : cohort
    );
    updateFormData({ cohortDetails: updatedCohorts });
  };

  const updateCohortFilter = (cohortId: string, filterKey: string, value: any) => {
    const cohort = formData.cohortDetails.find(c => c.id === cohortId);
    if (cohort) {
      updateCohort(cohortId, {
        participantFilters: {
          ...cohort.participantFilters,
          [filterKey]: value
        }
      });
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Cohort Details</h1>
        <p className="text-gray-600 mt-1">
          Configure details for each cohort including start dates and participant criteria.
        </p>
      </div>

      <div className="space-y-4">
        {formData.cohortDetails.map((cohort, index) => {
          const isExpanded = expandedCohorts.has(cohort.id);

          return (
            <div
              key={cohort.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Cohort Header */}
              <div
                onClick={() => toggleCohort(cohort.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{cohort.name}</h3>
                    {cohort.startDate && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        Starts: {new Date(cohort.startDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cohort.startDate && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Configured
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Cohort Details */}
              {isExpanded && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Cohort Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cohort Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cohort.name}
                        onChange={(e) => updateCohort(cohort.id, { name: e.target.value })}
                        placeholder="e.g., East Coast Leadership"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={cohort.startDate}
                          onChange={(e) => updateCohort(cohort.id, { startDate: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Participant Filters */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Filter className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-semibold text-gray-900">Participant Filters (Optional)</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Define criteria to automatically assign participants to this cohort based on employee data.
                    </p>

                    <div className="space-y-4">
                      {/* Employee Start Date Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee Start Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">From</label>
                            <input
                              type="date"
                              value={cohort.participantFilters.employeeStartDateFrom || ''}
                              onChange={(e) => updateCohortFilter(cohort.id, 'employeeStartDateFrom', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">To</label>
                            <input
                              type="date"
                              value={cohort.participantFilters.employeeStartDateTo || ''}
                              onChange={(e) => updateCohortFilter(cohort.id, 'employeeStartDateTo', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Include employees who started between these dates</p>
                      </div>

                      {/* Regions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Regions
                        </label>
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value && !(cohort.participantFilters.regions?.includes(e.target.value))) {
                              const currentRegions = cohort.participantFilters.regions || [];
                              updateCohortFilter(cohort.id, 'regions', [...currentRegions, e.target.value]);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm mb-2"
                        >
                          <option value="">Select regions</option>
                          {availableRegions.filter(r => !(cohort.participantFilters.regions?.includes(r))).map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                        {cohort.participantFilters.regions && cohort.participantFilters.regions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {cohort.participantFilters.regions.map(region => (
                              <span
                                key={region}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                              >
                                {region}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedRegions = cohort.participantFilters.regions?.filter(r => r !== region) || [];
                                    updateCohortFilter(cohort.id, 'regions', updatedRegions);
                                  }}
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

                      {/* Departments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departments
                        </label>
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value && !(cohort.participantFilters.departments?.includes(e.target.value))) {
                              const currentDepts = cohort.participantFilters.departments || [];
                              updateCohortFilter(cohort.id, 'departments', [...currentDepts, e.target.value]);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm mb-2"
                        >
                          <option value="">Select departments</option>
                          {availableDepartments.filter(d => !(cohort.participantFilters.departments?.includes(d))).map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        {cohort.participantFilters.departments && cohort.participantFilters.departments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {cohort.participantFilters.departments.map(dept => (
                              <span
                                key={dept}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                              >
                                {dept}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedDepts = cohort.participantFilters.departments?.filter(d => d !== dept) || [];
                                    updateCohortFilter(cohort.id, 'departments', updatedDepts);
                                  }}
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
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
