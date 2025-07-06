'use client';

import React from 'react';
import { SurveyResponse } from '../../types/survey';

interface VisualizationProps {
  data: SurveyResponse[];
}

export const Visualization: React.FC<VisualizationProps> = ({ data }) => {
  return (
    <div className="visualization p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Data Visualization</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Learning Styles Distribution</h3>
          <div className="space-y-2">
            {Object.entries(
              data.reduce((acc, curr) => {
                const style = curr.responses.learning_style;
                acc[style] = (acc[style] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([style, count]) => (
              <div key={style} className="flex justify-between">
                <span>{style}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Years at Medtronic</h3>
          <div className="space-y-2">
            {Object.entries(
              data.reduce((acc, curr) => {
                const years = curr.responses.years_at_medtronic;
                const category = years === 0 ? 'New Hire' :
                  years <= 2 ? 'Early Career' :
                  years <= 5 ? 'Growing' :
                  years <= 10 ? 'Established' :
                  years <= 20 ? 'Senior' : 'Veteran';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([category, count]) => (
              <div key={category} className="flex justify-between">
                <span>{category}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Recent Entries</h3>
        <div className="space-y-2">
          {data.slice(-5).map((entry) => (
            <div key={entry.id} className="p-2 bg-white rounded shadow">
              <div className="flex justify-between">
                <span className="font-medium">
                  {entry.is_anonymous ? 'Anonymous' : `${entry.first_name} ${entry.last_name || ''}`}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {entry.location} • {entry.responses.years_at_medtronic} years
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 