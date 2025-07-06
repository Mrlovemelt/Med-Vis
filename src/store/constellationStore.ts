import { create } from 'zustand';
import { Vector3 } from 'three';
import type { NodeData, EdgeData, VisualizationMode, YearsCategory } from '@/types/visualization';
import type { Database } from '@/lib/supabase/types';
import { getVisualizationData } from '@/lib/supabase/db';
import { processVisualizationData } from '@/lib/visualization/processData';

interface ConstellationState {
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
  isAutoPlay: boolean;
  setMode: (mode: VisualizationMode) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setCameraPosition: (position: Vector3) => void;
  setFilter: (key: keyof ConstellationState['filters'], value: any) => void;
  setSort: (sortBy: 'years' | 'connections' | null, direction: 'asc' | 'desc') => void;
  setIsAutoPlay: (isAutoPlay: boolean) => void;
  resetFilters: () => void;
  updateVisualization: () => Promise<void>;
}

const initialState = {
  mode: 'learning_style' as VisualizationMode,
  selectedNode: null,
  hoveredNode: null,
  cameraPosition: new Vector3(0, 0, 10),
  isLoading: false,
  error: null,
  filters: {
    yearsCategory: null,
    learningStyle: null,
    shapedBy: null,
    peakPerformance: null,
    motivation: null,
  },
  sortBy: null,
  sortDirection: 'desc' as const,
  isAutoPlay: false,
};

export const useConstellationStore = create<ConstellationState>((set, get) => ({
  ...initialState,
  nodes: [],
  edges: [],

  setMode: (mode: VisualizationMode) => {
    set({ mode });
    get().updateVisualization();
  },

  setSelectedNode: (nodeId: string | null) => {
    set({ selectedNode: nodeId });
  },

  setHoveredNode: (nodeId: string | null) => {
    set({ hoveredNode: nodeId });
  },

  setCameraPosition: (position: Vector3) => {
    set({ cameraPosition: position });
  },

  setFilter: (key: keyof ConstellationState['filters'], value: any) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
    get().updateVisualization();
  },

  setSort: (sortBy: 'years' | 'connections' | null, direction: 'asc' | 'desc') => {
    set({ sortBy, sortDirection: direction });
    get().updateVisualization();
  },

  setIsAutoPlay: (isAutoPlay: boolean) => {
    set({ isAutoPlay });
  },

  resetFilters: () => {
    set({ filters: initialState.filters });
    get().updateVisualization();
  },

  updateVisualization: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getVisualizationData();
      const { nodes, edges } = processVisualizationData(data, {
        mode: get().mode,
        filters: get().filters,
        sortBy: get().sortBy,
        sortDirection: get().sortDirection,
      });
      set({ nodes, edges });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update visualization' });
    } finally {
      set({ isLoading: false });
    }
  },
})); 