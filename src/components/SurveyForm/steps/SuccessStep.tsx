"use client";
import React from 'react';
import type { SurveyFormData } from '@/lib/hooks/useSurveyForm';

interface SuccessStepProps {
  formData: SurveyFormData;
}

export function SuccessStep({ formData }: SuccessStepProps) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900">
        Thank you for your contribution!
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        {formData.is_anonymous
          ? 'Your anonymous response has been recorded.'
          : `Thank you, ${formData.first_name}! Your response has been recorded.`}
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Your insights will help us better understand and visualize the diverse
        perspectives and experiences within our Medtronic community.
      </p>
      {formData.unique_quality && (
        <div className="mt-8 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            Your unique quality or perspective will be reviewed before being
            included in the visualization:
          </p>
          <p className="mt-2 text-sm italic text-gray-800">
            "{formData.unique_quality}"
          </p>
        </div>
      )}
    </div>
  );
} 