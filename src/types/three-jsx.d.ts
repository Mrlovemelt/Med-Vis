import { Object3D } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
    }
  }
} 