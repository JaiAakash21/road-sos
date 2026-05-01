import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LeafletView } from 'react-native-leaflet-view';
import { useAppStore } from '../../store/useAppStore';

export const MapProvider = () => {
  const { userLocation, traumaCenters, selectedHospital, routeGeometry } = useAppStore();

  const defaultCoordinates = { lat: 13.0827, lng: 80.2707 }; // Chennai

  const mapCenterPosition = userLocation 
    ? { lat: userLocation.latitude, lng: userLocation.longitude } 
    : defaultCoordinates;

  // Convert traumaCenters to Leaflet mapMarkers
  const markers = useMemo(() => {
    return traumaCenters.map((center, index) => ({
      id: `hospital-${center.id}`,
      position: {
        lat: center.location.latitude,
        lng: center.location.longitude,
      },
      icon: center.id === selectedHospital?.id ? '🏥' : '📍', // LeafletView handles emojis nicely as basic icons
      size: [32, 32],
    }));
  }, [traumaCenters, selectedHospital]);

  // Convert routeGeometry (array of {lat, lng}) to Leaflet mapShapes
  const shapes = useMemo(() => {
    if (!routeGeometry || !Array.isArray(routeGeometry) || routeGeometry.length === 0) {
      return [];
    }

    return [
      {
        shapeType: 'Polyline',
        id: 'route-polyline',
        positions: routeGeometry,
        color: '#3B82F6', // Blue route
        weight: 5,
      }
    ];
  }, [routeGeometry]);

  return (
    <View style={styles.container}>
      <LeafletView
        mapCenterPosition={mapCenterPosition}
        zoom={13}
        mapMarkers={markers}
        mapShapes={shapes}
        // Optional configuration if we wanted custom tile servers:
        // mapLayers={[{
        //   baseLayerName: 'OpenStreetMap',
        //   baseLayerIsChecked: true,
        //   layerType: 'TileLayer',
        //   baseLayer: true,
        //   url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        // }]}
      />
      {/* Fallback if map fails loading tiles in offline mode, markers will still render on grid */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB', // Grey fallback grid color
  },
});
