"use client";

import { useState } from 'react';
import type { SurveyFormData } from '@/lib/hooks/useSurveyForm';

interface AttendeeStepProps {
  formData: SurveyFormData;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  nextStep: () => void;
}

export function AttendeeStep({ formData, updateFormData, nextStep }: AttendeeStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="first_name"
          className="form-label"
        >
          First Name
        </label>
        <input
          type="text"
          id="first_name"
          value={formData.first_name}
          onChange={(e) => updateFormData({ first_name: e.target.value })}
          className="form-input"
        />
        {errors.first_name && (
          <p className="mt-1 text-sm text-[var(--medtronic-error)]">{errors.first_name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="last_name"
          className="form-label"
        >
          Last Name (Optional)
        </label>
        <input
          type="text"
          id="last_name"
          value={formData.last_name || ''}
          onChange={(e) => updateFormData({ last_name: e.target.value })}
          className="form-input"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="form-label"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email || ''}
          onChange={(e) => updateFormData({ email: e.target.value })}
          disabled={formData.is_anonymous}
          placeholder="Email (optional)"
          className="form-input disabled:bg-[var(--medtronic-atmospheric-white)] placeholder-gray-400"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_anonymous"
          checked={formData.is_anonymous}
          onChange={(e) => updateFormData({ is_anonymous: e.target.checked })}
          className="h-4 w-4 rounded border-[var(--medtronic-secondary-text)] text-[var(--medtronic-electric-blue)] focus:ring-[var(--medtronic-electric-blue)]"
        />
        <label
          htmlFor="is_anonymous"
          className="ml-2 block text-sm text-[var(--medtronic-body-text)]"
        >
          Submit anonymously
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
        >
          Next
        </button>
      </div>
    </form>
  );
} 