import { NativeEventEmitter } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import EventEmitter from 'eventemitter3';
import { apisync } from '@/api/apiClient';
import { SyncQueueItem } from '../models/SyncQueueItem';

// Forward declaration to avoid circular dependency
let storageServiceInstance: any = null;

// Set storage service instance later
export function setStorageService(instance: any) {
  storageServiceInstance = instance;
}

interface SyncEndResult {
  success?: boolean;
  offline?: boolean;
  error?: any;
  successCount?: number;
  failureCount?: number;
}

class SyncService extends EventEmitter {
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private static instance: SyncService;

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private constructor() {
    super();
    this.setupNetworkListener();
    this.startSyncInterval();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.sync();
      }
    });
  }

  private startSyncInterval() {
    this.syncInterval = setInterval(() => {
      this.sync();
    }, 5 * 60 * 1000);
  }

  async sync() {
    if (this.isSyncing || !storageServiceInstance) return;

    try {
      this.isSyncing = true;
      this.emit('syncStart');

      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        this.emit('syncEnd', { offline: true });
        return;
      }

      const queue = await storageServiceInstance.getSyncQueue();
      if (queue.length === 0) {
        this.emit('syncEnd', { success: true });
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const item of queue) {
        console.log("item________________________________", item)
        try {
          const response = await this.processSyncItem(item);
          
          // Only remove from queue if we get a successful response
          if (response && (response.status === 200 || response.status === 201 || response.status === 204)) {
            await storageServiceInstance.removeFromSyncQueue(item.id);
            successCount++;
          } else {
            // Update the item with error information
            console.log("item.erroritem.erroritem.error________________________________", item)
            const updatedItem = {
              ...item,
              status: 'failed' as const,
              error: item.error 
                ? `${item.error}\n${response?.error ? JSON.stringify(response.error) : 'Unknown error'}`
                : (response?.error ? JSON.stringify(response.error) : 'Unknown error'),
              retryCount: (item.retryCount || 0) + 1
            };
            
            await storageServiceInstance.updateSyncQueueItem(updatedItem);
            failureCount++;
          }
        } catch (error) {
          console.error('Error processing sync item:', error);
          // Update the item with error information
          const updatedItem = {
            ...item,
            status: 'failed' as const,
            error: item.error 
              ? `${item.error}\n${error.message || JSON.stringify(error)}`
              : (error.message || JSON.stringify(error)),
            retryCount: (item.retryCount || 0) + 1
          };
          
          await storageServiceInstance.updateSyncQueueItem(updatedItem);
          failureCount++;
        }
      }

      await storageServiceInstance.setLastSyncTime(Date.now());
      this.emit('syncEnd', { success: true, successCount, failureCount });

    } catch (error) {
      console.error('Sync error:', error);
      this.emit('syncEnd', { success: false, error });
    } finally {
      this.isSyncing = false;
    }
  }

  private async processSyncItem(item: SyncQueueItem) {
    const { endpoint, method, data } = item;
    let response;
    switch (method) {
      case 'POST':
        response = await apisync.post(endpoint, data);
        break;
      case 'PUT':
        response = await apisync.put(endpoint, data);
        break;
      case 'PATCH':
        response = await apisync.patch(endpoint, data);
        break;
      case 'DELETE':
        response = await apisync.delete(endpoint);
        break;
    }
    
    return response;
  }

  async addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>) {
    if (!storageServiceInstance) return item;
    
    await storageServiceInstance.addToSyncQueue(item);
    // Emit an event when queue changes
    this.emit('queueChanged');
    this.sync();

    return item;
  }

  async clearQueue() {
    if (!storageServiceInstance) return;
    await storageServiceInstance.clearSyncQueue();
  }

  on(event: 'syncStart', listener: () => void): this;
  on(event: 'syncEnd', listener: (result: SyncEndResult) => void): this;
  on(event: 'queueChanged', listener: () => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  removeListener(event: string, listener: (...args: any[]) => void): this {
    return super.removeListener(event, listener);
  }
}

export default SyncService;









