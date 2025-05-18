import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { storageService, syncService } from '../../services';
import NetInfo from '@react-native-community/netinfo';

interface SyncQueueItemType {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  title: string;
  endpoint: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'failed';
  error?: string;
  retryCount: number;
}

const PendingSyncPage = () => {
  const [pendingItems, setPendingItems] = useState<SyncQueueItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [autoSyncMessage, setAutoSyncMessage] = useState<string | null>(null);

  const loadPendingItems = async () => {
    setLoading(true);
    try {
      const items = await storageService.getPendingSyncItems();
      console.log("items", items)
      setPendingItems(items);
    } catch (error) {
      console.error('Error loading pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingItems();
    
    // Set up listeners for sync events
    const onSyncStart = () => {
      setSyncing(true);
    };
    
    const onSyncEnd = async (result: any) => {
      setSyncing(false);
      // Reload the pending items to update the UI
      await loadPendingItems();
      
      if (result.success) {
        // Show a brief message about successful sync
        if (result.successCount > 0) {
          setAutoSyncMessage(`Sync completed: ${result.successCount} items synced successfully`);
          setTimeout(() => setAutoSyncMessage(null), 3000);
        }
      }
    };
    
    // Listen for sync events
    syncService.on('syncStart', onSyncStart);
    syncService.on('syncEnd', onSyncEnd);
    syncService.on('queueChanged', loadPendingItems);
    
    return () => {
      // Clean up listeners when component unmounts
      syncService.removeListener('syncStart', onSyncStart);
      syncService.removeListener('syncEnd', onSyncEnd);
      syncService.removeListener('queueChanged', loadPendingItems);
    };
  }, []);

  useEffect(() => {
    const handleNetworkChange = async (state: any) => {
      if (state.isConnected) {
        // When connection is restored, show a message
        setAutoSyncMessage('Network connection restored, syncing...');
        // Wait a moment for sync to complete, then refresh the list
        setTimeout(async () => {
          await loadPendingItems();
        }, 2000);
      }
    };
    
    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncService.sync();
      // Explicitly reload pending items after manual sync
      await loadPendingItems();
    } catch (error) {
      console.error('Error syncing:', error);
      Alert.alert('Error', 'Failed to sync items');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this pending sync item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deletePendingItem(itemId);
              await loadPendingItems();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: SyncQueueItemType }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.methodBadge(item.method)}>
            {item.method}
          </Text>
          <Text style={styles.statusBadge(item.status)}>
            {item.status}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.data}>
        {typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2)}
      </Text>
      {/* {item.retryCount > 0 && (
        <Text style={styles.retryCount}>
          Retry attempts: {item.retryCount}
        </Text>
      )} */}
      {item.error && (
        <Text style={styles.errorText}>
          {item.error}
        </Text>
      )}
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );


  console.log("pendingItems", pendingItems)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Sync Items</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : pendingItems.length === 0 ? (
        <Text style={styles.emptyText}>No pending items</Text>
      ) : (
        <>
          <Text style={styles.countText}>
            {pendingItems.length} items waiting to sync
          </Text>
          <FlatList
            data={pendingItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}

      <TouchableOpacity
        style={styles.syncButton}
        onPress={handleSync}
        disabled={syncing || pendingItems.length === 0}
      >
        {syncing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.syncButtonText}>
            Sync Now ({pendingItems.length})
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodBadge: (method: string) => ({
    color: method === 'POST' ? '#4caf50' : method === 'PUT' ? '#2196f3' : '#f44336',
    fontWeight: 'bold',
    marginRight: 8,
  }),
  statusBadge: (status: string) => ({
    color: status === 'pending' ? '#4caf50 ' : status === 'processing' ? '#ff9800' : '#f44336',
    fontWeight: 'bold',
  }),
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  endpoint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  data: {
    fontSize: 14,
    color: '#666',
  },
  retryCount: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  loader: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  countText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
    color: '#666',
  },
  syncButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PendingSyncPage;






