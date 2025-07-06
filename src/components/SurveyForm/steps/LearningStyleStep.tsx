"use client";

import React from 'react';
import type { SurveyFormData } from '@/lib/hooks/useSurveyForm';
import type { LearningStyle } from '@/lib/supabase/types';

interface LearningStyleStepProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const learningStyles: { value: LearningStyle; label: string; description: string }[] = [
  {
    value: 'visual',
    label: 'Visual',
    description: 'You learn best through images, diagrams, and spatial understanding',
  },
  {
    value: 'auditory',
    label: 'Auditory',
    description: 'You learn best through listening and verbal communication',
  },
  {
    value: 'kinesthetic',
    label: 'Kinesthetic',
    description: 'You learn best through physical activities and hands-on experience',
  },
  {
    value: 'reading_writing',
    label: 'Reading/Writing',
    description: 'You learn best through written words and text-based materials',
  },
];

export function LearningStyleStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: LearningStyleStepProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.learning_style) {
      setError('Please select your preferred learning style');
      return;
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">
          What is your preferred learning style?
        </label>
        <div className="grid grid-cols-1 gap-4">
          {learningStyles.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => {
                setError(null);
                updateFormData({ learning_style: style.value });
              }}
              className={`
                p-4 text-left rounded-lg border-2 transition-colors
                ${
                  formData.learning_style === style.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }
              `}
            >
              <div className="font-medium">{style.label}</div>
              <div className="mt-1 text-sm text-gray-500">{style.description}</div>
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