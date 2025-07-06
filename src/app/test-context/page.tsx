'use client';

import React from 'react';
import { useAppContext } from '@/lib/context/AppContext';
import Link from 'next/link';

export default function TestContextPage() {
  const { settings, toggleDarkMode, toggleTestData, toggleAutoPlay } = useAppContext();

  return (
    <div className={`min-h-screen p-8 transition-colors duration-200 ${
      settings.isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AppContext Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${
            settings.isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Current Settings</h2>
            <div className="space-y-2">
              <p><strong>Dark Mode:</strong> {settings.isDarkMode ? 'Enabled' : 'Disabled'}</p>
              <p><strong>Test Data:</strong> {settings.useTestData ? 'Enabled' : 'Disabled'}</p>
              <p><strong>Auto Play:</strong> {settings.isAutoPlayEnabled ? 'Enabled' : 'Disabled'}</p>
              <p><strong>Auto Play Speed:</strong> {settings.autoPlaySpeed}ms</p>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg border ${
            settings.isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={toggleDarkMode}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Toggle Dark Mode
              </button>
              <button
                onClick={toggleTestData}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Toggle Test Data
              </button>
              <button
                onClick={toggleAutoPlay}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Toggle Auto Play
              </button>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg border ${
          settings.isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold mb-4">Color Configuration Preview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(settings.categoryColors).slice(0, 4).map(([category, colors]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium text-sm">{category.replace(/_/g, ' ')}</h3>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(colors).slice(0, 3).map(([answer, color]) => (
                    <div
                      key={answer}
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={answer}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 flex gap-4">
          <Link
            href="/admin/controls"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Global Controls
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 