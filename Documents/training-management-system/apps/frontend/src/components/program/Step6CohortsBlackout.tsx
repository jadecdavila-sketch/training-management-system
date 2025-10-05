import { useState } from 'react';
import { Calendar, Plus, X } from 'lucide-react';

interface BlackoutPeriod {
  id: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface FormData {
  numberOfCohorts: number;
  blackoutPeriods: BlackoutPeriod[];
}

interface Step6Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step6CohortsBlackout({ formData, updateFormData, onNext, onBack }: Step6Props) {
  const [showAddBlackout, setShowAddBlackout] = useState(false);
  const [newBlackout, setNewBlackout] = useState({
    startDate: '',
    endDate: '',
    description: ''
  });

  const handleAddBlackout = () => {
    if (newBlackout.startDate && newBlackout.endDate && newBlackout.description) {
      const blackoutPeriod: BlackoutPeriod = {
        id: `blackout-${Date.now()}`,
        startDate: newBlackout.startDate,
        endDate: newBlackout.endDate,
        description: newBlackout.description
      };

      updateFormData({
        blackoutPeriods: [...formData.blackoutPeriods, blackoutPeriod]
      });

      setNewBlackout({ startDate: '', endDate: '', description: '' });
      setShowAddBlackout(false);
    }
  };

  const handleRemoveBlackout = (id: string) => {
    updateFormData({
      blackoutPeriods: formData.blackoutPeriods.filter(bp => bp.id !== id)
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Cohorts & Blackout Dates</h1>
        <p className="text-gray-600 mt-1">
          Configure the number of cohorts and set blackout dates when training cannot occur.
        </p>
      </div>

      {/* Cohorts and Scheduling */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Cohorts and Scheduling</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Configure how many cohorts will participate in this program and set any blackout dates when training sessions cannot be scheduled.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Cohorts <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.numberOfCohorts}
            onChange={(e) => updateFormData({ numberOfCohorts: parseInt(e.target.value) })}
            className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                {num} Cohort{num !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Each cohort will go through the program independently with their own schedule.
          </p>
        </div>
      </div>

      {/* Blackout Dates */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Blackout Dates</h2>
          </div>
          <button
            onClick={() => setShowAddBlackout(true)}
            className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Blackout Period
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Blackout dates are periods when no training sessions can be scheduled for any cohort. This could include holidays, company-wide events, or maintenance periods.
        </p>

        {/* Add Blackout Form */}
        {showAddBlackout && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newBlackout.startDate}
                  onChange={(e) => setNewBlackout({ ...newBlackout, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={newBlackout.endDate}
                  onChange={(e) => setNewBlackout({ ...newBlackout, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={newBlackout.description}
                onChange={(e) => setNewBlackout({ ...newBlackout, description: e.target.value })}
                placeholder="e.g., Company holiday"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddBlackout(false);
                  setNewBlackout({ startDate: '', endDate: '', description: '' });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBlackout}
                disabled={!newBlackout.startDate || !newBlackout.endDate || !newBlackout.description}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Blackout Period
              </button>
            </div>
          </div>
        )}

        {/* Blackout Periods List */}
        {formData.blackoutPeriods.length > 0 ? (
          <div className="space-y-3">
            {formData.blackoutPeriods.map((period) => (
              <div
                key={period.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {period.description}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveBlackout(period.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove blackout period"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !showAddBlackout && (
            <div className="text-center py-8 text-gray-500">
              <p>No blackout periods configured.</p>
              <p className="text-sm mt-1">Click "Add Blackout Period" to add one.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
