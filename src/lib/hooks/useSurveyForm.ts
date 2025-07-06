import { useState } from 'react';
import type { SurveyFormData } from './types';
import { createAttendee, createSurveyResponse } from '@/lib/supabase/db';

export type { SurveyFormData };

export function useSurveyForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SurveyFormData>({
    first_name: '',
    is_anonymous: false,
  });

  const updateFormData = (data: Partial<SurveyFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const submitForm = async () => {
    console.log('Submitting survey form...', formData);
    try {
      setIsSubmitting(true);
      setError(null);

      // Create attendee record
      const attendee = await createAttendee({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        is_anonymous: formData.is_anonymous,
      });

      // Create survey response
      await createSurveyResponse({
        attendee_id: attendee.id,
        years_at_medtronic: formData.years_at_medtronic,
        learning_style: formData.learning_style,
        shaped_by: formData.shaped_by,
        peak_performance: formData.peak_performance,
        motivation: formData.motivation,
        unique_quality: formData.unique_quality,
      });

      // Move to success step
      nextStep();
    } catch (err) {
      console.error('Survey submission error:', err);
      
      // Handle specific error types
      if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
        const errorCode = err.code as string;
        const errorMessage = err.message as string;
        
        if (errorCode === '23505' && errorMessage.includes('attendees_email_key')) {
          setError('An account with this email already exists. Please use a different email or submit anonymously.');
        } else if (errorCode === '23505') {
          setError('This data already exists. Please check your information and try again.');
        } else {
          setError(`Submission error: ${errorMessage}`);
        }
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while submitting the form');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    error,
    updateFormData,
    nextStep,
    prevStep,
    submitForm,
  };
} 