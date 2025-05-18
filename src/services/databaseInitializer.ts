import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Basestation from '../models/Basestation';
import TransformerData from '../models/TransformerData';
import SyncQueueItem from '../models/SyncQueueItem';
import SyncMeta from '../models/SyncMeta';
// Import schema from centralized location instead of duplicating
import schema from '../models/schema';

// Required tables for validation
const REQUIRED_TABLES = ['basestations', 'transformer_data', 'sync_queue', 'sync_meta'];

// Model classes for database initialization
const MODEL_CLASSES = [Basestation, TransformerData, SyncQueueItem, SyncMeta];

// Database singleton instance
let databaseInstance: Database | null = null;

/**
 * Gets or creates the database instance
 * @returns Database instance
 * @throws Error if initialization fails
 */
export function initializeDatabase(): Database {
  if (databaseInstance) return databaseInstance;
  
  try {
    // Create adapter with optimized settings
    const adapter = new SQLiteAdapter({
      schema, // Use imported schema
      dbName: 'transformerApp',
      jsi: true, // Use JSI for better performance
      synchronous: true, // Synchronous for reliability
      experimentalUseUtf8: true,
      onSetUpError: error => {
        console.error('[DB] Setup error:', error);
        throw error;
      }
    });

    // Create database with adapter and models
    databaseInstance = new Database({
      adapter,
      modelClasses: MODEL_CLASSES
    });
    
    return databaseInstance;
  } catch (error) {
    console.error('[DB] Initialization failed:', error);
    throw error;
  }
}

// Function to reset the database if needed
export async function resetDatabase() {
  console.log('Attempting to reset database...');
  
  if (!databaseInstance) {
    console.error('Cannot reset database: not initialized');
    return false;
  }
  
  await databaseInstance.write(async () => {
    await databaseInstance!.unsafeResetDatabase();
  });
  console.log('Database reset successfully');
  
  // Verify tables after reset
  await verifyDatabaseSetup();
  
  return true;
}

// Function to verify database setup
async function verifyDatabaseSetup() {
  if (!databaseInstance) return;
  
  // List all collections
  const collections = databaseInstance.collections.map;
  console.log('Available collections:', Object.keys(collections));
  
  // Check basestations table
  const basestations = await databaseInstance.collections.get('basestations').query().fetch();
  console.log('Basestations table exists 11, count:', basestations.length);
  
  // Check transformer_data table
  const transformers = await databaseInstance.collections.get('transformer_data').query().fetch();
  console.log('Transformer_data table exists 11, count:', transformers.length);
}

// Function to check if tables exist
export async function checkTablesExist() {
  if (!databaseInstance) {
    console.error('Cannot check tables: database not initialized');
    return false;
  }
  
  console.log('Checking if tables exist...');
  
  // try {
    // List all collections
    const collections = databaseInstance.collections.map;
    console.log('Available collections:', Object.keys(collections));
    
    // Force schema setup with a write operation
    await databaseInstance.write(async () => {
      // This is a no-op write that ensures schema is applied
      console.log('Performing write operation to ensure schema is applied');
    });
    
    // Verify tables by attempting to query them
    console.log('Verifying basestations table...');
    const basestationsCollection = databaseInstance.collections.get('basestations');
    const basestations = await basestationsCollection.query().fetch();
    console.log('Basestations table exists, count:', basestations.length);
    
    console.log('Verifying transformer_data table...');
    const transformerCollection = databaseInstance.collections.get('transformer_data');
    const transformers = await transformerCollection.query().fetch();
    console.log('Transformer_data table exists 22, count:', transformers.length);
    
    console.log('Verifying sync_queue table...');
    const syncQueueCollection = databaseInstance.collections.get('sync_queue');
    const syncQueue = await syncQueueCollection.query().fetch();
    console.log('Sync_queue table exists, count:', syncQueue.length);
    
    console.log('Verifying sync_meta table...');
    const syncMetaCollection = databaseInstance.collections.get('sync_meta');
    const syncMeta = await syncMetaCollection.query().fetch();
    console.log('Sync_meta table exists, count:', syncMeta.length);
    
    return true;
  // } catch (error) {
  //   // Only catch errors to log them, but don't hide them
  //   console.error('Error checking tables:', error);
  //   console.error('Table check failed with error:', error.message);
  //   return false;
  // }
}

// Function to completely recreate the database
export async function recreateDatabase() {
  console.log('Recreating database from scratch...');
  
  // Clear the existing instance
  databaseInstance = null;
  
  // Reinitialize
  databaseInstance = initializeDatabase();
  
  if (!databaseInstance) {
    console.error('Failed to reinitialize database');
    return false;
  }
  
  // try {
    // Force schema setup with a reset
    console.log('Resetting database to ensure schema is applied...');
    await databaseInstance.write(async () => {
      await databaseInstance!.unsafeResetDatabase();
    });
    
    // Verify tables exist after reset
    console.log('Verifying tables after reset...');
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.error('Tables still do not exist after reset');
      return false;
    }
    
    console.log('Database recreated successfully');
    return true;
  // } catch (error) {
  //   console.error('Error recreating database:', error);
  //   return false;
  // }
}





// aaaaaaaaa
