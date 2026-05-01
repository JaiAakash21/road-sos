import { useAppStore } from '../store/useAppStore';

export class RoutingService {
  /**
   * Generates a straight line between two points.
   * Format: Array of {lat, lng} for Leaflet Polyline.
   */
  private static generateStraightLine(start: [number, number], end: [number, number]) {
    return [
      { lat: start[1], lng: start[0] }, // [lng, lat] -> {lat, lng}
      { lat: end[1], lng: end[0] },
    ];
  }

  /**
   * Fetches the actual driving route from OSRM free API.
   */
  private static async fetchRealRoute(start: [number, number], end: [number, number]) {
    try {
      // OSRM expects coordinates as longitude,latitude
      const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // OSRM geojson coordinates are [longitude, latitude].
        // Leaflet polyline expects {lat, lng} array
        const coordinates: [number, number][] = data.routes[0].geometry.coordinates;
        return coordinates.map((coord) => ({
          lat: coord[1],
          lng: coord[0]
        }));
      }
    } catch (e) {
      console.error("Failed to fetch OSRM route:", e);
    }

    // Fallback if API fails
    return this.generateStraightLine(start, end);
  }

  /**
   * Gets the route between user and selected hospital based on network mode.
   */
  static async updateRoute() {
    const { userLocation, selectedHospital, networkMode, setRouteGeometry } = useAppStore.getState();

    if (!userLocation || !selectedHospital || networkMode === 'sos') {
      setRouteGeometry(null);
      return;
    }

    const start: [number, number] = [userLocation.longitude, userLocation.latitude];
    const end: [number, number] = [selectedHospital.location.longitude, selectedHospital.location.latitude];

    if (networkMode === 'offline') {
      // Offline -> Straight line array of {lat, lng}
      const line = this.generateStraightLine(start, end);
      setRouteGeometry(line);
    } else {
      // Online -> OSRM API array of {lat, lng}
      const route = await this.fetchRealRoute(start, end);
      setRouteGeometry(route);
    }
  }
}
