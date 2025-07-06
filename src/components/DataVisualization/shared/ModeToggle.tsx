'use client';

import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  isAutoPlay: boolean;
  onToggle: () => void;
  className?: string;
}

export function ModeToggle({ isAutoPlay, onToggle, className }: ModeToggleProps) {
  return (
    <div className={cn('absolute top-4 right-16 z-10', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className="bg-background/80 hover:bg-background/90 transition-colors"
        title={isAutoPlay ? 'Switch to interactive mode' : 'Switch to auto-play mode'}
      >
        {isAutoPlay ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
} 