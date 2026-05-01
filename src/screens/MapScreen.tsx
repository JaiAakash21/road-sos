import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MapProvider } from '../components/map/MapProvider';
import { BottomPanel } from '../components/ui/BottomPanel';
import { SOSButton } from '../components/ui/SOSButton';
import { TopOverlay } from '../components/ui/TopOverlay';
import { LocationService } from '../services/LocationService';
import { NetworkService } from '../services/NetworkService';
import { useAppStore } from '../store/useAppStore';
import { RoutingService } from '../services/RoutingService';
import { AlertTriangle } from 'lucide-react-native';

export const MapScreen = () => {
  const { 
    networkMode, 
    userLocation, 
    traumaCenters, 
    recalculateNearest,
    selectedHospital 
  } = useAppStore();

  useEffect(() => {
    // Start watching network status
    NetworkService.startMonitoring();
    // Request location
    LocationService.requestAndGetLocation();

    return () => {
      NetworkService.stopMonitoring();
    };
  }, []);

  // Reactive Update 1: Recalculate nearest when location/data changes
  useEffect(() => {
    recalculateNearest();
  }, [userLocation, traumaCenters, recalculateNearest]);

  // Reactive Update 2: Update route when selected hospital or network mode changes
  useEffect(() => {
    RoutingService.updateRoute();
  }, [selectedHospital, networkMode, userLocation]);

  // SOS Mode Fallback
  if (networkMode === 'sos') {
    return (
      <View style={styles.sosContainer}>
        <TopOverlay />
        <View style={styles.sosContent}>
          <AlertTriangle color="#EF4444" size={80} />
          <Text style={styles.sosTitle}>EMERGENCY MODE</Text>
          <Text style={styles.sosText}>
            No map data available. Connecting to emergency services directly...
          </Text>
        </View>
        <SOSButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Layer 1: Map */}
      <MapProvider />

      {/* Layer 2: UI Overlays */}
      <TopOverlay />
      
      <SOSButton />
      
      <BottomPanel />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  sosContainer: {
    flex: 1,
    backgroundColor: '#FEF2F2', // Light red
  },
  sosContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  sosTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#EF4444',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  sosText: {
    fontSize: 16,
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 24,
  }
});
