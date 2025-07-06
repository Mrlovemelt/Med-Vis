'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { useApprovedQuotes } from './useApprovedQuotes';

interface EnhancedVisualizationHeaderProps {
  visualizationType: 'alluvial' | 'chord';
  onVisualizationTypeChange: (type: 'alluvial' | 'chord') => void;
  isAutoPlay: boolean;
  onAutoPlayToggle: () => void;
}

export function EnhancedVisualizationHeader({
  visualizationType,
  onVisualizationTypeChange,
  isAutoPlay,
  onAutoPlayToggle,
}: EnhancedVisualizationHeaderProps) {
  const { currentQuote, isLoading, hasQuotes } = useApprovedQuotes();

  // Font size logic - simplified to prevent strobing
  const quoteTextRef = useRef<HTMLSpanElement>(null);

  // Helper to get author name or 'Anonymous'
  const getAuthor = (author: string | undefined) => {
    if (!author || author.trim().toLowerCase() === 'anonymous') return 'Anonymous';
    return author;
  };

  return (
    <header
      className="w-full flex flex-row items-center justify-between py-6 px-8"
      style={{ 
        minHeight: 120, 
        background: '#170F5F', 
        alignItems: 'center', 
        display: 'flex' 
      }}
    >
      {/* Logo and Title - row, left-aligned */}
      <div className="flex-shrink-0 flex flex-row items-center justify-start" style={{ minWidth: 220 }}>
        <img
          src="/branding/art-logo-all/art-logo-w/art-logo-en-rgb-w.png"
          alt="Medtronic Logo"
          style={{ height: 90, width: 'auto', marginRight: 16 }}
        />
        <div 
          className="text-white font-bold whitespace-nowrap"
          style={{ 
            fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, \"SF Pro\", \"Roboto\", sans-serif',
            fontSize: '1.35rem',
            letterSpacing: 0.5,
            textAlign: 'left',
            lineHeight: 1.1,
            marginTop: 0
          }}
        >
          WE Summit Insights
        </div>
      </div>

      {/* Centered Quote */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {isLoading ? (
          <div className="text-white text-lg">Loading quotes...</div>
        ) : hasQuotes && currentQuote ? (
          <div className="space-y-2 w-full flex flex-col items-center">
            <div 
              className="text-white font-bold italic px-6 rounded-lg border border-white/30 bg-white/5 backdrop-blur-sm shadow-lg mx-auto"
              style={{ 
                fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, "SF Pro", "Roboto", sans-serif',
                fontSize: 'clamp(0.7rem, 1.8vw, 1.2rem)', // Smaller font size
                lineHeight: '1.3',
                wordBreak: 'break-word',
                whiteSpace: 'pre-line',
                minHeight: 0,
                height: 80,
                maxHeight: 80,
                maxWidth: 700,
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 900, marginRight: 6, verticalAlign: 'top' }}>&ldquo;</span>
              <span
                ref={quoteTextRef}
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  lineClamp: 4,
                  maxHeight: '100%',
                }}
              >
                {currentQuote.text}
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, marginLeft: 6, verticalAlign: 'bottom' }}>&rdquo;</span>
            </div>
            {/* Author line positioned just under the quote box */}
            <div 
              className="text-white text-sm font-medium"
              style={{ 
                fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, "SF Pro", "Roboto", sans-serif',
                opacity: 0.9,
                marginTop: '4px'
              }}
            >
              — {getAuthor(currentQuote.author)}
            </div>
          </div>
        ) : (
          <div 
            className="text-white text-lg opacity-80 px-6 py-4 rounded-lg border border-white/20 bg-white/5"
            style={{ 
              fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, "SF Pro", "Roboto", sans-serif'
            }}
          >
            "Share your unique qualities and they may appear here"
          </div>
        )}
      </div>

      {/* Controls - stacked vertically and centered */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center" style={{ minWidth: 90, height: 100, justifyContent: 'center' }}>
        <button
          onClick={() => onVisualizationTypeChange('alluvial')}
          className={`w-20 h-10 mb-2 rounded-lg font-semibold transition-colors text-base border border-gray-400 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white ${visualizationType === 'alluvial' ? 'ring-2 ring-blue-400' : ''}`}
          style={{ 
            fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, "SF Pro", "Roboto", sans-serif',
            fontSize: '0.95rem',
            width: 80
          }}
        >
          Alluvial
        </button>
        <button
          onClick={() => onVisualizationTypeChange('chord')}
          className={`w-20 h-10 mb-2 rounded-lg font-semibold transition-colors text-base border border-gray-400 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white ${visualizationType === 'chord' ? 'ring-2 ring-blue-400' : ''}`}
          style={{ 
            fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, "SF Pro", "Roboto", sans-serif',
            fontSize: '0.95rem',
            width: 80
          }}
        >
          Chord
        </button>
        <button
          onClick={onAutoPlayToggle}
          className="w-20 h-10 rounded-lg font-semibold transition-colors text-base border border-gray-400 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          style={{
            fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, "SF Pro", "Roboto", sans-serif',
            fontSize: '0.95rem',
            width: 80
          }}
          title={isAutoPlay ? 'Switch to interactive mode' : 'Switch to auto-play mode'}
        >
          {isAutoPlay ? (
            <span className="flex items-center justify-center"><Pause className="h-4 w-4 mr-1" />Pause</span>
          ) : (
            <span className="flex items-center justify-center"><Play className="h-4 w-4 mr-1" />Play</span>
          )}
        </button>
      </div>
    </header>
  );
} 