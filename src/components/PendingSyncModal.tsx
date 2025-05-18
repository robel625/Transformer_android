import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import storageService from '../services/storageService';
import syncService from '../services/syncService';

interface PendingSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

const PendingSyncModal = ({ visible, onClose }: PendingSyncModalProps) => {
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadPendingItems = async () => {
    setLoading(true);
    const items = await storageService.getPendingSyncItems();
    setPendingItems(items);
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      loadPendingItems();
    }
  }, [visible]);

  const handleSync = async () => {
    setSyncing(true);
    await syncService.sync();
    await loadPendingItems();
    setSyncing(false);
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

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.methodBadge(item.method)}>
          {item.method}
        </Text>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
      <Text style={styles.itemTitle}>{item.title}</Text>
      {/* <Text style={styles.itemTitle}>{item.endpoint}</Text> */}
      <Text style={styles.data}>
        {JSON.stringify(item.data, null, 2)}
      </Text>
      {/* {item.retryCount > 0 && (
        <Text style={styles.retryCount}>
          Retry attempts: {item.retryCount}
        </Text>
      )} */}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Pending Sync Items</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text>✕</Text>
            </TouchableOpacity>
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  listContainer: {
    paddingBottom: 16,
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
  methodBadge: (method: string) => ({
    backgroundColor: {
      POST: '#4CAF50',
      PUT: '#2196F3',
      DELETE: '#F44336',
      PATCH: '#FF9800',
    }[method] || '#999',
    color: '#fff',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
  }),
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  data: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  retryCount: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  syncButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginBottom: 16,
    color: '#666',
  },
});

export default PendingSyncModal;



