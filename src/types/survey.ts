export type LearningStyle = 
  | 'Visual'
  | 'Auditory'
  | 'Reading/Writing'
  | 'Kinesthetic (Doing)'
  | 'Interactive/Collaborative';

export type ShapedBy = 
  | 'Education or School Environment'
  | 'Personal Challenges or Adversity'
  | 'Travel or Exposure to Different Cultures'
  | 'Family Traditions'
  | 'Religion or Spiritual Practices'
  | 'Community or Neighbors'
  | 'Sports or the Arts';

export type PeakPerformance = 
  | 'Introvert, Morning'
  | 'Extrovert, Morning'
  | 'Ambivert, Morning'
  | 'Introvert, Night'
  | 'Extrovert, Evening'
  | 'Ambivert, Night';

export type Motivation = 
  | 'Learning and growth'
  | 'Making a difference'
  | 'Building strong relationships'
  | 'Finding balance or peace'
  | 'Leading or mentoring others'
  | 'Exploring new possibilities'
  | 'Achieving personal goals';

export interface SurveyResponse {
  id: string;
  timestamp: string;
  first_name: string;
  last_name: string | null;
  is_anonymous: boolean;
  location: string;
  responses: {
    years_at_medtronic: number;
    learning_style: LearningStyle;
    shaped_by: ShapedBy;
    peak_performance: PeakPerformance;
    motivation: Motivation;
    unique_quality: string;
  };
}

export interface SurveyData {
  medtronic_data: SurveyResponse[];
} 