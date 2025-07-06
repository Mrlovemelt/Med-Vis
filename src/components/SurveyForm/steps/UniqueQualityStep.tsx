"use client";

import React from 'react';
import type { SurveyFormData } from '@/lib/hooks/useSurveyForm';

interface UniqueQualityStepProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitForm: () => void;
  isSubmitting: boolean;
  isLastStep: boolean;
}

export function UniqueQualityStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
  submitForm,
  isSubmitting,
  isLastStep,
}: UniqueQualityStepProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('UniqueQualityStep handleSubmit called', { isLastStep, formData });
    e.preventDefault();
    if (!formData.unique_quality?.trim()) {
      setError('Please share your unique quality');
      return;
    }
    if (isLastStep) {
      await submitForm();
    } else {
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">
          What unique quality or perspective do you bring to your team?
        </label>
        <div className="mt-2">
          <textarea
            id="unique_quality"
            rows={4}
            value={formData.unique_quality || ''}
            onChange={(e) => {
              setError(null);
              updateFormData({ unique_quality: e.target.value });
            }}
            placeholder="Share your thoughts..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          This response will be reviewed before being included in the visualization.
          Your identity can remain anonymous if you chose that option earlier.
        </p>
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
          disabled={isSubmitting}
          className={`
            inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {isSubmitting ? 'Submitting...' : isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    </form>
  );
} 