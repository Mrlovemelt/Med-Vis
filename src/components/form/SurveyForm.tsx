import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string().min(1, 'Answer is required')
  }))
});

type FormData = z.infer<typeof formSchema>;

const questions = [
  {
    id: 'q1',
    text: 'What is your primary role in the organization?',
    type: 'select',
    options: ['Engineering', 'Design', 'Product', 'Management', 'Other']
  },
  {
    id: 'q2',
    text: 'How many years of experience do you have?',
    type: 'number',
    min: 0,
    max: 50
  },
  // Add more questions as needed
];

export default function SurveyForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      answers: questions.map(q => ({ questionId: q.id, answer: '' }))
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      // TODO: Implement form submission
      console.log('Form data:', data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6">
        <div className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  {...methods.register('firstName')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {methods.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{methods.formState.errors.firstName.message}</p>
                )}
              </div>
              {/* Add more personal information fields */}
            </div>
          )}

          {currentStep > 0 && currentStep <= questions.length && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Question {currentStep}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {questions[currentStep - 1].text}
                </label>
                {/* Add question-specific input based on type */}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            {currentStep < questions.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
} 