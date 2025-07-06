'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { VisualizationContainer } from '@/components/DataVisualization/shared/VisualizationContainer';

// Dynamically import ConstellationView with SSR disabled
const ConstellationView = dynamic(
  () => import('@/components/visualization/ConstellationView').then(mod => mod.ConstellationView),
  {
    ssr: false,
    loading: () => <div>Loading visualization...</div>
  }
);

export default function ConstellationPage() {
  return (
    <VisualizationContainer
      title="Constellation View"
      description="Explore the connections between attendees based on their responses to various questions."
    >
      <ConstellationView width={800} height={600} />
    </VisualizationContainer>
  );
} 