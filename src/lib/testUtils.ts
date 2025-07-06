import { SurveyResponse } from '../types/survey';

export type TestDataset = 'early_day1' | 'end_day1' | 'end_day2';

export interface TestEnvironmentConfig {
  dataset: TestDataset;
  simulationSpeed: number; // entries per second
  maxEntries: number;
  enableLogging: boolean;
  performanceMonitoring: boolean;
}

export const defaultConfig: TestEnvironmentConfig = {
  dataset: 'early_day1',
  simulationSpeed: 1,
  maxEntries: 600,
  enableLogging: true,
  performanceMonitoring: true
};

// Utility to load and process test data
export const loadTestData = async (dataset: TestDataset): Promise<SurveyResponse[]> => {
  const response = await fetch(`/api/test-data/${dataset}`);
  const data = await response.json();
  return data.medtronic_data;
};

// Simulate time-based data accumulation
export const simulateDataAccumulation = (
  data: SurveyResponse[],
  config: TestEnvironmentConfig,
  onUpdate: (data: SurveyResponse[]) => void
) => {
  let currentIndex = 0;
  const interval = 1000 / config.simulationSpeed;

  const timer = setInterval(() => {
    if (currentIndex >= Math.min(data.length, config.maxEntries)) {
      clearInterval(timer);
      return;
    }

    const newData = data.slice(0, currentIndex + 1);
    onUpdate(newData);
    currentIndex++;

    if (config.enableLogging) {
      console.log(`Added entry ${currentIndex}/${config.maxEntries}`);
    }
  }, interval);

  return () => clearInterval(timer);
};

// Performance monitoring
export const createPerformanceMonitor = () => {
  const metrics = {
    renderTime: [] as number[],
    dataProcessingTime: [] as number[],
  };

  return {
    startRender: () => performance.now(),
    endRender: (startTime: number) => {
      const renderTime = performance.now() - startTime;
      metrics.renderTime.push(renderTime);
      return renderTime;
    },
    startProcessing: () => performance.now(),
    endProcessing: (startTime: number) => {
      const processingTime = performance.now() - startTime;
      metrics.dataProcessingTime.push(processingTime);
      return processingTime;
    },
    getMetrics: () => ({
      averageRenderTime: metrics.renderTime.reduce((a, b) => a + b, 0) / metrics.renderTime.length,
      averageProcessingTime: metrics.dataProcessingTime.reduce((a, b) => a + b, 0) / metrics.dataProcessingTime.length,
    }),
  };
};

// Data categorization utilities
export const categorizeByYears = (years: number): string => {
  if (years === 0) return 'New Hire';
  if (years <= 2) return 'Early Career (1-2 years)';
  if (years <= 5) return 'Growing (3-5 years)';
  if (years <= 10) return 'Established (6-10 years)';
  if (years <= 20) return 'Senior (11-20 years)';
  return 'Veteran (20+ years)';
};

// Connection analysis utilities
export const findRelatedResponses = (
  data: SurveyResponse[],
  targetResponse: SurveyResponse
): SurveyResponse[] => {
  return data.filter(response => {
    // Find responses with similar characteristics
    const sameLearningStyle = response.responses.learning_style === targetResponse.responses.learning_style;
    const samePeakPerformance = response.responses.peak_performance === targetResponse.responses.peak_performance;
    const similarYears = Math.abs(response.responses.years_at_medtronic - targetResponse.responses.years_at_medtronic) <= 2;
    
    return (sameLearningStyle && samePeakPerformance) || similarYears;
  });
}; 