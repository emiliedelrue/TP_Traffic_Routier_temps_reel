import { create } from 'zustand';

const useTrafficStore = create((set) => ({
  zones: [],
  stats: null,
  topCongested: [],
  setZones: (zones) => set({ zones }),
  setStats: (stats) => set({ stats }),
  setTopCongested: (topCongested) => set({ topCongested }),
}));

export default useTrafficStore;