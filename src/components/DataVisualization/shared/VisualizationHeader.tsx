import React from 'react';

interface VisualizationHeaderProps {
  logoSrc: string;
  summitTitle: string;
  visualizationName: string;
  viewName: string;
  stats?: React.ReactNode;
}

export function VisualizationHeader({
  logoSrc,
  summitTitle,
  visualizationName,
  viewName,
  stats,
}: VisualizationHeaderProps) {
  return (
    <header
      className="w-full flex flex-row items-center gap-8 py-6 px-8"
      style={{ minHeight: 96, background: '#170F5F', alignItems: 'center', display: 'flex' }}
    >
      <img
        src={logoSrc}
        alt="Medtronic Logo"
        style={{ height: 96, width: 'auto', flexShrink: 0 }}
        className="mr-6"
      />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-row items-end gap-6 flex-wrap">
          <span
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, \"SF Pro\", \"Roboto\", sans-serif', color: '#FFF' }}
          >
            {summitTitle}
          </span>
          <span
            className="text-xl sm:text-2xl font-semibold tracking-tight"
            style={{ fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, \"SF Pro\", \"Roboto\", sans-serif', color: '#FFF' }}
          >
            {visualizationName}
          </span>
          <span
            className="text-lg sm:text-xl font-medium tracking-tight truncate"
            style={{ fontFamily: 'Avenir Next World, -apple-system, BlinkMacSystemFont, \"SF Pro\", \"Roboto\", sans-serif', color: '#FFF', opacity: 0.85 }}
          >
            {viewName}
          </span>
        </div>
      </div>
      {stats && (
        <div className="flex flex-col items-end ml-auto justify-center" style={{ minWidth: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          {stats}
        </div>
      )}
    </header>
  );
} 