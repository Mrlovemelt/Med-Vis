"use client";

import React from 'react';
import type { SurveyFormData } from '@/lib/hooks/useSurveyForm';
import type { MotivationType } from '@/lib/supabase/types';

interface MotivationStepProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const motivationTypes: { value: MotivationType; label: string; description: string }[] = [
  {
    value: 'impact',
    label: 'Making an Impact',
    description: 'Contributing to meaningful change and positive outcomes',
  },
  {
    value: 'growth',
    label: 'Personal Growth',
    description: 'Learning, developing skills, and expanding capabilities',
  },
  {
    value: 'recognition',
    label: 'Recognition',
    description: 'Being acknowledged and valued for contributions',
  },
  {
    value: 'autonomy',
    label: 'Autonomy',
    description: 'Having independence and control over work',
  },
  {
    value: 'purpose',
    label: 'Purpose & Mission',
    description: 'Aligning with organizational values and mission',
  },
];

export function MotivationStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: MotivationStepProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.motivation) {
      setError('Please select what motivates you most');
      return;
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">
          What motivates you most in your work at Medtronic?
        </label>
        <div className="grid grid-cols-1 gap-4">
          {motivationTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setError(null);
                updateFormData({ motivation: type.value });
              }}
              className={`
                p-4 text-left rounded-lg border-2 transition-colors
                ${
                  formData.motivation === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }
              `}
            >
              <div className="font-medium">{type.label}</div>
              <div className="mt-1 text-sm text-gray-500">{type.description}</div>
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Previous
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next
        </button>
      </div>
    </form>
  );
} 