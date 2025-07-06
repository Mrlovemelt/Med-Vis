import { select, Selection, BaseType } from 'd3-selection';
import { forceSimulation, Simulation, SimulationNodeDatum, forceLink, SimulationLinkDatum, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { transition } from 'd3-transition';
import { interpolate } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import { zoom, ZoomBehavior } from 'd3-zoom';
import { drag, DragBehavior } from 'd3-drag';
import type { NodeData } from '@/types/visualization';

type SimulationNode = NodeData & SimulationNodeDatum;
interface SimulationLink extends SimulationLinkDatum<SimulationNode> {
  id: string;
  strength: number;
  opacity: number;
}

// Responsive SVG setup
export function createResponsiveSVG(
  container: HTMLElement,
  width: number,
  height: number,
  margin = { top: 20, right: 20, bottom: 20, left: 20 }
) {
  const svg = select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto;');

  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  return {
    svg,
    g,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
}

// Standard transitions
export const transitions = {
  default: 750,
  slow: 1500,
  fast: 300,
};

// Force simulation configs
export function createForceSimulation(
  nodes: SimulationNode[],
  links: SimulationLink[],
  width: number,
  height: number
): Simulation<SimulationNode, SimulationLink> {
  return forceSimulation<SimulationNode, SimulationLink>(nodes)
    .force(
      'link',
      forceLink<SimulationNode, SimulationLink>(links)
        .id((d: any) => d.id)
        .distance(100)
    )
    .force('charge', forceManyBody().strength(-100))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collision', forceCollide().radius(30));
}

// Path generation helpers
export function generatePath(points: [number, number][], tension = 0.5) {
  if (points.length < 2) return '';

  const [start, ...rest] = points;
  let path = `M ${start[0]},${start[1]}`;

  if (points.length === 2) {
    const [end] = rest;
    path += ` L ${end[0]},${end[1]}`;
    return path;
  }

  const [end] = rest.slice(-1);
  const controlPoints = rest.slice(0, -1);

  controlPoints.forEach((point, i) => {
    const [x, y] = point;
    const [nextX, nextY] = rest[i + 1];
    const cp1x = x + (nextX - x) * tension;
    const cp1y = y + (nextY - y) * tension;
    path += ` C ${cp1x},${cp1y} ${nextX},${nextY} ${nextX},${nextY}`;
  });

  return path;
}

// Performance optimizations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Zoom behavior helpers
export function createZoomBehavior(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  g: Selection<SVGGElement, unknown, null, undefined>
): ZoomBehavior<SVGSVGElement, unknown> {
  const zoomBehavior = zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoomBehavior);
  return zoomBehavior;
}

// Animation helpers
export function animateValue(
  selection: Selection<BaseType, unknown, null, undefined>,
  attribute: string,
  start: number,
  end: number,
  duration: number
) {
  const interpolator = interpolate(start, end);
  return transition()
    .duration(duration)
    .tween(attribute, () => (t: number) => {
      selection.attr(attribute, interpolator(t));
    });
}

// Scale helpers
export function createLinearScale(
  domain: [number, number],
  range: [number, number]
) {
  return scaleLinear().domain(domain).range(range);
}

// Selection helpers
export function createSelection(
  container: HTMLElement,
  className: string
): Selection<SVGGElement, unknown, null, undefined> {
  return select(container).select<SVGGElement>(`.${className}`);
}

// Event helpers
export function addDragBehavior(
  selection: Selection<SVGGElement, SimulationNode, SVGGElement, unknown>,
  simulation: Simulation<SimulationNode, SimulationLink>
) {
  const dragBehavior = drag<SVGGElement, SimulationNode>()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.position.x;
      d.fy = d.position.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
      d.position.x = event.x;
      d.position.y = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  selection.call(dragBehavior);
} 