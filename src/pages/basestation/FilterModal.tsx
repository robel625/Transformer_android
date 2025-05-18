import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useOrgStore } from '@/store/useOrgStore';
import { showToast } from '@/util/action';
import { STATION_TYPES } from '@/types/entity';
import { TextInput } from 'react-native-paper';

interface FilterState {
  station_code: string;
  region: string;
  csc: string;
  substation: string;
  feeder: string;
  station_type: string;
}

interface FilterModalProps {
  visible: boolean;
  filters: FilterState;
  onRegionChange: (value: string) => void;
  onCSCChange: (value: string) => void;
  onSubstationChange: (value: string) => void;
  onFeederChange: (value: string) => void;
  onStationTypeChange: (value: string) => void;
  onStationCodeChange: (field: keyof FilterState, value: string) => void;
  onReset: () => void;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onRegionChange,
  onCSCChange,
  onSubstationChange,
  onFeederChange,
  onStationTypeChange,
  onStationCodeChange,
  onReset,
  onApply,
  onClose,
}) => {
  const { 
    regions, 
    selectedCSCs, 
    selectedSubstations, 
    selectedFeeders,
    setSelectedCSCs,
    setSelectedSubstations,
    setSelectedFeeders,
    fetchRegions 
  } = useOrgStore();

  console.log("1111111111111111111111111111111111111", regions)

  useEffect(() => {
    fetchRegions().catch(error => {
      // Don't show error toast if we're using persisted data
      if (!regions.length) {
        showToast('No data available - please connect to internet');
      }
    });
  }, []);

  const handleApplyFilters = () => {
    // Remove empty string values before applying filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    
    onApply(activeFilters);
    onClose();
  };

  const handleReset = () => {
    // Clear all filter values
    onRegionChange('');
    onCSCChange('');
    onSubstationChange('');
    onFeederChange('');
    onStationTypeChange('');
    
    // Clear dependent selections
    setSelectedCSCs([]);
    setSelectedSubstations([]);
    setSelectedFeeders([]);
    
    // Call the parent's onReset
    onReset();
  };

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
            <Text style={styles.headerText}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>

          <View style={styles.filterSection}>
            <Text style={styles.label}>Station Code</Text>
            <TextInput
              value={filters.station_code}
              onChangeText={(text) => onStationCodeChange('station_code', text)}
              style={[styles.input, { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 10 }]}
              placeholder="Enter Station Code"
              placeholderTextColor="#666"
            />
          </View>

            <View style={styles.filterSection}>
              <Text style={styles.label}>Region</Text>
              <Picker
                selectedValue={filters.region}
                onValueChange={onRegionChange}
                enabled={true}
                style={styles.picker}
              >
                <Picker.Item label="Select Region" value="" />
                {regions.map(region => (
                  <Picker.Item
                    key={region.csc_code}
                    label={region.name}
                    value={region.csc_code}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.label}>CSC</Text>
              <Picker
                selectedValue={filters.csc}
                onValueChange={onCSCChange}
                enabled={!!filters.region}
                style={styles.picker}
              >
                <Picker.Item label="Select CSC" value="" />
                {selectedCSCs.map(csc => (
                  <Picker.Item
                    key={csc.csc_code}
                    label={csc.name}
                    value={csc.name}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.label}>Substation</Text>
              <Picker
                selectedValue={filters.substation}
                onValueChange={onSubstationChange}
                enabled={!!filters.region}
                style={styles.picker}
              >
                <Picker.Item label="Select Substation" value="" />
                {selectedSubstations.map(sub => (
                  <Picker.Item
                    key={sub.id}
                    label={sub.name}
                    value={sub.name}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.label}>Feeder</Text>
              <Picker
                selectedValue={filters.feeder}
                onValueChange={onFeederChange}
                enabled={!!filters.substation}
                style={styles.picker}
              >
                <Picker.Item label="Select Feeder" value="" />
                {selectedFeeders.map(feeder => (
                  <Picker.Item
                    key={feeder.id}
                    label={feeder.feeder_name}
                    value={feeder.feeder_name}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.label}>Station Type</Text>
              <Picker
                selectedValue={filters.station_type}
                onValueChange={onStationTypeChange}
                enabled={true}
                style={styles.picker}
              >
                <Picker.Item label="Select Station Type" value="" />
                {STATION_TYPES?.map(type => (
                  <Picker.Item
                    key={type}
                    label={type}
                    value={type}
                  />
                ))}
              </Picker>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApplyFilters}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    padding: 5,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  picker: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#F5F5F5',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
  },
  input: {
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
});

export default FilterModal;









