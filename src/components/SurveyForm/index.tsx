"use client";

import { useSurveyForm } from '@/lib/hooks/useSurveyForm';
import { AttendeeStep } from './steps/AttendeeStep';
import { YearsStep } from './steps/YearsStep';
import { LearningStyleStep } from './steps/LearningStyleStep';
import { ShapedByStep } from './steps/ShapedByStep';
import { PeakPerformanceStep } from './steps/PeakPerformanceStep';
import { MotivationStep } from './steps/MotivationStep';
import { UniqueQualityStep } from './steps/UniqueQualityStep';
import { SuccessStep } from './steps/SuccessStep';
import Image from 'next/image';
import '@/styles/brand.css';

const steps = [
  AttendeeStep,
  YearsStep,
  LearningStyleStep,
  ShapedByStep,
  PeakPerformanceStep,
  MotivationStep,
  UniqueQualityStep,
  SuccessStep,
];

export function SurveyForm() {
  const {
    currentStep,
    formData,
    isSubmitting,
    error,
    updateFormData,
    nextStep,
    prevStep,
    submitForm,
  } = useSurveyForm();

  const CurrentStepComponent = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--medtronic-atmospheric-white)]">
      <div className="max-w-xl w-full mx-auto px-0 pt-4 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-2 flex justify-center">
            <Image
              src="/branding/art-logo-all/art-logo-bl/art-logo-en-rgb-bl-svg.svg"
              alt="Medtronic logo"
              width={220}
              height={0}
              style={{ width: '160px', height: 'auto' }}
              className="block mx-auto w-[160px] sm:w-[220px] h-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-[var(--medtronic-navy-blue)] mb-2" style={{ fontFamily: 'Avenir Next World, sans-serif' }}>
            WE Summit Survey
          </h1>
          <p className="text-[var(--medtronic-secondary-text)] text-sm mb-2" style={{ fontFamily: 'Avenir Next World, sans-serif' }}>
            Share your experiences and perspectives to help us understand and celebrate the diversity of our Medtronic community.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Form Container */}
        <div className="form-container">
          {error && (
            <div className="message message-error">
              {error}
            </div>
          )}

          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            submitForm={submitForm}
            isSubmitting={isSubmitting}
            isLastStep={currentStep === steps.length - 2}
          />
        </div>
      </div>
    </div>
  );
} 