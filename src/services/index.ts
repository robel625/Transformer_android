import DataSyncService from './dataSyncService';
import StorageService from './storageService';
import SyncService, { setStorageService } from './syncService';
import { initializeDatabase } from './databaseInitializer';

// Get database instance
const database = initializeDatabase();

// Create service instances
const storageServiceInstance = new StorageService(database);
const syncServiceInstance = SyncService.getInstance();
const dataSyncServiceInstance = new DataSyncService(database);

// Set storage service in sync service to avoid circular dependency
setStorageService(storageServiceInstance);

// Export instances
export const dataSyncService = dataSyncServiceInstance;
export const storageService = storageServiceInstance;
export const syncService = syncServiceInstance;

// Export classes
export { default as DataSyncService } from './dataSyncService';
export { default as StorageService } from './storageService';
export { default as SyncService } from './syncService';








