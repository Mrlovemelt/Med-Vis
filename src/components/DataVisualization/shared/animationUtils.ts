import { cubicBezier } from 'framer-motion';

// Standard easing functions
export const easings = {
  easeInOut: cubicBezier(0.4, 0, 0.2, 1),
  easeOut: cubicBezier(0, 0, 0.2, 1),
  easeIn: cubicBezier(0.4, 0, 1, 1),
  sharp: cubicBezier(0.4, 0, 0.6, 1),
};

// Standard animation durations
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
};

// Standard animation variants
export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideIn: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  },
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// Performance monitoring
let frameCount = 0;
let lastTime = performance.now();
let fps = 60;

export function monitorPerformance() {
  frameCount++;
  const currentTime = performance.now();
  const elapsed = currentTime - lastTime;

  if (elapsed >= 1000) {
    fps = Math.round((frameCount * 1000) / elapsed);
    frameCount = 0;
    lastTime = currentTime;
  }

  return fps;
}

// Frame rate optimization
export function optimizeFrameRate(callback: () => void) {
  let ticking = false;

  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
}

// Transition timing constants
export const transitions = {
  default: {
    type: 'spring',
    stiffness: 100,
    damping: 20,
  },
  smooth: {
    type: 'spring',
    stiffness: 50,
    damping: 15,
  },
  quick: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  },
  bounce: {
    type: 'spring',
    stiffness: 300,
    damping: 10,
  },
}; 