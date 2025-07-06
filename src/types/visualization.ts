import type { Vector3 } from 'three';
import type { Database } from '@/lib/supabase/types';

export type VisualizationMode = 'learning_style' | 'shaped_by' | 'peak_performance' | 'motivation';

export type YearsCategory = '0-5' | '6-10' | '11-15' | '16-20' | '20+';

export interface NodeData {
  id: string;
  position: Vector3;
  attendee: {
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
  };
  years_at_medtronic: number;
  yearsCategory: YearsCategory;
  learning_style: Database['public']['Tables']['survey_responses']['Row']['learning_style'];
  shaped_by: Database['public']['Tables']['survey_responses']['Row']['shaped_by'];
  peak_performance: Database['public']['Tables']['survey_responses']['Row']['peak_performance'];
  motivation: Database['public']['Tables']['survey_responses']['Row']['motivation'];
  unique_quality: string | null;
  connections: string[];
  opacity: number;
  scale: number;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  strength: number;
  opacity: number;
}

export interface VisualizationState {
  mode: VisualizationMode;
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNode: string | null;
  hoveredNode: string | null;
  cameraPosition: Vector3;
  isLoading: boolean;
  error: string | null;
  filters: {
    yearsCategory: YearsCategory | null;
    learningStyle: Database['public']['Tables']['survey_responses']['Row']['learning_style'] | null;
    shapedBy: Database['public']['Tables']['survey_responses']['Row']['shaped_by'] | null;
    peakPerformance: Database['public']['Tables']['survey_responses']['Row']['peak_performance'] | null;
    motivation: Database['public']['Tables']['survey_responses']['Row']['motivation'] | null;
  };
  sortBy: 'years' | 'connections' | null;
  sortDirection: 'asc' | 'desc';

  setMode: (mode: VisualizationMode) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setCameraPosition: (position: Vector3) => void;
  setFilter: (key: keyof VisualizationState['filters'], value: any) => void;
  setSort: (sortBy: 'years' | 'connections' | null, direction: 'asc' | 'desc') => void;
  updateVisualization: () => Promise<void>;
  resetFilters: () => void;
}

export interface VisualizationProps {
  width: number;
  height: number;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  initialMode?: VisualizationMode;
  isExportMode?: boolean;
} 