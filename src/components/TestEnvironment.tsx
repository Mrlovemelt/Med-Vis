import React, { useState, useEffect, useCallback } from 'react';
import {
  TestDataset,
  defaultConfig,
  loadTestData,
  simulateDataAccumulation,
  createPerformanceMonitor,
  TestEnvironmentConfig
} from '../lib/testUtils';
import { SurveyResponse } from '../types/survey';

interface TestEnvironmentProps {
  onDataUpdate: (data: SurveyResponse[]) => void;
  children: React.ReactNode;
}

export const TestEnvironment: React.FC<TestEnvironmentProps> = ({
  onDataUpdate,
  children
}) => {
  const [config, setConfig] = useState<TestEnvironmentConfig>(defaultConfig);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<TestDataset>('early_day1');
  const [metrics, setMetrics] = useState<any>(null);
  const performanceMonitor = createPerformanceMonitor();

  const handleDatasetChange = async (dataset: TestDataset) => {
    setCurrentDataset(dataset);
    const data = await loadTestData(dataset);
    onDataUpdate(data);
  };

  const startSimulation = useCallback(async () => {
    setIsSimulating(true);
    const data = await loadTestData(currentDataset);
    
    const cleanup = simulateDataAccumulation(
      data,
      config,
      (newData) => {
        const startTime = performanceMonitor.startProcessing();
        onDataUpdate(newData);
        performanceMonitor.endProcessing(startTime);
        
        if (config.enableLogging) {
          console.log('Data updated:', {
            entries: newData.length,
            metrics: performanceMonitor.getMetrics()
          });
        }
      }
    );

    return cleanup;
  }, [config, currentDataset, onDataUpdate]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (isSimulating) {
      startSimulation().then((cleanupFn) => {
        cleanup = cleanupFn;
      });
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [isSimulating, startSimulation]);

  return (
    <div className="test-environment">
      <div className="controls p-4 bg-gray-100 rounded-lg mb-4">
        <h2 className="text-xl font-bold mb-4">Test Environment Controls</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Dataset</label>
            <select
              value={currentDataset}
              onChange={(e) => handleDatasetChange(e.target.value as TestDataset)}
              className="w-full p-2 border rounded"
            >
              <option value="early_day1">Early Day 1</option>
              <option value="end_day1">End Day 1</option>
              <option value="end_day2">End Day 2</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Simulation Speed (entries/sec)</label>
            <input
              type="number"
              value={config.simulationSpeed}
              onChange={(e) => setConfig((prev: TestEnvironmentConfig) => ({
                ...prev,
                simulationSpeed: Number(e.target.value)
              }))}
              className="w-full p-2 border rounded"
              min="1"
              max="10"
            />
          </div>

          <div>
            <label className="block mb-2">Max Entries</label>
            <input
              type="number"
              value={config.maxEntries}
              onChange={(e) => setConfig((prev: TestEnvironmentConfig) => ({
                ...prev,
                maxEntries: Number(e.target.value)
              }))}
              className="w-full p-2 border rounded"
              min="1"
              max="600"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableLogging}
                onChange={(e) => setConfig((prev: TestEnvironmentConfig) => ({
                  ...prev,
                  enableLogging: e.target.checked
                }))}
                className="mr-2"
              />
              Enable Logging
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded ${
              isSimulating
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          </button>
        </div>
      </div>

      {metrics && (
        <div className="metrics p-4 bg-gray-100 rounded-lg mb-4">
          <h3 className="text-lg font-bold mb-2">Performance Metrics</h3>
          <pre className="bg-gray-800 text-white p-4 rounded">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </div>
      )}

      <div className="visualization-container">
        {children}
      </div>
    </div>
  );
}; 