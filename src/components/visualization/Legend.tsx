import React from 'react';
import type { YearsCategory } from '@/types/visualization';

const getNodeColor = (yearsCategory: YearsCategory): string => {
  switch (yearsCategory) {
    case '0-5':
      return '#FF6B6B';
    case '6-10':
      return '#4ECDC4';
    case '11-15':
      return '#45B7D1';
    case '16-20':
      return '#96CEB4';
    case '20+':
      return '#FFEEAD';
    default:
      return '#CCCCCC';
  }
};

interface LegendProps {
  className?: string;
}

export const Legend: React.FC<LegendProps> = ({ className = '' }) => {
  const categories: YearsCategory[] = ['0-5', '6-10', '11-15', '16-20', '20+'];

  return (
    <div className={`flex flex-col gap-2 p-4 bg-white rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold">Years at Medtronic</h3>
      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <div key={category} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getNodeColor(category) }}
            />
            <span className="text-sm text-gray-700">{category} years</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 