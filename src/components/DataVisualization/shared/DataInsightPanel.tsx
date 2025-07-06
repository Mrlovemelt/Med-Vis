'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Insight {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface DataInsightPanelProps {
  insights: Insight[];
  isVisible: boolean;
  className?: string;
}

export function DataInsightPanel({ insights, isVisible, className }: DataInsightPanelProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className={cn(
            'absolute top-4 right-4 w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg shadow-lg p-3 space-y-3',
            className
          )}
        >
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <h3 className="text-xs font-medium text-muted-foreground truncate">
                {insight.title}
              </h3>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold truncate">{insight.value}</p>
                {insight.trend && (
                  <span
                    className={cn('text-sm', {
                      'text-green-500': insight.trend === 'up',
                      'text-red-500': insight.trend === 'down',
                      'text-gray-500': insight.trend === 'neutral',
                    })}
                  >
                    {insight.trend === 'up' && '↑'}
                    {insight.trend === 'down' && '↓'}
                    {insight.trend === 'neutral' && '→'}
                  </span>
                )}
              </div>
              {insight.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {insight.description}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 