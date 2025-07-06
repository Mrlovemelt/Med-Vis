import type { Database } from '@/lib/supabase/types';

export type SurveyFormData = {
  first_name: string;
  last_name?: string;
  email?: string;
  is_anonymous: boolean;
  years_at_medtronic?: number;
  learning_style?: Database['public']['Tables']['survey_responses']['Row']['learning_style'];
  shaped_by?: Database['public']['Tables']['survey_responses']['Row']['shaped_by'];
  peak_performance?: Database['public']['Tables']['survey_responses']['Row']['peak_performance'];
  motivation?: Database['public']['Tables']['survey_responses']['Row']['motivation'];
  unique_quality?: string;
}; 