import { create } from 'zustand';
import { TraumaCenter, Location } from '../models/TraumaCenter';
import { MOCK_TRAUMA_CENTERS } from '../data/mockCenters';
import { getDistance } from '../utils/distance';

export type NetworkMode = 'online' | 'offline' | 'sos';

export type OfflineDownloadState = {
  status: 'idle' | 'downloading' | 'ready' | 'error';
  progress: number; // 0 to 100
};

interface AppState {
  userLocation: Location | null;
  gpsActive: boolean;
  traumaCenters: TraumaCenter[];
  networkMode: NetworkMode;
  offlineDownloadState: OfflineDownloadState;
  
  // New Step 4 Fields
  sortedHospitals: TraumaCenter[];
  selectedHospital: TraumaCenter | null;
  routeGeometry: any | null; // GeoJSON geometry or null
  
  // Actions
  setUserLocation: (location: Location | null) => void;
  setGpsActive: (active: boolean) => void;
  setTraumaCenters: (centers: TraumaCenter[]) => void;
  setNetworkMode: (mode: NetworkMode) => void;
  setOfflineDownloadState: (state: Partial<OfflineDownloadState>) => void;
  setRouteGeometry: (geo: any | null) => void;
  recalculateNearest: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  userLocation: null,
  gpsActive: false,
  traumaCenters: MOCK_TRAUMA_CENTERS,
  networkMode: 'online',
  offlineDownloadState: { status: 'idle', progress: 0 },
  
  sortedHospitals: [],
  selectedHospital: null,
  routeGeometry: null,
  
  setUserLocation: (location) => set({ userLocation: location }),
  setGpsActive: (active) => set({ gpsActive: active }),
  setTraumaCenters: (centers) => set({ traumaCenters: centers }),
  setNetworkMode: (mode) => set({ networkMode: mode }),
  setOfflineDownloadState: (state) => 
    set((prev) => ({ 
      offlineDownloadState: { ...prev.offlineDownloadState, ...state } 
    })),
  setRouteGeometry: (geo) => set({ routeGeometry: geo }),
  
  recalculateNearest: () => {
    const { userLocation, traumaCenters } = get();
    
    if (!userLocation || traumaCenters.length === 0) {
      set({ sortedHospitals: [], selectedHospital: null });
      return;
    }

    // Map over centers to calculate distance, then sort
    const withDistances = traumaCenters.map(center => {
      const distanceKm = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        center.location.latitude,
        center.location.longitude
      );
      
      return {
        ...center,
        // Optional Step 4: Add score if needed, but strictly sorting by distance for now
        distanceValue: distanceKm,
        distanceString: `${distanceKm.toFixed(1)} km`, // Overwrite mock string
      };
    });

    withDistances.sort((a, b) => a.distanceValue - b.distanceValue);

    set({ 
      sortedHospitals: withDistances,
      selectedHospital: withDistances[0] || null
    });
  }
}));
