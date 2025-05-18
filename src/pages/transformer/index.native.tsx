import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';
import type { TransformerData } from '@/types/entity';
import { TransformerModal } from './transformer-modal.native';
import FilterForm from './FilterForm.native';
import OfflineIndicator from '@/components/OfflineIndicator';
import NetInfo from '@react-native-community/netinfo';
import { OfflineTransformerModal } from './offlineTransformer';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 50,
};

const DEFAULT_FILTERS = {
  id: '',
  station_code: '',
  region: '',
  csc: '',
  substation: '',
  feeder: '',
  transformer_type: '',
  year_of_manufacturing: '',
  serial_number: '',
  manufacturer: '',
  vector_group: '',
  impedance_voltage: '',
  winding_weight: '',
  oil_weight: '',
  date_of_installation: '',
  inspection_date_range: [null, null],
  inspection_status: '',
  service_type: '',
  status: '',
  dt_number: '',
};

export default function TransformerScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<TransformerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TransformerData | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);

  // Add useEffect to check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected === true);
    });
    
    // Check initial state
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected === true);
    });
    
    return () => unsubscribe();
  }, []);

  const fetchData = useCallback(async (page = pagination.current) => {
    if (loading) return; // Prevent multiple simultaneous fetches
    setLoading(true);
    try {
      // let response;
      // const hasActiveFilters = Object.values(filters).some(value => value !== '');
      
      // if (!hasActiveFilters) {
      //   response = await transformerService.getTransformer({
      //     page,
      //     pageSize: pagination.pageSize,
      //   });
      // } else {
      //   const activeFilters = Object.fromEntries(
      //     Object.entries(filters).filter(([_, value]) => value !== '')
      //   );

      //   response = await transformerService.getBasestationsFiltered({
      //     page,
      //     pageSize: pagination.pageSize,
      //     searchType: "Transformer",
      //     ...activeFilters,
      //   });
      // }

      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await transformerService.getBasestationsFiltered({
        page,
        pageSize: pagination.pageSize,
        searchType: "Transformer",
        ...activeFilters,
      });

      console.log("API Response: OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO", response);

      if (response?.results) {
        setData(prevData => 
          page === 1 ? response.results : [...prevData, ...response.results]
        );
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.count || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching transformers:", error);
      showToast('Failed to load transformers');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, filters, loading]);

  const renderItem = ({ item }: { item: TransformerData }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('TransformerDetail', { id: item?.id })}
    >
      <View style={styles.itemContent}>
        <Text style={styles.dtNumber}>{item.id || 'N/A'}</Text>
        <Text style={styles.itemText}>Station: {
          typeof item.basestation === 'object' 
            ? item.basestation?.station_code 
            : item.basestation ? item.basestation : item.basestation_id || 'N/A'
        }</Text>

        <Text style={styles.itemText}>Type: {item.trafo_type || 'N/A'}</Text>
        <Text style={styles.itemText}>Capacity: {item.capacity || 'N/A'} kVA</Text>
        {/* Convert basestation object to string if it's an object */}
        
        {/* <Text style={styles.itemText}>Manufacturer: {item.manufacturer || 'N/A'}</Text> */}
        <Text style={styles.itemText}>DT Number: {item.dt_number || 'N/A'}</Text>
        {/* <Text style={styles.itemText}>Year of Manufacturing: {item.year_of_manufacturing || 'N/A'}</Text> */}
        <Text style={styles.itemText}>Serial Number: {item.serial_number || 'N/A'}</Text>
        {/* <Text style={styles.itemText}>Status: {item.status || 'N/A'}</Text> */}
        <Text style={styles.itemText}>Primary Voltage: {item.primary_voltage || 'N/A'} kV</Text>
        {/* <Text style={styles.itemText}>Cooling Type: {item.colling_type || 'N/A'}</Text> */}
        {/* <Text style={styles.itemText}>Vector Group: {item.vector_group || 'N/A'}</Text> */}
        {/* <Text style={styles.itemText}>Service Type: {item.service_type || 'N/A'}</Text> */}
        {/* <Text style={styles.itemText}>Impedance Voltage: {item.impedance_voltage || 'N/A'}</Text> */}
        {/* <Text style={styles.itemText}>Winding Weight: {item.winding_weight || 'N/A'}</Text>
        <Text style={styles.itemText}>Installation Date: {
          item.date_of_installation 
            ? new Date(item.date_of_installation).toLocaleDateString() 
            : 'N/A'
        }</Text>
        <Text style={styles.itemText}>Oil Weight: {item.oil_weight || 'N/A'}</Text>
        <Text style={styles.itemText}>Created by: {item.created_by?.email || 'N/A'}</Text>
        <Text style={styles.itemText}>Updated by: {item.updated_by?.email || 'N/A'}</Text> */}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TransformerDetail', { id: item.id })}
        >
          <Icon name="visibility" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedItem(item);
            setShowModal(true);
          }}
        >
          <Icon name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Icon name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );



  const handleDelete = useCallback((id: number) => {
    Alert.alert(
      'Delete TransformerData',
      'Are you sure you want to delete this transformer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await transformerService.deleteTransformer(id);
              showToast('TransformerData deleted successfully');
              fetchData();
            } catch (error) {
              showToast('Failed to delete transformer');
            }
          },
        },
      ],
    );
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData(1);
  }, [fetchData]);

  const handleAddTransformer = () => {
    setSelectedItem(null);
    if (isOnline) {
      setShowModal(true);
    } else {
      setOfflineModalVisible(true);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [filters]); // Only re-fetch when filters change

  const handleLoadMore = useCallback(() => {
    const hasMoreData = data.length < (pagination.total || 0);
    const nextPage = pagination.current + 1;
    
    if (!loading && hasMoreData) {
      fetchData(nextPage);
    }
  }, [data.length, pagination.current, pagination.total, loading, fetchData]);

  return (
    <SafeAreaView style={styles.container}>
      <OfflineIndicator />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.toggleDrawer()}
        >
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transformers</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Icon 
            name="filter-list" 
            size={20} 
            color={showFilters ? '#007AFF' : '#000'} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddTransformer}
        >
          <Icon name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item?.id?.toString() || ''}
        refreshControl={
          <RefreshControl
            refreshing={loading && pagination.current === 1}
            onRefresh={() => fetchData(1)}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loading && pagination.current > 1 ? (
            <ActivityIndicator style={styles.loader} color="#007AFF" />
          ) : null
        )}
      />

      {/* <TransformerModal
              title={selectedItem ? 'Edit Transformer' : 'New Transformer'}
              show={showModal}
              formValue={selectedItem || {}}
              onOk={() => {
                setShowModal(false);
                handleRefresh();
              }}
              onCancel={() => {
                setShowModal(false);
                setSelectedItem(null);
              }}
              onDataChange={(newData: TransformerData, isEdit: boolean) => {
                setData(prevData => 
                  isEdit 
                  ? prevData.map(item => item.id === newData.id ? newData : item)
                  : [newData, ...prevData]
                );
                handleRefresh();
              }}
            /> */}

          {/* Conditional rendering of the transformer modals based on network status */}
      {(isOnline || selectedItem) ? (
        <TransformerModal
          title={selectedItem ? 'Edit Transformer' : 'New Transformer'}
          show={showModal}
          formValue={selectedItem || {}}
          onOk={() => {
            setShowModal(false);
            handleRefresh();
          }}
          onCancel={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
          onDataChange={(newData: TransformerData, isEdit: boolean) => {
            setData(prevData => 
              isEdit 
              ? prevData.map(item => item.id === newData.id ? newData : item)
              : [newData, ...prevData]
            );
            handleRefresh();
          }}
        />
      ) : (
        <OfflineTransformerModal
          visible={offlineModalVisible}
          transformerId={selectedItem?.id?.toString() || ""}
          onClose={() => setOfflineModalVisible(false)}
          onDataChange={(newData: TransformerData, isEdit: boolean) => {
            setData(prevData => 
              isEdit 
              ? prevData.map(item => item.id === newData.id ? newData : item)
              : [newData, ...prevData]
            );
            handleRefresh();
          }}
        />
      )}

      <FilterForm
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={(field, value) => 
          setFilters(prev => ({ ...prev, [field]: value }))
        }
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          handleRefresh();
        }}
        onApply={() => {
          setShowFilters(false);
          handleRefresh();
        }}
      />
    </SafeAreaView>
  );
}

// Add proper TypeScript interfaces
interface TransformerData {
  id: number;
  trafo_type?: string;
  capacity?: number;
  basestation?: {
    station_code: string;
  } | string;
  manufacturer?: string;
  dt_number?: string;
  year_of_manufacturing?: string;
  serial_number?: string;
  status?: string;
  primary_voltage?: number;
  colling_type?: string;
  vector_group?: string;
  service_type?: string;
  impedance_voltage?: string;
  winding_weight?: string;
  date_of_installation?: string;
  oil_weight?: string;
  created_by?: {
    email: string;
  };
  updated_by?: {
    email: string;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
  },
  itemContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemContent: {
    padding: 16,
  },
  dtNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  loader: {
    padding: 16,
  },
});











