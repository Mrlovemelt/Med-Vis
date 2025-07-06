'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Three.js components with SSR disabled
const DynamicCanvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { 
    ssr: false,
    loading: () => <div>Loading 3D scene...</div>
  }
);

const DynamicOrbitControls = dynamic(
  () => import('@react-three/drei').then((mod) => mod.OrbitControls),
  { 
    ssr: false,
    loading: () => null
  }
);

interface BaseSceneProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
}

const BaseScene: React.FC<BaseSceneProps> = ({
  children,
  cameraPosition = [0, 0, 5],
  fov = 75,
  near = 0.1,
  far = 1000,
}) => {
  return (
    <Suspense fallback={<div>Loading 3D scene...</div>}>
      <DynamicCanvas
        camera={{
          position: cameraPosition,
          fov,
          near,
          far,
        }}
        gl={{
          antialias: true,
          alpha: true,
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <DynamicOrbitControls enableDamping dampingFactor={0.05} />
        {children}
      </DynamicCanvas>
    </Suspense>
  );
};

export default BaseScene; 