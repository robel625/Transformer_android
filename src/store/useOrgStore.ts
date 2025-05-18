import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import orgService from '@/api/services/orgService';
import NetInfo from '@react-native-community/netinfo';

interface OrgState {
  regions: any[];
  selectedCSCs: any[];
  selectedSubstations: any[];
  selectedFeeders: any[];
  isLoaded: boolean;
  lastFetchTime?: number;
  
  // Actions
  setRegions: (regions: any[]) => void;
  setSelectedCSCs: (cscs: any[]) => void;
  setSelectedSubstations: (substations: any[]) => void;
  setSelectedFeeders: (feeders: any[]) => void;
  
  // Fetch function
  fetchRegions: () => Promise<void>;
  
  // Reset function
  reset: () => void;
}

const initialState = {
  regions: [],
  selectedCSCs: [],
  selectedSubstations: [],
  selectedFeeders: [],
  isLoaded: false,
  lastFetchTime: undefined,
};

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRegions: (regions) => set({ regions }),
      setSelectedCSCs: (selectedCSCs) => set({ selectedCSCs }),
      setSelectedSubstations: (selectedSubstations) => set({ selectedSubstations }),
      setSelectedFeeders: (selectedFeeders) => set({ selectedFeeders }),

      fetchRegions: async () => {
        // Check network status
        const networkState = await NetInfo.fetch();
        const currentTime = Date.now();
        const lastFetch = get().lastFetchTime || 0;
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        // If offline or last fetch was less than 1 hour ago, use persisted data
        if (!networkState.isConnected || (currentTime - lastFetch < oneHour)) {
          if (get().regions.length > 0) {
            set({ isLoaded: true });
            return;
          }
        }

        // Only proceed with API call if we're online
        if (!networkState.isConnected) {
          console.log('Offline: Cannot fetch regions');
          set({ isLoaded: true });
          return;
        }

        // If online and data needs refresh, fetch new data
        try {
          const data = await orgService.getOrgList();
          set({ 
            regions: data, 
            isLoaded: true,
            lastFetchTime: currentTime
          });
        } catch (error) {
          console.error("Error fetching regions:", error);
          // If fetch fails and we have persisted data, use it
          if (get().regions.length > 0) {
            set({ isLoaded: true });
            return;
          }
          throw error;
        }
      },

      reset: () => set({ ...initialState, isLoaded: false }),
    }),
    {
      name: 'org-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // State will persist for 1 week (in milliseconds)
      expireIn: 7 * 24 * 60 * 60 * 1000,
      // Only persist these keys
      partialize: (state) => ({
        regions: state.regions,
        selectedCSCs: state.selectedCSCs,
        selectedSubstations: state.selectedSubstations,
        selectedFeeders: state.selectedFeeders,
        isLoaded: state.isLoaded,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
);



