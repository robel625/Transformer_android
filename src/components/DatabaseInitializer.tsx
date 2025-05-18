import React, { useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { initializeDatabase, checkTablesExist, recreateDatabase } from '../services/databaseInitializer';
import { dataSyncService } from '../services';
import { useMountedState } from '../hooks/useMountedState';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DatabaseInitializerProps {
  onInitialized: () => void;
}

const DatabaseInitializer: React.FC<DatabaseInitializerProps> = ({ onInitialized }) => {
  const [state, setState] = useMountedState({
    error: null as string | null,
    initStep: 'Starting initialization',
    isLoading: true
  });
  
  const { error, initStep, isLoading } = state;
  
  const updateStep = useCallback((step: string) => {
    setState({ initStep: step });
  }, [setState]);
  
  const setError = useCallback((err: string | null) => {
    setState({ error: err, isLoading: false });
  }, [setState]);
  
  // Initialize database process
  const initialize = useCallback(async () => {
    try {
      setState({ error: null, isLoading: true });

      const value = await AsyncStorage.getItem('dataStoreOffline');

      if (!value) {
        onInitialized();
        return;
      }
      
      // Step 1: Initialize database
      updateStep('Initializing database...');
      const db = initializeDatabase();
      
      if (!db) {
        throw new Error('Failed to initialize database');
      }
      
      // Step 2: Check if tables exist
      updateStep('Checking database tables...');
      const tablesExist = await checkTablesExist();
      
      if (!tablesExist) {
        throw new Error('Database tables do not exist');
      }
      
      // Step 3: Initialize offline data
      updateStep('Initializing offline data...');
      await dataSyncService.initializeOfflineData();
      
      // Success
      updateStep('Database initialized successfully');
      onInitialized();
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }, [onInitialized, updateStep, setError, setState]);
  
  // Handle retry with database recreation
  const handleRetry = useCallback(async () => {
    try {
      setState({ error: null, isLoading: true });
      
      // Recreate database from scratch
      updateStep('Recreating database...');
      const success = await recreateDatabase();
      
      if (!success) {
        throw new Error('Failed to recreate database');
      }
      
      // Initialize offline data
      updateStep('Initializing offline data...');
      await dataSyncService.initializeOfflineData();
      
      // Success
      updateStep('Database recreated and data initialized successfully');
      onInitialized();
    } catch (err) {
      console.error('Retry error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }, [onInitialized, updateStep, setError, setState]);
  
  // Run initialization on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{initStep}</Text>
      
      {error ? (
        <>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={handleRetry} />
        </>
      ) : (
        isLoading && <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  }
});

export default React.memo(DatabaseInitializer);


