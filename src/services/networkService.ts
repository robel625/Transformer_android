import NetInfo from '@react-native-community/netinfo';
import EventEmitter from 'eventemitter3';

class NetworkService extends EventEmitter {
  private static instance: NetworkService;
  private isConnected: boolean = true;

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  private constructor() {
    super();
    this.setupNetworkListener();
    this.checkInitialState();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected === true;
      
      // Only emit event if state changed
      if (wasConnected !== this.isConnected) {
        this.emit('connectionChange', this.isConnected);
      }
    });
  }

  private async checkInitialState() {
    try {
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected === true;
    } catch (error) {
      console.error('Error checking initial network state:', error);
      this.isConnected = false;
    }
  }

  async isNetworkConnected(): Promise<boolean> {
    try {
      // First check cached state
      if (!this.isConnected) return false;
      
      // Then verify with a quick ping
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), 3000)
      );
      
      await Promise.race([
        fetch('https://www.google.com', { method: 'HEAD' }),
        timeoutPromise
      ]);
      
      return true;
    } catch (error) {
      console.log('Connection test failed:', error);
      return false;
    }
  }
}

export const networkService = NetworkService.getInstance();
export default networkService;