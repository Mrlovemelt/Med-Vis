import { create } from 'zustand';
import { Vector3 } from 'three';
import type { VisualizationState, VisualizationMode, YearsCategory } from '@/types/visualization';
import { getVisualizationData } from '@/lib/supabase/db';
import { processVisualizationData } from '@/lib/visualization/processData';

type StateWithoutMethods = Omit<VisualizationState, 'setMode' | 'setSelectedNode' | 'setHoveredNode' | 'setCameraPosition' | 'setFilter' | 'setSort' | 'updateVisualization' | 'resetFilters' | 'toggleShowTestData'> & { showTestData: boolean };

const initialState: StateWithoutMethods = {
  mode: 'learning_style',
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
  sortDirection: 'desc',
  nodes: [],
  edges: [],
  showTestData: true,
};

export const useVisualizationStore = create<VisualizationState & { showTestData: boolean; toggleShowTestData: () => void }>()((set, get) => ({
  ...initialState,

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

  setFilter: (key: keyof VisualizationState['filters'], value: any) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
    get().updateVisualization();
  },

  setSort: (sortBy: 'years' | 'connections' | null, direction: 'asc' | 'desc') => {
    set({ sortBy, sortDirection: direction });
    get().updateVisualization();
  },

  updateVisualization: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      console.log('Fetching visualization data...');
      const data = await getVisualizationData(state.showTestData);
      console.log('Raw data from database:', data);
      if (data && data.length > 0) {
        console.log('First raw data point:', data[0]);
      }

      if (!data || data.length === 0) {
        console.log('No data received from database');
        set({ nodes: [], edges: [], error: 'No data available' });
        return;
      }

      const { nodes, edges } = processVisualizationData(data, {
        mode: state.mode,
        filters: state.filters,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
      });
      console.log('Processed nodes:', nodes);
      console.log('First processed node:', nodes[0]);
      console.log('Processed edges:', edges);
      console.log('First processed edge:', edges[0]);
      set({ nodes, edges }); // Use all valid nodes and edges
    } catch (error) {
      console.error('Error updating visualization:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update visualization' });
    } finally {
      set({ isLoading: false });
    }
  },

  resetFilters: () => {
    set({ filters: initialState.filters });
    get().updateVisualization();
  },

  toggleShowTestData: () => {
    set((state) => ({ showTestData: !state.showTestData }));
    get().updateVisualization();
  },
})); 