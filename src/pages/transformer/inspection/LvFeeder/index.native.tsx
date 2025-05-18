import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';
import { LvFeeder } from '#/entity';
import { LvFeederModal } from './LvFeederModal.native';
import { useNavigation } from '@react-navigation/native';

const DEFAULT_LVFEEDER_VALUE: LvFeeder = {
  id: 0,
  type_of_distribution_box: '',
  R_load_current: '',
  S_load_current: '',
  T_load_current: '',
  R_fuse_rating: '',
  S_fuse_rating: '',
  T_fuse_rating: '',
  created_at: new Date(),
  updated_at: new Date(),
};

export default function LvFeederList({ inspectionId }: { inspectionId: any }) {
  const navigation = useNavigation();
  const [data, setData] = useState<LvFeeder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLvFeeder, setSelectedLvFeeder] = useState<LvFeeder | null>(null);

  const handleDataChange = (newData: LvFeeder, isEdit: boolean) => {
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await transformerService.getLvFeeders({
        inspection_data: inspectionId,
      });
      
      if (response) {
        setData(response);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching LvFeeders:', error);
      showToast('Failed to load LvFeeders');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inspectionId) {
      fetchData();
    }
  }, [inspectionId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await transformerService.deleteLvFeeder(id);
      setData(prevData => prevData.filter(item => item.id !== id));
      showToast('LvFeeder deleted successfully');
    } catch (error) {
      console.error('Error deleting LvFeeder:', error);
      showToast('Failed to delete LvFeeder');
    }
  };

  const renderItem = ({ item }: { item: LvFeeder }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Distribution Box: </Text>
        <Text style={styles.value}>{item.type_of_distribution_box || 'N/A'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>R Load Current: </Text>
        <Text style={styles.value}>{item.R_load_current || 'N/A'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>S Load Current: </Text>
        <Text style={styles.value}>{item.S_load_current || 'N/A'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>T Load Current: </Text>
        <Text style={styles.value}>{item.T_load_current || 'N/A'}</Text>
      </View>
    </View>



      <View style={styles.actionButtons}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('LvFeederDetail', { id: item.id })}
          style={styles.actionButton}
        >
          <Icon name="visibility" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            setSelectedLvFeeder(item);
            setModalVisible(true);
          }}
          style={styles.actionButton}
        >
          <Icon name="edit" size={24} color="#666" />
        </TouchableOpacity>

        {/* <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          style={styles.actionButton}
        >
          <Icon name="delete" size={24} color="#f44336" />
        </TouchableOpacity> */}
      </View>
    </View>
  );

  const ListHeader = () => (
    <TouchableOpacity 
      style={styles.addButton}
      onPress={() => {
        setSelectedLvFeeder(null);
        setModalVisible(true);
      }}
    >
      <Icon name="add" size={24} color="#fff" />
      <Text style={styles.addButtonText}>Add New LvFeeder</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1890ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No LvFeeders found</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={['#1890ff']}
            />
          }
          contentContainerStyle={[
            styles.listContainer,
            data.length === 0 && styles.emptyListContainer
          ]}
        />
      )}

      <LvFeederModal
        show={modalVisible}
        onClose={() => setModalVisible(false)}
        formValue={selectedLvFeeder || DEFAULT_LVFEEDER_VALUE}
        inspectionId={inspectionId}
        onDataChange={handleDataChange}
        title={selectedLvFeeder ? 'Edit LvFeeder' : 'Create New LvFeeder'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1890ff',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

