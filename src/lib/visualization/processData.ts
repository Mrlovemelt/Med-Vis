import { Vector3 } from 'three';
import type { NodeData, EdgeData, YearsCategory } from '@/types/visualization';
import type { Database } from '@/lib/supabase/types';

type SurveyResponse = Database['public']['Tables']['survey_responses']['Row'] & {
  attendee: {
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
  };
};

interface ProcessOptions {
  mode: 'learning_style' | 'shaped_by' | 'peak_performance' | 'motivation';
  filters: {
    yearsCategory: YearsCategory | null;
    learningStyle: Database['public']['Tables']['survey_responses']['Row']['learning_style'] | null;
    shapedBy: Database['public']['Tables']['survey_responses']['Row']['shaped_by'] | null;
    peakPerformance: Database['public']['Tables']['survey_responses']['Row']['peak_performance'] | null;
    motivation: Database['public']['Tables']['survey_responses']['Row']['motivation'] | null;
  };
  sortBy: 'years' | 'connections' | null;
  sortDirection: 'asc' | 'desc';
}

const getYearsCategory = (years: number): YearsCategory => {
  if (years >= 0 && years <= 5) return '0-5';
  if (years >= 6 && years <= 10) return '6-10';
  if (years >= 11 && years <= 15) return '11-15';
  if (years >= 16 && years <= 20) return '16-20';
  return '20+';
};

const getNodeColor = (yearsCategory: YearsCategory): string => {
  const colors = {
    '0-5': '#FFB6C1', // Light pink
    '6-10': '#87CEEB', // Sky blue
    '11-15': '#98FB98', // Pale green
    '16-20': '#DDA0DD', // Plum
    '20+': '#F0E68C', // Khaki
  };
  return colors[yearsCategory];
};

const calculateNodePosition = (index: number, total: number): Vector3 => {
  const radius = 5;
  const angle = (index / total) * Math.PI * 2;
  return new Vector3(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
    0
  );
};

const findConnections = (
  response: SurveyResponse,
  allResponses: SurveyResponse[],
  mode: ProcessOptions['mode']
): string[] => {
  return allResponses
    .filter((other) => {
      if (other.id === response.id) return false;
      return other[mode] === response[mode];
    })
    .map((other) => other.id);
};

function isValidNode(response: any): response is Omit<NodeData, 'position' | 'connections' | 'opacity' | 'scale'> & { years_at_medtronic: number, attendee: any } {
  return typeof response.years_at_medtronic === 'number' && response.attendee;
}

export const processVisualizationData = (
  data: SurveyResponse[],
  options: ProcessOptions
): { nodes: NodeData[]; edges: EdgeData[] } => {
  // Apply filters
  let filteredData = data.filter((response) => {
    if (
      options.filters.yearsCategory &&
      (typeof response.years_at_medtronic !== 'number' ||
        getYearsCategory(response.years_at_medtronic as number) !== options.filters.yearsCategory)
    ) {
      return false;
    }
    if (options.filters.learningStyle && response.learning_style !== options.filters.learningStyle) {
      return false;
    }
    if (options.filters.shapedBy && response.shaped_by !== options.filters.shapedBy) {
      return false;
    }
    if (options.filters.peakPerformance && response.peak_performance !== options.filters.peakPerformance) {
      return false;
    }
    if (options.filters.motivation && response.motivation !== options.filters.motivation) {
      return false;
    }
    return true;
  });

  // Sort data if needed
  if (options.sortBy) {
    filteredData.sort((a, b) => {
      const aValue = options.sortBy === 'years' ? (a.years_at_medtronic ?? 0) : findConnections(a, filteredData, options.mode).length;
      const bValue = options.sortBy === 'years' ? (b.years_at_medtronic ?? 0) : findConnections(b, filteredData, options.mode).length;
      return options.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  // Create nodes
  const validResponses = filteredData.filter(isValidNode);
  const nodes: NodeData[] = validResponses.map((response, index) => {
    const years_at_medtronic = response.years_at_medtronic as number;
    const yearsCategory = getYearsCategory(years_at_medtronic);
    const connections = findConnections(
      filteredData.find(r => r.id === response.id)!,
      filteredData,
      options.mode
    );
    return {
      id: response.id,
      position: calculateNodePosition(index, validResponses.length),
      attendee: response.attendee,
      years_at_medtronic,
      yearsCategory,
      learning_style: response.learning_style,
      shaped_by: response.shaped_by,
      peak_performance: response.peak_performance,
      motivation: response.motivation,
      unique_quality: response.unique_quality,
      connections,
      opacity: 1,
      scale: 1,
    };
  });
  console.log('Filtered out nodes without attendee or years_at_medtronic:', filteredData.length - nodes.length);

  // Create edges
  const edges: EdgeData[] = [];
  const edgeMap = new Set<string>();

  nodes.forEach((node) => {
    node.connections.forEach((targetId) => {
      const edgeId = [node.id, targetId].sort().join('-');
      if (!edgeMap.has(edgeId)) {
        edgeMap.add(edgeId);
        edges.push({
          id: edgeId,
          source: node.id,
          target: targetId,
          strength: 1,
          opacity: 0.5,
        });
      }
    });
  });

  return { nodes, edges };
}; 