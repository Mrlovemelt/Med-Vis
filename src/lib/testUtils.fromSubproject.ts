import { SurveyResponse, LearningStyle, ShapedBy, PeakPerformance, Motivation } from '../types/survey';

export type TestDataset = 'early_day1' | 'end_day1' | 'end_day2';

export interface TestEnvironmentConfig {
  simulationSpeed: number;
  maxEntries: number;
  enableLogging: boolean;
}

export const defaultConfig: TestEnvironmentConfig = {
  simulationSpeed: 2,
  maxEntries: 300,
  enableLogging: true
};

export const loadTestData = async (dataset: TestDataset): Promise<SurveyResponse[]> => {
  try {
    const response = await fetch(`/api/test-data/${dataset}`);
    if (!response.ok) {
      throw new Error(`Failed to load test data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading test data:', error);
    return [];
  }
};

export const simulateDataAccumulation = (
  initialData: SurveyResponse[],
  config: TestEnvironmentConfig,
  onUpdate: (data: SurveyResponse[]) => void
): (() => void) => {
  let currentData = [...initialData];
  let isRunning = true;

  const simulate = async () => {
    while (isRunning && currentData.length < config.maxEntries) {
      // Simulate new data entry
      const newEntry = generateMockEntry();
      currentData = [...currentData, newEntry];
      
      // Notify update
      onUpdate(currentData);

      // Wait based on simulation speed
      await new Promise(resolve => 
        setTimeout(resolve, 1000 / config.simulationSpeed)
      );
    }
  };

  simulate();

  return () => {
    isRunning = false;
  };
};

export const createPerformanceMonitor = () => {
  const metrics = {
    totalUpdates: 0,
    averageProcessingTime: 0,
    lastProcessingTime: 0
  };

  return {
    startProcessing: () => performance.now(),
    endProcessing: (startTime: number) => {
      const processingTime = performance.now() - startTime;
      metrics.totalUpdates++;
      metrics.lastProcessingTime = processingTime;
      metrics.averageProcessingTime = 
        (metrics.averageProcessingTime * (metrics.totalUpdates - 1) + processingTime) / 
        metrics.totalUpdates;
    },
    getMetrics: () => ({ ...metrics })
  };
};

// Helper function to generate mock entries
const generateMockEntry = (): SurveyResponse => {
  const learningStyles: LearningStyle[] = [
    'Visual',
    'Auditory',
    'Reading/Writing',
    'Kinesthetic (Doing)',
    'Interactive/Collaborative'
  ];
  const shapedBy: ShapedBy[] = [
    'Education or School Environment',
    'Personal Challenges or Adversity',
    'Travel or Exposure to Different Cultures',
    'Family Traditions',
    'Religion or Spiritual Practices',
    'Community or Neighbors',
    'Sports or the Arts'
  ];
  const peakPerformance: PeakPerformance[] = [
    'Introvert, Morning',
    'Extrovert, Morning',
    'Ambivert, Morning',
    'Introvert, Night',
    'Extrovert, Evening',
    'Ambivert, Night'
  ];
  const motivations: Motivation[] = [
    'Learning and growth',
    'Making a difference',
    'Building strong relationships',
    'Finding balance or peace',
    'Leading or mentoring others',
    'Exploring new possibilities',
    'Achieving personal goals'
  ];
  const locations = ['Minneapolis', 'Dublin', 'Singapore', 'Tokyo', 'London', 'Paris', 'Berlin', 'Sydney'];

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    first_name: `User${Math.floor(Math.random() * 1000)}`,
    last_name: `Test${Math.floor(Math.random() * 1000)}`,
    is_anonymous: Math.random() < 0.1,
    location: locations[Math.floor(Math.random() * locations.length)],
    responses: {
      years_at_medtronic: Math.floor(Math.random() * 30),
      learning_style: learningStyles[Math.floor(Math.random() * learningStyles.length)],
      shaped_by: shapedBy[Math.floor(Math.random() * shapedBy.length)],
      peak_performance: peakPerformance[Math.floor(Math.random() * peakPerformance.length)],
      motivation: motivations[Math.floor(Math.random() * motivations.length)],
      unique_quality: `Unique quality ${Math.floor(Math.random() * 1000)}`
    }
  };
}; 