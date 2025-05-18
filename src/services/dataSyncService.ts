import { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';
import { resetDatabase, recreateDatabase } from './databaseInitializer';
import apiClient from '../api/apiClient';
import NetInfo from '@react-native-community/netinfo';

/**
 * Service for synchronizing and managing offline data
 */
class DataSyncService {
  private database: Database;
  private initialized: boolean = false;
  private syncInProgress: boolean = false;
  private lastSyncTimestamp: number = 0;

  constructor(database: Database) {
    this.database = database;
  }

  /**
   * Initialize app data for offline use
   * @returns Promise<boolean> True if initialization was successful
   */
  async initializeOfflineData(): Promise<boolean> {
    if (this.syncInProgress) return false;
    
    try {
      this.syncInProgress = true;
      
      // Validate database
      if (!this.database?.collections) {
        throw new Error('Database not initialized properly');
      }
      
      // Verify collections exist
      const collections = Object.keys(this.database.collections.map);
      const requiredCollections = ['basestations', 'transformer_data'];
      
      if (!requiredCollections.every(c => collections.includes(c))) {
        throw new Error(`Missing required collections. Found: ${collections.join(', ')}`);
      }
      
      // Check network connectivity
      const networkState = await NetInfo.fetch();
      
      if (networkState.isConnected) {
        // Sync data in parallel for better performance
        await Promise.all([
          this.syncBasestations(),
          this.syncTransformerData()
        ]);
        
        // Update last sync timestamp
        this.lastSyncTimestamp = Date.now();
        
        // Store sync timestamp in database
        await this.storeSyncMetadata('lastSync', this.lastSyncTimestamp.toString());
      } else {
        console.log('No network connection, using existing offline data');
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing offline data:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Store sync metadata in the database
   */
  private async storeSyncMetadata(key: string, value: string): Promise<void> {
    try {
      await this.database.write(async () => {
        const collection = this.database.collections.get('sync_meta');
        
        // Check if record exists
        const existing = await collection.query(Q.where('key', key)).fetch();
        
        if (existing.length > 0) {
          await existing[0].update(record => {
            record.value = value;
          });
        } else {
          await collection.create(record => {
            record.key = key;
            record.value = value;
          });
        }
      });
    } catch (error) {
      console.error(`Error storing sync metadata (${key}):`, error);
    }
  }

  /**
   * Sync basestations from server to local database
   */
  async syncBasestations(): Promise<void> {
    try {
      // Get the last sync timestamp from database
      let lastUpdatedAt = null;
      try {
        const syncMeta = this.database.collections.get('sync_meta');
        const record = await syncMeta
          .query(Q.where('key', 'basestations_last_updated_at'))
          .fetch();
        
        if (record.length > 0) {
          lastUpdatedAt = record[0].value;
          console.log('Last basestation sync timestamp:', lastUpdatedAt);
        }
      } catch (error) {
        console.warn('Error getting last updated timestamp:', error);
      }

      // Prepare request params
      const params: any = { 
        page: 1,
        pageSize: 100000, 
        searchType: "BaseStation",
        updated_at: lastUpdatedAt
      };

      // Fetch basestations from server with updated_at filter if available
      const response = await apiClient.get('/api/transformer/basestationsFiltered', { params });

      console.log("params ppppppppppppppp:", params);
      console.log("Basestations response bbbbbbbbbbb:", response);
      
      const basestations = response?.results || [];
      
      if (!basestations.length) {
        console.log('No new or updated basestations found on server');
        return;
      }
      
      // Find the most recent updated_at timestamp from the response
      let mostRecentTimestamp = lastUpdatedAt;
      basestations.forEach(station => {
        if (station.updated_at && (!mostRecentTimestamp || station.updated_at > mostRecentTimestamp)) {
          mostRecentTimestamp = station.updated_at;
        }
      });
      
      // Get all existing station codes for lookup
      const collection = this.database.collections.get('basestations');
      const existingRecords = await collection.query().fetch();
      const existingStationCodes = new Map();
      
      existingRecords.forEach(record => {
        existingStationCodes.set(record.station_code, record);
      });
      
      // Process in batches
      const batchSize = 50;
      
      await this.database.write(async () => {
        // Track processed station codes to identify deleted records
        const processedStationCodes = new Set();
        
        for (let i = 0; i < basestations.length; i += batchSize) {
          const batch = basestations.slice(i, i + batchSize);
          
          // Process each station in the batch
          await Promise.all(batch.map(async station => {
            const stationCode = station.station_code;
            processedStationCodes.add(stationCode);
            
            // Check if record already exists
            if (existingStationCodes.has(stationCode)) {
              // Update existing record
              const existingRecord = existingStationCodes.get(stationCode);
              await existingRecord.update(record => {
                record.region = station.region;
                record.region_id = station.regionId || station.region_id;
                record.csc = station.csc;
                record.csc_id = station.cscId || station.csc_id;
                record.substation = station.substation;
                record.substation_id = (station.substationId || station.substation_id)?.toString();
                record.feeder = station.feeder;
                record.feeder_id = (station.feederId || station.feeder_id)?.toString();
                record.address = station.address;
                record.gps_location = station.gps_location;
                record.station_type = station.station_type;
                record.created_by = station.created_by?.email || station.created_by;
                record.updated_by = station.updated_by?.email || station.updated_by;
              });
            } else {
              // Create new record
              await collection.create(record => {
                record.station_code = stationCode;
                record.region = station.region;
                record.region_id = station.regionId || station.region_id;
                record.csc = station.csc;
                record.csc_id = station.cscId || station.csc_id;
                record.substation = station.substation;
                record.substation_id = (station.substationId || station.substation_id)?.toString();
                record.feeder = station.feeder;
                record.feeder_id = (station.feederId || station.feeder_id)?.toString();
                record.address = station.address;
                record.gps_location = station.gps_location;
                record.station_type = station.station_type;
                record.created_by = station.created_by?.email || station.created_by;
                record.updated_by = station.updated_by?.email || station.updated_by;
              });
            }
          }));
        }
        
        // Only remove records if we're doing a full sync (no lastUpdatedAt)
        if (!lastUpdatedAt) {
          // Remove records that no longer exist on the server
          const recordsToDelete = existingRecords.filter(
            record => !processedStationCodes.has(record.station_code)
          );
          
          if (recordsToDelete.length > 0) {
            await Promise.all(recordsToDelete.map(record => record.destroyPermanently()));
            console.log(`Removed ${recordsToDelete.length} obsolete basestation records`);
          }
        }
      });
      
      // Store the most recent timestamp for next sync
      if (mostRecentTimestamp && mostRecentTimestamp !== lastUpdatedAt) {
        await this.storeSyncMetadata('basestations_last_updated_at', mostRecentTimestamp);
        console.log(`Updated basestations_last_updated_at to ${mostRecentTimestamp}`);
      }
      
      console.log(`Synced ${basestations.length} basestations to local database`);
    } catch (error) {
      console.error('Error syncing basestations from server:', error);
      throw error;
    }
  }

  /**
   * Sync transformer data from server to local database
   */
  async syncTransformerData(): Promise<void> {
    try {
      // Get the last sync timestamp from database
      let lastUpdatedAt = null;
      try {
        const syncMeta = this.database.collections.get('sync_meta');
        const record = await syncMeta
          .query(Q.where('key', 'transformers_last_updated_at'))
          .fetch();
        
        if (record.length > 0) {
          lastUpdatedAt = record[0].value;
          console.log('Last transformer sync timestamp:', lastUpdatedAt);
        }
      } catch (error) {
        console.warn('Error getting last updated timestamp:', error);
      }

      // Prepare request params
      const params: any = { 
        page: 1,
        pageSize: 100000,
        searchType: "Transformer",
        updated_at: lastUpdatedAt
      };

      // Fetch transformer data from server with updated_at filter if available
      const response = await apiClient.get('/api/transformer/basestationsFiltered', { params });
    
      console.log("params ppppppppppppppp ----------------:", params);
      console.log("Transformer Response bbbbbbbbbbb ---------------:", response);
      
      const transformers = response?.results || [];
      
      if (!transformers.length) {
        console.log('No new or updated transformer data found on server');
        return;
      }
      
      // Find the most recent updated_at timestamp from the response
      let mostRecentTimestamp = lastUpdatedAt;
      transformers.forEach(transformer => {
        if (transformer.updated_at && (!mostRecentTimestamp || transformer.updated_at > mostRecentTimestamp)) {
          mostRecentTimestamp = transformer.updated_at;
        }
      });
      
      // Get all existing transformer IDs for lookup
      const collection = this.database.collections.get('transformer_data');
      const existingRecords = await collection.query().fetch();
      const existingTransformerIds = new Map();
      
      existingRecords.forEach(record => {
        existingTransformerIds.set(record.transformer_id, record);
      });
      
      // Process in batches
      const batchSize = 50;
      
      await this.database.write(async () => {
        // Track processed transformer IDs to identify deleted records
        const processedTransformerIds = new Set();
        
        for (let i = 0; i < transformers.length; i += batchSize) {
          const batch = transformers.slice(i, i + batchSize);
          
          // Process each transformer in the batch
          await Promise.all(batch.map(async transformer => {
            const transformerId = transformer.id;
            processedTransformerIds.add(transformerId);
            
            // Check if record already exists
            if (existingTransformerIds.has(transformerId)) {
              // Update existing record
              const existingRecord = existingTransformerIds.get(transformerId);
              await existingRecord.update(record => {
                record.transformer_id = transformer.id;
                record.trafo_type = transformer.trafo_type;
                record.capacity = transformer.capacity;
                record.dt_number = transformer.dt_number;
                record.primary_voltage = transformer.primary_voltage;
                record.colling_type = transformer.colling_type;
                record.manufacturer = transformer.manufacturer;
                record.vector_group = transformer.vector_group;
                record.impedance_voltage = parseFloat(transformer.impedance_voltage);
                record.winding_weight = parseFloat(transformer.winding_weight);
                record.oil_weight = parseFloat(transformer.oil_weight);
                record.year_of_manufacturing = transformer.year_of_manufacturing;
                record.date_of_installation = transformer.date_of_installation ? 
                  new Date(transformer.date_of_installation).getTime() : null;
                record.service_type = transformer.service_type;
                record.status = transformer.status;
                record.created_by = transformer.created_by?.email || transformer.created_by;
                record.updated_by = transformer.updated_by?.email || transformer.updated_by;
                record.basestation_id = transformer.basestation?.station_code;
              });
            } else {
              // Create new record
              await collection.create(record => {
                record.transformer_id = transformer.id;
                record.serial_number = transformer.serial_number;
                record.trafo_type = transformer.trafo_type;
                record.capacity = transformer.capacity;
                record.dt_number = transformer.dt_number;
                record.primary_voltage = transformer.primary_voltage;
                record.colling_type = transformer.colling_type;
                record.manufacturer = transformer.manufacturer;
                record.vector_group = transformer.vector_group;
                record.impedance_voltage = parseFloat(transformer.impedance_voltage);
                record.winding_weight = parseFloat(transformer.winding_weight);
                record.oil_weight = parseFloat(transformer.oil_weight);
                record.year_of_manufacturing = transformer.year_of_manufacturing;
                record.date_of_installation = transformer.date_of_installation ? 
                  new Date(transformer.date_of_installation).getTime() : null;
                record.service_type = transformer.service_type;
                record.status = transformer.status;
                record.created_by = transformer.created_by?.email || transformer.created_by;
                record.updated_by = transformer.updated_by?.email || transformer.updated_by;
                record.basestation_id = transformer.basestation?.station_code;
              });
            }
          }));
        }
        
        // Only remove records if we're doing a full sync (no lastUpdatedAt)
        if (!lastUpdatedAt) {
          // Remove records that no longer exist on the server
          const recordsToDelete = existingRecords.filter(
            record => !processedTransformerIds.has(record.transformer_id)
          );
          
          if (recordsToDelete.length > 0) {
            await Promise.all(recordsToDelete.map(record => record.destroyPermanently()));
            console.log(`Removed ${recordsToDelete.length} obsolete transformer records`);
          }
        }
      });
      
      // Store the most recent timestamp for next sync
      if (mostRecentTimestamp && mostRecentTimestamp !== lastUpdatedAt) {
        await this.storeSyncMetadata('transformers_last_updated_at', mostRecentTimestamp);
        console.log(`Updated transformers_last_updated_at to ${mostRecentTimestamp}`);
      }
      
      console.log(`Synced ${transformers.length} transformers to local database`);
    } catch (error) {
      console.error('Error syncing transformer data from server:', error);
      throw error;
    }
  }

  /**
   * Force a full sync with the server
   * @returns Promise<boolean> True if sync was successful
   */
  async forceSync(): Promise<boolean> {
    if (this.syncInProgress) return false;
    
    try {
      this.syncInProgress = true;
      
      // Check network connectivity
      const networkState = await NetInfo.fetch();
      
      if (!networkState.isConnected) {
        console.log('Cannot sync: No network connection');
        return false;
      }
      
      // Sync data in parallel
      await Promise.all([
        this.syncBasestations(),
        this.syncTransformerData()
      ]);
      
      // Update last sync timestamp
      this.lastSyncTimestamp = Date.now();
      await this.storeSyncMetadata('lastSync', this.lastSyncTimestamp.toString());
      
      return true;
    } catch (error) {
      console.error('Error during force sync:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get basestations from local database
   * @returns Promise with array of basestation records
   */
  async getLocalBasestations() {
    try {
      const collection = this.database.collections.get('basestations');
      return await collection.query().fetch();
    } catch (error) {
      console.error('Error fetching local basestations:', error);
      throw error;
    }
  }

  /**
   * Get transformer data from local database
   * @returns Promise with array of transformer records
   */
  async getLocalTransformerData() {
    try {
      const collection = this.database.collections.get('transformer_data');
      return await collection.query().fetch();
    } catch (error) {
      console.error('Error fetching local transformer data:', error);
      throw error;
    }
  }

  /**
   * Get transformer data for a specific basestation
   * @param stationCode The station code to filter by
   * @returns Promise with array of transformer records for the station
   */
  async getTransformerDataForBasestation(stationCode: string) {
    try {
      const collection = this.database.collections.get('transformer_data');
      return await collection
        .query(Q.where('basestation_id', stationCode))
        .fetch();
    } catch (error) {
      console.error(`Error fetching transformers for station ${stationCode}:`, error);
      throw error;
    }
  }

  /**
   * Get the timestamp of the last successful sync
   * @returns Promise with timestamp or 0 if never synced
   */
  async getLastSyncTimestamp(): Promise<number> {
    try {
      const collection = this.database.collections.get('sync_meta');
      const records = await collection.query(Q.where('key', 'lastSync')).fetch();
      
      if (records.length > 0) {
        return parseInt(records[0].value, 10);
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching last sync timestamp:', error);
      return 0;
    }
  }

  /**
   * Check if service is initialized
   * @returns boolean indicating if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if sync is in progress
   * @returns boolean indicating if sync is in progress
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }

  /**
   * Get a basestation by station code from local database
   * @param stationCode The station code to find
   * @returns Promise with the basestation record or null if not found
   */
  async getLocalBasestationByStationCode(stationCode: string) {
    try {
      const collection = this.database.collections.get('basestations');
      const records = await collection
        .query(Q.where('station_code', stationCode))
        .fetch();
      
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error(`Error fetching local basestation with code ${stationCode}:`, error);
      throw error;
    }
  }

  /**
   * Get a transformer by ID from local database
   * @param id The transformer ID to find
   * @returns Promise with the transformer record or null if not found
   */
  async getLocalTransformerById(id: string) {
    try {
      const collection = this.database.collections.get('transformer_data');
      const records = await collection
        .query(Q.where('transformer_id', id))
        .fetch();
      
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error(`Error fetching local transformer with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Filter basestations from local database based on criteria
   * @param filters Object containing filter criteria
   * @returns Promise with array of filtered basestation records
   */
  async getFilteredBasestations(filters: Record<string, any> = {}) {
    try {
      const collection = this.database.collections.get('basestations');
      let query = collection.query();
      
      // Build query conditions based on filters
      const conditions = [];
      
      if (filters.station_code) {
        conditions.push(Q.where('station_code', Q.eq(filters.station_code)));
      }
      
      if (filters.region) {
        conditions.push(Q.where('region', Q.like(`%${filters.region}%`)));
      }
      
      if (filters.csc) {
        conditions.push(Q.where('csc', Q.like(`%${filters.csc}%`)));
      }
      
      if (filters.substation) {
        conditions.push(Q.where('substation', Q.like(`%${filters.substation}%`)));
      }
      
      if (filters.feeder) {
        conditions.push(Q.where('feeder', Q.like(`%${filters.feeder}%`)));
      }
      
      if (filters.address) {
        conditions.push(Q.where('address', Q.like(`%${filters.address}%`)));
      }
      
      if (filters.station_type) {
        conditions.push(Q.where('station_type', Q.eq(filters.station_type)));
      }
      
      // Apply conditions to query
      if (conditions.length > 0) {
        query = query.extend(Q.and(...conditions));
      }
      
      // Execute query
      const results = await query.fetch();
      
      // Apply pagination if needed
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      const paginatedResults = results.slice(startIndex, endIndex);
      
      return {
        count: results.length,
        next: endIndex < results.length ? `/api/transformer/basestationsFiltered/?page=${page + 1}` : null,
        previous: page > 1 ? `/api/transformer/basestationsFiltered/?page=${page - 1}` : null,
        results: paginatedResults
      };
    } catch (error) {
      console.error('Error filtering local basestations:', error);
      throw error;
    }
  }

  /**
   * Filter transformers from local database based on criteria
   * @param filters Object containing filter criteria
   * @returns Promise with array of filtered transformer records
   */
  async getFilteredTransformers(filters: Record<string, any> = {}) {
    try {
      const collection = this.database.collections.get('transformer_data');
      let query = collection.query();
      
      // Build query conditions based on filters
      const conditions = [];
      
      // Direct transformer properties
      if (filters.id) {
        conditions.push(Q.where('id', Q.eq(filters.id)));
      }
      
      if (filters.trafo_type) {
        conditions.push(Q.where('trafo_type', Q.eq(filters.trafo_type)));
      }
      
      if (filters.capacity) {
        conditions.push(Q.where('capacity', Q.eq(filters.capacity)));
      }
      
      if (filters.primary_voltage) {
        conditions.push(Q.where('primary_voltage', Q.eq(filters.primary_voltage)));
      }
      
      if (filters.colling_type) {
        conditions.push(Q.where('colling_type', Q.eq(filters.colling_type)));
      }
      
      if (filters.manufacturer) {
        conditions.push(Q.where('manufacturer', Q.eq(filters.manufacturer)));
      }
      
      if (filters.vector_group) {
        conditions.push(Q.where('vector_group', Q.eq(filters.vector_group)));
      }
      
      if (filters.dt_number) {
        conditions.push(Q.where('dt_number', Q.like(`%${filters.dt_number}%`)));
      }
      
      if (filters.serial_number) {
        conditions.push(Q.where('serial_number', Q.like(`%${filters.serial_number}%`)));
      }
      
      if (filters.status) {
        conditions.push(Q.where('status', Q.eq(filters.status)));
      }
      
      if (filters.service_type) {
        conditions.push(Q.where('service_type', Q.eq(filters.service_type)));
      }
      
      if (filters.impedance_voltage) {
        conditions.push(Q.where('impedance_voltage', Q.eq(parseFloat(filters.impedance_voltage))));
      }
      
      if (filters.winding_weight) {
        conditions.push(Q.where('winding_weight', Q.eq(parseFloat(filters.winding_weight))));
      }
      
      if (filters.oil_weight) {
        conditions.push(Q.where('oil_weight', Q.eq(parseFloat(filters.oil_weight))));
      }
      
      if (filters.year_of_manufacturing) {
        conditions.push(Q.where('year_of_manufacturing', Q.eq(filters.year_of_manufacturing)));
      }
      
      // Apply conditions to query
      if (conditions.length > 0) {
        query = query.extend(Q.and(...conditions));
      }
      
      // Execute query
      let results = await query.fetch();

      console.log("filters:", filters);
      console.log("Transformer Response offline___________________ :", results);
      
      // Handle related basestation filters
      if (filters.station_code || filters.region || filters.csc) {
        // Get all basestations
        const basestations = await this.getLocalBasestations();
        
        // Filter basestations based on criteria
        const filteredBasestations = basestations.filter(basestation => {
          let match = true;
          
          if (filters.station_code && basestation.station_code !== filters.station_code) {
            match = false;
          }
          
          if (filters.region && !basestation.region.toLowerCase().includes(filters.region.toLowerCase())) {
            match = false;
          }
          
          if (filters.csc && !basestation.csc.toLowerCase().includes(filters.csc.toLowerCase())) {
            match = false;
          }
          
          return match;
        });
        
        // Get station codes of filtered basestations
        const filteredStationCodes = filteredBasestations.map(b => b.station_code);
        
        // Filter transformers based on basestation
        results = results.filter(transformer => 
          filteredStationCodes.includes(transformer.basestation_id)
        );
      }
      
      // Apply pagination if needed
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      const paginatedResults = results.slice(startIndex, endIndex);
      
      return {
        count: results.length,
        next: endIndex < results.length ? `/api/transformer/basestationsFiltered/?page=${page + 1}` : null,
        previous: page > 1 ? `/api/transformer/basestationsFiltered/?page=${page - 1}` : null,
        results: paginatedResults
      };
    } catch (error) {
      console.error('Error filtering local transformers:', error);
      throw error;
    }
  }

  /**
   * Get filtered data based on search type and filters
   * @param searchType Type of search (BaseStation, Transformer, etc.)
   * @param filters Object containing filter criteria
   * @returns Promise with filtered data
   */
  async getFilteredData(searchType: string, filters: Record<string, any> = {}) {
    try {
      switch (searchType) {
        case 'BaseStation':
          return await this.getFilteredBasestations(filters);
        case 'Transformer':
          return await this.getFilteredTransformers(filters);
        // Add other search types as needed
        default:
          throw new Error(`Unsupported search type: ${searchType}`);
      }
    } catch (error) {
      console.error(`Error getting filtered data for ${searchType}:`, error);
      throw error;
    }
  }
}

export default DataSyncService;


// mmmmmmm












