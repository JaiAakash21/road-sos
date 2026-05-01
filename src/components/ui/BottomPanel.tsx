import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Navigation, MapPin, AlertTriangle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@trauma_centers_cache';

export const BottomPanel = () => {
  const { 
    traumaCenters, 
    setTraumaCenters, 
    networkMode, 
    sortedHospitals,
    selectedHospital
  } = useAppStore();

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        if (networkMode === 'offline' || networkMode === 'sos') {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) {
            setTraumaCenters(JSON.parse(cached));
          }
        } else {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(traumaCenters));
        }
      } catch (e) {
        console.error('Error caching trauma centers:', e);
      }
    };
    fetchCenters();
  }, [networkMode]);

  const handleSOS = () => {
    console.log("Trigger SOS for", selectedHospital?.name);
  };

  const renderHeader = () => {
    if (sortedHospitals.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hospitals available offline.</Text>
        </View>
      );
    }

    if (!selectedHospital) return null;

    return (
      <View style={styles.selectedCard}>
        <View style={styles.selectedCardHeader}>
          <View style={styles.iconContainerSelected}>
            <MapPin color="#10B981" size={28} />
          </View>
          <View style={styles.selectedCardText}>
            <Text style={styles.selectedLabel}>NEAREST HOSPITAL</Text>
            <Text style={styles.hospitalNameLarge}>{selectedHospital.name}</Text>
            <Text style={styles.distanceTextLarge}>{selectedHospital.distanceString}</Text>
          </View>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton}>
            <Navigation color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Navigate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dangerButton} onPress={handleSOS}>
            <AlertTriangle color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.dragHandle} />
      
      <View style={styles.headerRow}>
        <Text style={styles.title}>Emergency Centers</Text>
      </View>
      
      {/* Nearest Hospital Highlight */}
      {renderHeader()}

      <Text style={styles.subTitle}>Other Nearby Options</Text>
      
      <FlatList
        data={sortedHospitals.filter(h => h.id !== selectedHospital?.id)}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardInfo}>
              <View style={styles.iconContainer}>
                <MapPin color="#EF4444" size={20} />
              </View>
              <View>
                <Text style={styles.hospitalName}>{item.name}</Text>
                <Text style={styles.distanceText}>{item.distanceString}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '50%',
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
  },
  emptyText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  selectedCard: {
    backgroundColor: '#F0FDF4', // Light green
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  selectedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 16,
    marginRight: 16,
  },
  selectedCardText: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 1,
    marginBottom: 4,
  },
  hospitalNameLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  distanceTextLarge: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1D4ED8',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  dangerButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
