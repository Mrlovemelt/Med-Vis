import React from 'react';
import { useVisualizationStore } from '@/store/visualizationStore';
import type { VisualizationMode } from '@/types/visualization';

interface ControlsProps {
  className?: string;
}

export const Controls: React.FC<ControlsProps> = ({ className = '' }) => {
  const { mode, setMode, filters, setFilters, resetFilters } = useVisualizationStore();

  const modes: VisualizationMode[] = ['learning_style', 'shaped_by', 'peak_performance', 'motivation'];

  const handleModeChange = (newMode: VisualizationMode) => {
    setMode(newMode);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className={`flex flex-col gap-4 p-4 bg-white rounded-lg shadow ${className}`}>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">View Mode</h3>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 py-1 rounded ${
                mode === m
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {m.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="flex flex-col gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Years at Medtronic</label>
            <select
              value={filters.yearsCategory || ''}
              onChange={(e) => handleFilterChange('yearsCategory', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="0-5">0-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="11-15">11-15 years</option>
              <option value="16-20">16-20 years</option>
              <option value="20+">20+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Learning Style</label>
            <select
              value={filters.learningStyle || ''}
              onChange={(e) => handleFilterChange('learningStyle', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="kinesthetic">Kinesthetic</option>
              <option value="reading">Reading/Writing</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Reset Filters
      </button>
    </div>
  );
}; 