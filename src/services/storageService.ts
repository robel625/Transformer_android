import { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';

// Import models
import SyncQueueItem from '../models/SyncQueueItem';
import SyncMeta from '../models/SyncMeta';

/**
 * Service for managing storage operations related to sync queue and metadata
 */
class StorageService {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  /**
   * Add an item to the sync queue
   * @param item The item to add to the queue
   * @returns The created sync queue item
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>) {
    try {
      const collection = this.database.get<SyncQueueItem>(SyncQueueItem.table);
      const newItem = await this.database.write(async () => {
        return await collection.create((record) => {
          record.endpoint = item.endpoint;
          record.method = item.method;
          record.title = item.title;
          record.data = JSON.stringify(item.data);
          record.timestamp = Date.now();
          record.status = 'pending';
          record.retryCount = 0;
        });
      });
      return newItem;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  /**
   * Update an existing sync queue item
   * @param item The item to update
   */
  async updateSyncQueueItem(item: SyncQueueItem) {
    try {
      const collection = this.database.get<SyncQueueItem>(SyncQueueItem.table);
      const existingItem = await collection.find(item.id);
      
      console.log("Updating sync queue item:", item);
      
      // Ensure data is stored as a string
      const dataString = typeof item.data === 'string' 
        ? item.data 
        : JSON.stringify(item.data);
      
      await this.database.write(async () => {
        await existingItem.update(record => {
          record.endpoint = item.endpoint;
          record.method = item.method;
          record.title = item.title;
          record.data = dataString;
          record.timestamp = item.timestamp;
          record.status = item.status;
          record.error = item.error;
          record.retryCount = item.retryCount;
        });
      });

      // Verify the update worked by fetching items
      const updatedItems = await this.getPendingSyncItems();
      console.log("Updated sync queue items:", updatedItems);
    } catch (error) {
      console.error('Error updating sync queue item:', error);
      throw error;
    }
  }

  /**
   * Get all pending items from the sync queue
   * @returns Array of pending sync queue items
   */
  async getSyncQueue() {
    try {
      const collection = this.database.get<SyncQueueItem>('sync_queue');
      const items = await collection
        .query(
          Q.where('status', 'pending')
        )
        .fetch();

      return items.map(item => ({
        id: item.id,
        endpoint: item.endpoint,
        method: item.method,
        title: item.title,
        data: JSON.parse(item.data),
        timestamp: item.timestamp,
        retryCount: item.retryCount
      }));
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  /**
   * Remove an item from the sync queue
   * @param id ID of the item to remove
   */
  async removeFromSyncQueue(id: string) {
    try {
      const syncQueue = this.database.collections.get('sync_queue');
      const item = await syncQueue.find(id);
      await this.database.write(async () => {
        await item.destroyPermanently();
      });
    } catch (error) {
      console.error('Error removing from sync queue:', error);
      throw error;
    }
  }

  /**
   * Set the last sync time
   * @param time Timestamp of the last sync
   */
  async setLastSyncTime(time: number) {
    try {
      const syncMeta = this.database.get<SyncMeta>('sync_meta');
      await this.database.write(async () => {
        const records = await syncMeta
          .query(Q.where('key', 'last_sync_time'))
          .fetch();
        
        if (records.length > 0) {
          await records[0].update(item => {
            item.value = time.toString();
          });
        } else {
          await syncMeta.create(item => {
            item.key = 'last_sync_time';
            item.value = time.toString();
          });
        }
      });
    } catch (error) {
      console.error('Error setting last sync time:', error);
    }
  }

  /**
   * Get the last sync time
   * @returns Timestamp of the last sync
   */
  async getLastSyncTime(): Promise<number> {
    try {
      const syncMeta = this.database.collections.get('sync_meta');
      const record = await syncMeta
        .query()
        .where('key', 'last_sync_time')
        .fetch();
      
      return record.length > 0 ? parseInt(record[0].value) : 0;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return 0;
    }
  }

  /**
   * Clear all items from the sync queue
   */
  async clearSyncQueue() {
    try {
      const syncQueue = this.database.collections.get('sync_queue');
      await this.database.write(async () => {
        const allItems = await syncQueue.query().fetch();
        await Promise.all(allItems.map(item => item.destroyPermanently()));
      });
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  /**
   * Get all failed items from the sync queue
   * @returns Array of failed sync queue items
   */
  async getFailedItems() {
    try {
      const syncQueue = this.database.collections.get('sync_queue');
      return await syncQueue
        .query()
        .where('status', 'failed')
        .sortBy('timestamp', 'desc')
        .fetch();
    } catch (error) {
      console.error('Error getting failed items:', error);
      return [];
    }
  }

  /**
   * Update the status of a sync queue item
   * @param id ID of the item to update
   * @param status New status
   * @param error Optional error message
   */
  async updateItemStatus(id: string, status: 'pending' | 'processing' | 'failed', error?: string) {
    try {
      const syncQueue = this.database.collections.get('sync_queue');
      const item = await syncQueue.find(id);
      await this.database.write(async () => {
        await item.update(record => {
          record.status = status;
          if (error) record.error = error;
          if (status === 'failed') record.retryCount += 1;
        });
      });
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  }

  /**
   * Get all pending, processing, and failed items from the sync queue
   * @returns Array of sync queue items
   */
  async getPendingSyncItems() {
    try {
      const collection = this.database.get<SyncQueueItem>('sync_queue');
      const items = await collection
        .query(
          Q.where('status', Q.oneOf(['pending', 'processing', 'failed'])),
          Q.sortBy('timestamp', Q.desc)
        )
        .fetch();

      console.log("items getPendingSyncItems", items)

      return items.map(item => {
        let parsedData;
        try {
          // Safely parse the data field
          parsedData = typeof item.data === 'string' && item.data.trim() 
            ? JSON.parse(item.data) 
            : item.data;
        } catch (parseError) {
          console.warn(`Failed to parse data for item ${item.id}:`, parseError);
          parsedData = item.data; // Use the original data if parsing fails
        }

        return {
          id: item.id,
          endpoint: item.endpoint,
          method: item.method,
          title: item.title,
          data: parsedData,
          timestamp: item.timestamp,
          status: item.status,
          error: item.error,
          retryCount: item.retryCount
        };
      });
    } catch (error) {
      console.error('Error getting pending sync items:', error);
      return [];
    }
  }

  /**
   * Get the count of pending, processing, and failed items in the sync queue
   * @returns Count of pending sync items
   */
  async getPendingSyncCount() {
    try {
      const collection = this.database.get<SyncQueueItem>('sync_queue');
      const count = await collection
        .query(
          Q.where('status', Q.oneOf(['pending', 'processing', 'failed']))
        )
        .fetchCount();
      
      console.log('Storage service - pending count:', count); // Add debug log
      return count;
    } catch (error) {
      console.error('Error getting pending sync count:', error);
      return 0;
    }
  }

  /**
   * Delete a pending item from the sync queue
   * @param itemId ID of the item to delete
   */
  async deletePendingItem(itemId: string): Promise<void> {
    try {
      const syncQueue = this.database.collections.get('sync_queue');
      const item = await syncQueue.find(itemId);
      await this.database.write(async () => {
        await item.destroyPermanently();
      });
    } catch (error) {
      console.error('Error deleting pending item:', error);
      throw error;
    }
  }
}

export default StorageService;
export { SyncQueueItem, SyncMeta };
























