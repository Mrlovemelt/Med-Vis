"use client";
import React from 'react';
import type { SurveyFormData } from '@/lib/hooks/useSurveyForm';
import type { ShapedBy } from '@/lib/supabase/types';

interface ShapedByStepProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const shapedByOptions: { value: ShapedBy; label: string; description: string }[] = [
  {
    value: 'mentor',
    label: 'Mentorship',
    description: 'A mentor or role model who guided and inspired you',
  },
  {
    value: 'challenge',
    label: 'Challenge',
    description: 'A significant challenge or obstacle you overcame',
  },
  {
    value: 'failure',
    label: 'Failure',
    description: 'A failure that taught you valuable lessons',
  },
  {
    value: 'success',
    label: 'Success',
    description: 'A significant achievement or success that motivated you',
  },
  {
    value: 'team',
    label: 'Team',
    description: 'Collaboration and support from your team members',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Another significant influence not listed above',
  },
];

export function ShapedByStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: ShapedByStepProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shaped_by) {
      setError('Please select what has shaped your career journey');
      return;
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">
          What has most significantly shaped your career journey at Medtronic?
        </label>
        <div className="grid grid-cols-1 gap-4">
          {shapedByOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setError(null);
                updateFormData({ shaped_by: option.value });
              }}
              className={`
                p-4 text-left rounded-lg border-2 transition-colors
                ${
                  formData.shaped_by === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }
              `}
            >
              <div className="font-medium">{option.label}</div>
              <div className="mt-1 text-sm text-gray-500">{option.description}</div>
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