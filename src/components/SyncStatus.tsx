import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { storageService, syncService } from '../services';
import transformerService from '../api/services/transformerService';
import { useNavigation } from '@react-navigation/native';

interface SyncStatusProps {
  containerStyle?: object;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ containerStyle }) => {
  const navigation = useNavigation();
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean;
    lastSync: string | null;
  }>({
    isSyncing: false,
    lastSync: null,
  });

  useEffect(() => {
    const loadPendingCount = async () => {
      const count = await storageService.getPendingSyncCount();
      setPendingSyncCount(count);
    };

    loadPendingCount();
    syncService.on('queueChanged', loadPendingCount);

    const syncCleanup = transformerService.addSyncListener((status) => {
      if (status.type === 'start') {
        setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      } else if (status.type === 'end') {
        setSyncStatus({
          isSyncing: false,
          lastSync: new Date().toLocaleTimeString(),
        });
        loadPendingCount();
      }
    });

    return () => {
      syncService.removeListener('queueChanged', loadPendingCount);
      syncCleanup();
    };
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      {pendingSyncCount > 0 && (
        <TouchableOpacity
          style={styles.pendingSyncButton}
          onPress={() => navigation.navigate('pending_sync')}
        >
          <View style={styles.pendingSyncBadge}>
            <Text style={styles.pendingSyncCount}>
              {pendingSyncCount}
            </Text>
          </View>
          <Text style={styles.pendingSyncText}>Pending</Text>
        </TouchableOpacity>
      )}
      {syncStatus.isSyncing && (
        <View style={styles.syncIndicator}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.syncText}>Syncing...</Text>
        </View>
      )}
      {/* {syncStatus.lastSync && !syncStatus.isSyncing && (
        <Text style={styles.lastSyncText}>
          Last sync: {syncStatus.lastSync}
        </Text>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  pendingSyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  pendingSyncBadge: {
    backgroundColor: '#ff9800',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  pendingSyncCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  pendingSyncText: {
    fontSize: 12,
    color: '#666',
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  syncText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  lastSyncText: {
    fontSize: 11,
    color: '#666',
    padding: 8,
  },
});

export default SyncStatus;


