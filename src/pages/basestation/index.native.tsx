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
import syncService from '@/services/syncService';
import storageService from '@/services/storageService';
import { showToast } from '@/util/action';
import type { Basestation } from '@/types/entity';
import { BasestationModal } from './basestation-modal.native';
import FilterForm from './FilterForm';
import { useOrgStore } from '@/store/useOrgStore';
import PendingSyncModal from '../../components/PendingSyncModal';
import OfflineIndicator from '@/components/OfflineIndicator';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 30,
};

const DEFAULT_FILTERS = {
  region: '',
  csc: '',
  substation: '',
  feeder: '',
  station_type: '',
};

const forceRefresh = async () => {
  useOrgStore.getState().reset(); // Reset the store
  await useOrgStore.getState().fetchRegions(); // Fetch fresh data
};

export default function BasestationScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Basestation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Basestation | null>(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    csc: '',
    substation: '',
    feeder: '',
  });
  // const [syncStatus, setSyncStatus] = useState<{
  //   isSyncing: boolean;
  //   lastSync: string | null;
  // }>({
  //   isSyncing: false,
  //   lastSync: null,
  // });
  // const [showPendingSync, setShowPendingSync] = useState(false);
  // const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const fetchData = useCallback(async (page = pagination.current) => {
    setLoading(true);
    try {
      // let response;
      // Check if any filter has a non-empty value
      // const hasActiveFilters = Object.values(filters).some(value => value !== '');

      // if (!hasActiveFilters) {
      //   response = await transformerService.getBasestations({
      //     page,
      //     pageSize: pagination.pageSize,
      //   });
      // } else {
      //   // Remove empty string values from filters
      //   const activeFilters = Object.fromEntries(
      //     Object.entries(filters).filter(([_, value]) => value !== '')
      //   );

      //   response = await transformerService.getBasestationsFiltered({
      //     page,
      //     pageSize: pagination.pageSize,
      //     searchType: "BaseStation",
      //     ...activeFilters,

      //   });
      // }

      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await transformerService.getBasestationsFiltered({
        page,
        pageSize: pagination.pageSize,
        searchType: "BaseStation",
        ...activeFilters,

      });

      console.log("API Response: OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO", response);

      if (response?.results) {
        setData(prev => page === 1 ? response.results : [...prev, ...response.results]);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.count || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching basestations:", error);
      showToast('Failed to load basestations');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (station_code: string) => {
    try {
      await transformerService.deleteBasestation(station_code);
      showToast('Basestation deleted successfully!');
      fetchData(1);
    } catch (error) {
      showToast('Failed to delete basestation');
    }
  };

  const handleLoadMore = () => {
    if (!loading && data.length < (pagination.total || 0)) {
      fetchData(pagination.current + 1);
    }
  };

  const renderItem = ({ item }: { item: Basestation }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('BasestationDetail', { station_code: item.station_code })}
    >
      <View style={styles.itemContent}>
        <Text style={styles.stationCode}>{item.station_code}</Text>
        <Text style={styles.itemText}>Region: {item.region}</Text>
        <Text style={styles.itemText}>CSC: {item.csc}</Text>
        <Text style={styles.itemText}>Substation: {item.substation}</Text>
        <Text style={styles.itemText}>Feeder: {item.feeder}</Text>
        <Text style={styles.itemText}>Address: {item.address}</Text>
        {/* <Text style={styles.itemText}>GPS location: {item.gps_location}</Text>
        <Text style={styles.itemText}>Station Type: {item.station_type || 'Not specified'}</Text> */}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('BasestationDetail', { station_code: item.station_code })}
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
          <Icon name="edit" size={24} color="#666" />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Delete Basestation',
              'Are you sure you want to delete this basestation?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await handleDelete(item.station_code);
                  },
                },
              ],
              { cancelable: true }
            );
          }}
        >
          <Icon name="delete" size={24} color="#ff4444" />
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );

  // useEffect(() => {
  //   const cleanup = transformerService.addSyncListener((status) => {
  //     if (status.type === 'start') {
  //       setSyncStatus(prev => ({ ...prev, isSyncing: true }));
  //     } else if (status.type === 'end') {
  //       setSyncStatus({
  //         isSyncing: false,
  //         lastSync: new Date().toLocaleTimeString(),
  //       });

  //       if (status.success) {
  //         showToast('Data synchronized successfully');
  //         fetchData(1); // Refresh data after successful sync
  //       } else if (status.offline) {
  //         showToast('Changes will be synchronized when online');
  //       }
  //     }
  //   });

  //   return cleanup;
  // }, []);

  // useEffect(() => {
  //   const loadPendingCount = async () => {
  //     const count = await storageService.getPendingSyncCount();
  //     console.log('Pending sync count:', count);
  //     setPendingSyncCount(count);
  //   };

  //   loadPendingCount();

  //   // Fix the event listener handling
  //   syncService.on('queueChanged', loadPendingCount);

  //   // Listen for sync status changes
  //   const syncCleanup = transformerService.addSyncListener((status) => {
  //     if (status.type === 'end') {
  //       loadPendingCount();
  //     }
  //   });

  //   return () => {
  //     // Properly remove event listeners
  //     syncService.removeListener('queueChanged', loadPendingCount);
  //     syncCleanup();
  //   };
  // }, []);

  const handleRefresh = useCallback(() => {
    fetchData(1);
  }, [fetchData]);

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
        <Text style={styles.headerTitle}>Basestations</Text>
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
          onPress={() => {
            setSelectedItem(null);
            setShowModal(true);
          }}
        >
          <Icon name="add" size={24} color="#000" />
        </TouchableOpacity>
        {/* <View>
          {pendingSyncCount > 0 && (
            <TouchableOpacity
              style={styles.pendingSyncButton}
              onPress={() => setShowPendingSync(true)}
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
          {syncStatus.lastSync && !syncStatus.isSyncing && (
            <Text style={styles.lastSyncText}>
              Last sync: {syncStatus.lastSync}
            </Text>
          )}
        </View> */}
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.station_code}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading && pagination.current === 1}
            onRefresh={() => fetchData(1)}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && pagination.current > 1 ? (
            <ActivityIndicator style={styles.loader} />
          ) : null
        }
      />

      <BasestationModal
        title={selectedItem ? 'Edit Basestation' : 'Create New Basestation'}
        show={showModal}
        formValue={selectedItem as Basestation}
        onOk={() => {
          setShowModal(false);
          fetchData(1);
        }}
        onCancel={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        onDataChange={(newData: Basestation, isEdit: boolean) => {
          setData(prevData =>
            isEdit
              ? prevData.map(item => item.station_code === newData.station_code ? newData : item)
              : [newData, ...prevData]
          );
        }}
      />

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

      {/* <PendingSyncModal
        visible={showPendingSync}
        onClose={() => setShowPendingSync(false)}
      /> */}
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  itemContent: {
    flex: 1,
  },
  stationCode: {
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
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
  },
  loader: {
    padding: 16,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  syncText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  pendingSyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
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
  },
  pendingSyncText: {
    fontSize: 12,
    color: '#666',
  },
});


























