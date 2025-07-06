'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ThreeScene component with no SSR
const ThreeScene = dynamic(() => import('./ThreeScene'), {
  ssr: false,
  loading: () => <div>Loading 3D scene...</div>
});

interface ThreeWrapperProps {
  nodes: any[];
  edges: any[];
  selectedNode: string | null;
  hoveredNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
}

const ThreeWrapper: React.FC<ThreeWrapperProps> = (props) => {
  return (
    <Suspense fallback={<div>Loading visualization...</div>}>
      <ThreeScene {...props} />
    </Suspense>
  );
};

export default ThreeWrapper; 