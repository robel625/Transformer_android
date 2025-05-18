import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';
import type { Inspection } from '@/types/entity';
import { InspectionModal } from './inspection-modal.native';
import { OfflineInspectionModal } from './offline-inspection-modal.native';
import NetInfo from '@react-native-community/netinfo';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
};

export default function InspectionScreen({id}: { id: any }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [data, setData] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);

  const fetchData = async (page = pagination.current) => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize: pagination.pageSize,
        transformer_data: id,
      };
      const response = await transformerService.getInspections(params);
      setData(response.results || []);
      setPagination(prev => ({
        ...prev,
        total: response.count || 0,
      }));
    } catch (error) {
      console.error('Error fetching inspections:', error);
      showToast('Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(1);
    setRefreshing(false);
  };

  const handleDelete = async (inspectionId: number) => {
    try {
      await transformerService.deleteInspection(inspectionId);
      showToast('Inspection deleted successfully');
      fetchData();
    } catch (error) {
      showToast('Failed to delete inspection');
    }
  };

  const handleDataChange = (newData: Inspection, isEdit: boolean) => {
    if (isEdit) {
      setData(prevData => 
        prevData.map(item => 
          item.id === newData.id ? newData : item
        )
      );
    } else {
      setData(prevData => [newData, ...prevData]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected === true);
    });
    
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: Inspection }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>Inspection #{item.id}</Text>
        <Text style={styles.cardText}>Body Condition: {item.body_condition}</Text>
        <Text style={styles.cardText}>Oil Level: {item.oil_level}</Text>
        <Text style={styles.cardText}>Status: {item.status_of_mounting}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('InspectionDetail', { id: item.id })}
        >
          <Icon name="visibility" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditInspection(item)}
        >
          <Icon name="edit" size={24} color="#666" />
        </TouchableOpacity>
        {/* <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Icon name="delete" size={24} color="#f44336" />
        </TouchableOpacity> */}
      </View>
    </View>
  );

  const handleAddInspection = () => {
    if (isOnline) {
      setSelectedInspection(null);
      setModalVisible(true);
    } else {
      setOfflineModalVisible(true);
    }
  };

  const handleEditInspection = (inspection: Inspection) => {
    if (isOnline) {
      setSelectedInspection(inspection);
      setModalVisible(true);
    } else {
      showToast('Cannot edit inspections in offline mode');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inspection List</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddInspection}
        >
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>New Inspection</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No inspections found</Text>
            </View>
          )
        }
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {isOnline ? (
        <InspectionModal
          title={selectedInspection ? 'Edit Inspection' : 'Create New Inspection'}
          visible={modalVisible}
          inspection={selectedInspection}
          transformerId={id}
          onClose={() => setModalVisible(false)}
          onDataChange={handleDataChange}
        />
      ) : null}

      <OfflineInspectionModal
        visible={offlineModalVisible}
        transformerId={id}
        onClose={() => setOfflineModalVisible(false)}
        onDataChange={handleDataChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1890ff',
    padding: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 8,
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});


