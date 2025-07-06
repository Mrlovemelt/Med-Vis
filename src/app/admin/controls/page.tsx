'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/context/AppContext';
import Link from 'next/link';

const ColorPicker: React.FC<{
  color: string;
  onChange: (color: string) => void;
  label: string;
}> = ({ color, onChange, label }) => {
  const [inputValue, setInputValue] = useState(color);

  const handleColorChange = (newColor: string) => {
    setInputValue(newColor);
    onChange(newColor);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Only update if it's a valid hex color
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onChange(value);
    }
  };

  const handleHexBlur = () => {
    // Reset to the current color if the input is invalid
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(color);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="color"
        value={color}
        onChange={(e) => handleColorChange(e.target.value)}
        className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          placeholder="#000000"
          className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );
};

const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}> = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

const Slider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  unit?: string;
}> = ({ value, onChange, min, max, step, label, unit }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
    />
  </div>
);

export default function GlobalControlsPage() {
  const { settings, updateCategoryColor, toggleDarkMode, toggleTestData, updateAutoPlaySpeed, toggleAutoPlay, resetToDefaults } = useAppContext();
  const [colorEditMode, setColorEditMode] = useState<'light' | 'dark'>('light');

  // Category labels for display
  const categoryLabels: { [key: string]: string } = {
    years_at_medtronic: 'Years at Medtronic',
    peak_performance: 'Peak Performance',
    learning_style: 'Learning Style',
    motivation: 'Motivation',
    shaped_by: 'Shaped By'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img
                src="/branding/art-logo-all/art-logo-k/art-logo-en-rgb-k.svg"
                alt="Medtronic"
                className="h-8 w-auto"
              />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  WE Summit
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Global Visualization Controls
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/visualization"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                Go to Visualization
              </Link>
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Global Settings */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Global Settings
              </h2>
              
              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <ToggleSwitch
                  enabled={settings.isDarkMode}
                  onChange={toggleDarkMode}
                  label="Dark Mode"
                  description="Switch between light and dark themes for all visualizations"
                />

                {/* Test Data Toggle */}
                <ToggleSwitch
                  enabled={settings.useTestData}
                  onChange={toggleTestData}
                  label="Use Test Data"
                  description="Toggle between test data and live data sources"
                />

                {/* Auto Play Toggle */}
                <ToggleSwitch
                  enabled={settings.isAutoPlayEnabled}
                  onChange={toggleAutoPlay}
                  label="Auto Play Animations"
                  description="Enable automatic transitions between visualization states"
                />

                {/* Animation Speed */}
                <Slider
                  value={settings.autoPlaySpeed}
                  onChange={updateAutoPlaySpeed}
                  min={1000}
                  max={10000}
                  step={500}
                  label="Animation Speed"
                  unit="ms"
                />
              </div>
            </div>
          </div>

          {/* Color Configuration */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Color Configuration
                </h2>
                
                {/* Theme Mode Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Editing:</span>
                  <div className="flex rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden">
                    <button
                      onClick={() => setColorEditMode('light')}
                      className={`px-3 py-1 text-sm font-medium transition-colors ${
                        colorEditMode === 'light'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      Light Mode
                    </button>
                    <button
                      onClick={() => setColorEditMode('dark')}
                      className={`px-3 py-1 text-sm font-medium transition-colors ${
                        colorEditMode === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      Dark Mode
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {Object.entries(settings.categoryColors[colorEditMode]).map(([category, answers]) => (
                  <div key={category} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      {categoryLabels[category] || category.replace(/_/g, ' ')}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(answers).map(([answer, color]) => (
                        <ColorPicker
                          key={answer}
                          color={color}
                          onChange={(newColor) => updateCategoryColor(category, answer, newColor, colorEditMode)}
                          label={answer}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Settings Preview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {settings.isDarkMode ? 'Dark' : 'Light'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Source</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {settings.useTestData ? 'Test Data' : 'Live Data'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Play</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {settings.isAutoPlayEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Speed</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {settings.autoPlaySpeed}ms
              </div>
            </div>
          </div>
          
          {/* Color Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Light Mode Colors</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(settings.categoryColors.light).slice(0, 3).map(([category, colors]) => (
                  <div key={category} className="space-y-1">
                    <div className="text-xs text-gray-600 dark:text-gray-400">{categoryLabels[category] || category.replace(/_/g, ' ')}</div>
                    <div className="flex space-x-1">
                      {Object.entries(colors).slice(0, 3).map(([answer, color]) => (
                        <div
                          key={answer}
                          className="w-3 h-3 rounded border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color }}
                          title={answer}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Dark Mode Colors</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(settings.categoryColors.dark).slice(0, 3).map(([category, colors]) => (
                  <div key={category} className="space-y-1">
                    <div className="text-xs text-gray-600 dark:text-gray-400">{categoryLabels[category] || category.replace(/_/g, ' ')}</div>
                    <div className="flex space-x-1">
                      {Object.entries(colors).slice(0, 3).map(([answer, color]) => (
                        <div
                          key={answer}
                          className="w-3 h-3 rounded border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color }}
                          title={answer}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}