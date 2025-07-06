import React from 'react';
import { useConstellationStore } from '@/store/constellationStore';
import type { VisualizationMode, YearsCategory } from '@/types/visualization';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RefreshCw } from 'lucide-react';

const VISUALIZATION_MODES: { value: VisualizationMode; label: string }[] = [
  { value: 'learning_style', label: 'Learning Style' },
  { value: 'shaped_by', label: 'Shaped By' },
  { value: 'peak_performance', label: 'Peak Performance' },
  { value: 'motivation', label: 'Motivation' },
];

const YEARS_CATEGORIES: { value: YearsCategory; label: string }[] = [
  { value: '0-5', label: '0-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '11-15', label: '11-15 years' },
  { value: '16-20', label: '16-20 years' },
  { value: '20+', label: '20+ years' },
];

export function ConstellationControls() {
  const {
    mode,
    filters,
    isAutoPlay,
    setMode,
    setFilter,
    setIsAutoPlay,
    resetFilters,
  } = useConstellationStore();

  return (
    <div className="flex flex-col gap-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <Select value={mode} onValueChange={(value: VisualizationMode) => setMode(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            {VISUALIZATION_MODES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          title={isAutoPlay ? 'Pause auto-play' : 'Start auto-play'}
        >
          {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={filters.yearsCategory || ''}
          onValueChange={(value: YearsCategory) => setFilter('yearsCategory', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All years</SelectItem>
            {YEARS_CATEGORIES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={resetFilters}
          title="Reset filters"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 