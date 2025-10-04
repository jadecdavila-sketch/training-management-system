import { useState, useEffect } from 'react';

interface FormData {
  programName: string;
  region: string;
  description: string;
  sharedEmail: string;
}

interface Step1Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}

export function Step1ProgramDetails({ formData, updateFormData, onNext }: Step1Props) {
  const handleChange = (field: keyof FormData, value: string) => {
    // Update parent formData immediately as user types
    updateFormData({ [field]: value });
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Program Type Details</h1>
        <p className="text-gray-600 mt-1">
          Define the basic information for your training program.
        </p>
      </div>

      <div className="space-y-6">
        {/* Program Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.programName}
            onChange={(e) => handleChange('programName', e.target.value)}
            placeholder="e.g., New Hire Onboarding"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.region}
            onChange={(e) => handleChange('region', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select a region</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="Asia Pacific">Asia Pacific</option>
            <option value="Latin America">Latin America</option>
            <option value="Global">Global</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the purpose and objectives of this training program..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Shared Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shared Email
          </label>
          <input
            type="email"
            value={formData.sharedEmail}
            onChange={(e) => handleChange('sharedEmail', e.target.value)}
            placeholder="training@company.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Email address for program-related communications
          </p>
        </div>
      </div>
    </div>
  );
}