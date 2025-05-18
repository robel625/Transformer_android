import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MyPressable from './components/MyPressable';
// import { debounce } from 'lodash';
// import moment from 'moment';

// Update these paths based on your project structure
import transformerService from './api/services/transformerService';
// import orgService from './api/services/orgService';
import { showToast } from './util/action';

// Types
interface Basestation {
  station_code: string;
  region: string;
  csc: string;
  substation: string;
  feeder: string;
  address: string;
  gps_location: string;
  created_at: Date;
  updated_at: Date;
}

interface FilterState {
  region: string;
  csc: string;
  substation: string;
  feeder: string;
  station_type: string;
  dateCreated: null;
  dateUpdated: null;
}

const DEFAULT_FILTERS = {
  region: '',
  csc: '',
  substation: '',
  feeder: '',
  station_type: '',
};

const BasestationItem: React.FC<{
  item: Basestation;
  onEdit: (item: Basestation) => void;
  onDelete: (code: string) => void;
  onView: (code: string) => void;
}> = ({ item, onEdit, onDelete, onView }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemContent}>
      <Text style={styles.stationCode}>{item.station_code}</Text>
      <Text style={styles.itemText}>Region: {item.region}</Text>
      <Text style={styles.itemText}>CSC: {item.csc}</Text>
      <Text style={styles.itemText}>Substation: {item.substation}</Text>
      <Text style={styles.itemText}>Feeder: {item.feeder}</Text>
      <Text style={styles.itemText}>Address: {item.address}</Text>
      <Text style={styles.itemText}>GPS: {item.gps_location}</Text>
    </View>
    <View style={styles.actionButtons}>
      <MyPressable
        style={styles.actionButton}
        onPress={() => onView(item.station_code)}
      >
        <Icon name="visibility" size={24} color="#007AFF" />
      </MyPressable>
      <MyPressable
        style={styles.actionButton}
        onPress={() => onEdit(item)}
      >
        <Icon name="edit" size={24} color="#007AFF" />
      </MyPressable>
      <MyPressable
        style={styles.actionButton}
        onPress={() => {
          Alert.alert(
            'Delete Basestation',
            'Are you sure you want to delete this basestation?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => onDelete(item.station_code), style: 'destructive' },
            ]
          );
        }}
      >
        <Icon name="delete" size={24} color="#FF3B30" />
      </MyPressable>
    </View>
  </View>
);

const FilterModal: React.FC<{
  visible: boolean;
  filters: FilterState;
  regions: any[];
  selectedCSCs: any[];
  selectedSubstations: any[];
  selectedFeeders: any[];
  onRegionChange: (value: string) => void;
  onCSCChange: (value: string) => void;
  onSubstationChange: (value: string) => void;
  onFeederChange: (value: string) => void;
  onStationTypeChange: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
}> = ({
  visible,
  filters,
  regions,
  selectedCSCs,
  selectedSubstations,
  selectedFeeders,
  onRegionChange,
  onCSCChange,
  onSubstationChange,
  onFeederChange,
  onStationTypeChange,
  onReset,
  onApply,
  onClose,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <ScrollView>
          {/* Add your filter components here */}
          {/* This is a simplified version. You'll need to implement proper dropdown/picker components */}
        </ScrollView>
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onReset}>
            <Text>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={onApply}>
            <Text>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const Basestation: React.FC = () => {
  const navigation = useNavigation<any>();
  const inset = useSafeAreaInsets();

  const [data, setData] = useState<Basestation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedCSCs, setSelectedCSCs] = useState<any[]>([]);
  const [selectedSubstations, setSelectedSubstations] = useState<any[]>([]);
  const [selectedFeeders, setSelectedFeeders] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await transformerService.getBasestations({
        page: 1,
        pageSize: 50, // Adjust as needed
      });

      if (response.results) {
        setData(response.results);
      }
    } catch (error) {
      console.error("Error fetching basestations:", error);
      showToast('Failed to load basestations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (station_code: string) => {
    try {
      await transformerService.deleteBasestation(station_code);
      showToast('Basestation deleted successfully!');
      fetchData();
    } catch (error) {
      showToast('Failed to delete basestation');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MyPressable
          style={styles.menuButton}
          onPress={() => navigation.toggleDrawer()}
        >
          <Icon name="menu" size={24} color="black" />
        </MyPressable>
        <Text style={styles.headerTitle}>Basestations</Text>
        <MyPressable
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="filter-list" size={24} color="black" />
        </MyPressable>
      </View>

      <FlatList
        data={data}
        renderItem={({ item }) => (
          <BasestationItem
            item={item}
            onEdit={(item) => {
              // Handle edit
            }}
            onDelete={handleDelete}
            onView={(code) => {
              navigation.navigate('BasestationDetail', { code });
            }}
          />
        )}
        keyExtractor={item => item.station_code}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchData}
      />

      <FilterModal
        visible={showFilters}
        filters={filters}
        regions={regions}
        selectedCSCs={selectedCSCs}
        selectedSubstations={selectedSubstations}
        selectedFeeders={selectedFeeders}
        onRegionChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
        onCSCChange={(value) => setFilters(prev => ({ ...prev, csc: value }))}
        onSubstationChange={(value) => setFilters(prev => ({ ...prev, substation: value }))}
        onFeederChange={(value) => setFilters(prev => ({ ...prev, feeder: value }))}
        onStationTypeChange={(value) => setFilters(prev => ({ ...prev, station_type: value }))}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        onApply={() => {
          // Handle apply filters
          setShowFilters(false);
        }}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  itemContent: {
    marginBottom: 8,
  },
  stationCode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    padding: 8,
    marginLeft: 16,
  },
});

export default Basestation;




