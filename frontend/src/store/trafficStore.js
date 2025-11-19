import { create } from 'zustand';

const useTrafficStore = create((set) => ({
  zones: [],
  topCongested: [],
  stats: {
    total_zones: 0,
    fluide: 0,
    modere: 0,
    dense: 0,
    bloque: 0,
    avg_global_speed: 0,
    avg_global_congestion: 0,
  },
  loading: false,
  error: null,

  setZones: (zones) => set({ zones }),
  setTopCongested: (topCongested) => set({ topCongested }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useTrafficStore;