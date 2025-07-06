"use client";

import React from 'react';
import type { SurveyFormData } from '@/lib/hooks/useSurveyForm';
import type { PeakPerformanceType } from '@/lib/supabase/types';

interface PeakPerformanceStepProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const performanceTypes = [
  {
    value: 'Extrovert, Morning',
    label: 'Extrovert, Morning',
    description: 'I enjoy collaborating and brainstorming early in the day',
  },
  {
    value: 'Extrovert, Evening',
    label: 'Extrovert, Evening',
    description: 'I find myself energized at night for group projects and social discussions',
  },
  {
    value: 'Introvert, Morning',
    label: 'Introvert, Morning',
    description: 'I prefer to start my day quietly, focusing on tasks without distractions',
  },
  {
    value: 'Introvert, Night',
    label: 'Introvert, Night',
    description: 'I\'m most productive at night, working independently on complex tasks',
  },
  {
    value: 'Ambivert, Morning',
    label: 'Ambivert, Morning',
    description: 'I thrive in the morning, balancing independent work and social interaction',
  },
  {
    value: 'Ambivert, Night',
    label: 'Ambivert, Night',
    description: 'I work best at night when I can choose between focusing alone or collaborating',
  },
];

export function PeakPerformanceStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: PeakPerformanceStepProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.peak_performance) {
      setError('Please select your peak performance type');
      return;
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="form-label text-lg">
          Based on your personality, when do you feel you're at your peak performance?
        </label>
        <div className="grid grid-cols-1 gap-4 mt-4">
          {performanceTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setError(null);
                updateFormData({ peak_performance: type.value as PeakPerformanceType });
              }}
              className={`
                p-4 text-left rounded-lg border-2 transition-colors
                ${
                  formData.peak_performance === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }
              `}
            >
              <div className="font-medium text-[var(--medtronic-navy-blue)]">{type.label}</div>
              <div className="mt-1 text-sm text-[var(--medtronic-body-text)]">{type.description}</div>
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-[var(--medtronic-error)]">{error}</p>}
      </div>

      <div className="flex justify-between gap-4">
        <button
          type="button"
          onClick={prevStep}
          className="btn btn-secondary flex-1"
        >
          Previous
        </button>
        <button
          type="submit"
          className="btn btn-primary flex-1"
        >
          Next
        </button>
      </div>
    </form>
  );
} 