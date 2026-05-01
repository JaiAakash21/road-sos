import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useAppStore } from '../store/useAppStore';

/**
 * Service to monitor network changes and update app network mode.
 */
export class NetworkService {
  private static unsubscribe: (() => void) | null = null;

  /**
   * Starts listening to network state changes.
   */
  static startMonitoring() {
    if (this.unsubscribe) return; // Already monitoring

    this.unsubscribe = NetInfo.addEventListener(state => {
      this.handleNetworkChange(state);
    });
    
    // Initial check
    NetInfo.fetch().then(state => this.handleNetworkChange(state));
  }

  /**
   * Stops listening to network state changes.
   */
  static stopMonitoring() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Logic to determine if we are online or offline mode.
   * Without offline tile support, if disconnected we just go to offline mode.
   * Leaflet map will try to use cache or show a blank grid.
   */
  private static handleNetworkChange(state: NetInfoState) {
    const { setNetworkMode } = useAppStore.getState();
    const isConnected = state.isConnected && state.isInternetReachable !== false;

    if (isConnected) {
      setNetworkMode('online');
    } else {
      // Disconnected, directly set offline mode.
      setNetworkMode('offline');
    }
  }
}
