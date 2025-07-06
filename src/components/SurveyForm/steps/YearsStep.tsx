"use client";
import React from 'react';
import type { SurveyFormData } from '@/lib/hooks/useSurveyForm';

interface YearsStepProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function YearsStep({ formData, updateFormData, nextStep, prevStep }: YearsStepProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.years_at_medtronic === undefined) {
      setError('Please select the number of years');
      return;
    }
    nextStep();
  };

  const yearOptions = [
    { value: 0, label: 'Less than 1 year' },
    { value: 1, label: '1-2 years' },
    { value: 3, label: '3-5 years' },
    { value: 6, label: '6-10 years' },
    { value: 11, label: '11-15 years' },
    { value: 16, label: '16+ years' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="form-label text-lg">
          How long have you been at Medtronic?
        </label>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {yearOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setError(null);
                updateFormData({ years_at_medtronic: option.value });
              }}
              className={`
                p-4 text-left rounded-lg border-2 transition-colors
                ${
                  formData.years_at_medtronic === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }
              `}
            >
              <div className="font-medium text-[var(--medtronic-navy-blue)]">{option.label}</div>
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