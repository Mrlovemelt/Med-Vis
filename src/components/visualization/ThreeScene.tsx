'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ClientOnly from './ClientOnly';
import type { NodeData, EdgeData } from '@/types/visualization';

// Dynamically import the Canvas component
const DynamicCanvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
);

// Dynamically import the OrbitControls component
const DynamicOrbitControls = dynamic(
  () => import('@react-three/drei').then((mod) => mod.OrbitControls),
  { ssr: false }
);

interface ThreeSceneProps {
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNode: string | null;
  hoveredNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
}

const ThreeScene: React.FC<ThreeSceneProps> = (props) => {
  return (
    <ClientOnly fallback={<div>Loading 3D scene...</div>}>
      <Suspense fallback={<div>Loading Three.js components...</div>}>
        <DynamicCanvas
          camera={{ position: [0, 0, 10], fov: 75 }}
          style={{ background: '#f0f0f0' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <DynamicOrbitControls enableDamping dampingFactor={0.05} />
          {/* Scene content will be added here */}
        </DynamicCanvas>
      </Suspense>
    </ClientOnly>
  );
};

export default ThreeScene; 