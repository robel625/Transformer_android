import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Text, HelperText, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useOrgStore } from '@/store/useOrgStore';
import { showToast } from '@/util/action';
import { STATION_TYPES } from '@/types/entity';


interface FilterState {
  station_code: string;
  region: string;
  csc: string;
  substation: string;
  feeder: string;
  station_type: string;
}

interface FilterFormProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (field: string, value: any) => void;
  onReset: () => void;
  onApply: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({
  visible,
  onClose,
  filters,
  onFilterChange,
  onReset,
  onApply,
}) => {
  const { regions, fetchRegions } = useOrgStore();
  const [selectedCSCs, setSelectedCSCs] = useState<any[]>([]);
  const [selectedSubstations, setSelectedSubstations] = useState<any[]>([]);
  const [selectedFeeders, setSelectedFeeders] = useState<any[]>([]);

  useEffect(() => {
    fetchRegions().catch(error => {
      if (!regions.length) {
        showToast('No data available - please connect to internet');
      }
    });
  }, []);

  useEffect(() => {
    if (filters.region) {
        const selectedRegion = regions.find(region => region.name === filters.region);
      if (selectedRegion) {
        setSelectedCSCs(selectedRegion.csc_centers);
        setSelectedSubstations(selectedRegion.substations);

        if (filters.substation) {
          const substation = selectedRegion.substations?.find(
            (sub: any) => sub.name === filters.substation
          ); 
          if (substation?.feeders) {
            setSelectedFeeders(substation.feeders);
          } else {
            setSelectedFeeders([]);
          }
        } else {
          setSelectedFeeders([]);
        }
      }
    } else {
      setSelectedCSCs([]);
      setSelectedSubstations([]);
      setSelectedFeeders([]);
    }
  }, [filters.region, filters.substation, regions]);

  

  const renderPickerItem = (items: { value: string; label: string; key?: string }[]) => {
    return items.map((item, index) => (
      <Picker.Item 
        key={item.key || `${item.value}-${index}`}
        label={item.label} 
        value={item.value} 
      />
    ));
  };

  const renderPicker = (
    label: string,
    value: string,
    items: { value: string; label: string }[],
    field: keyof FilterState,
    enabled: boolean = true
  ) => {
    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.pickerWrapper, !enabled && styles.pickerDisabled]}>
          <Picker
            enabled={enabled}
            selectedValue={value}
            onValueChange={(itemValue) => {
              console.log(`${label} selected:`, itemValue);
              onFilterChange(field, itemValue);
            }}
            style={styles.picker}
          >
            <Picker.Item label={`Select ${label}`} value="" />
            {renderPickerItem(items)}
          </Picker>
        </View>
      </View>
    );
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
            <Text style={styles.title}>Filter Base Stations</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.container}>
            <TextInput
              label="Station Code"
              value={filters.station_code}
              onChangeText={(text) => onFilterChange('station_code', text)}
              style={styles.input}
            />

            {renderPicker('Region', filters.region, regions.map((region, index) => ({
              value: region.name,
              label: region.name,
              key: `region-${region.csc_code}-${index}`
            })), 'region')}

            {renderPicker('CSC', filters.csc, selectedCSCs.map((csc, index) => ({
              value: csc.name,
              label: csc.name,
              key: `csc-${csc.csc_code}-${index}`
            })), 'csc', !!filters.region)}

            {renderPicker('Substation', filters.substation, selectedSubstations.map((sub, index) => ({
              value: sub.name,
              label: sub.name,
              key: `substation-${sub.id}-${index}`
            })), 'substation', !!filters.csc)}

            {renderPicker('Feeder', filters.feeder, selectedFeeders.map((feeder, index) => ({
              value: feeder.feeder_name,
              label: feeder.feeder_name,
              key: `feeder-${feeder.id}-${index}`
            })), 'feeder', !!filters.substation)}
            
            {renderPicker('Station Type', filters.station_type, STATION_TYPES.map(type => ({
              value: type,
              label: type,
              key: `station-type-${type}`
            })), 'station_type')}

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={onReset}
                style={styles.button}
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={onApply}
                style={styles.button}
              >
                Apply
              </Button>
            </View>
          </ScrollView>
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 8,
  },
  container: {
    padding: 16,
  },
  input: {
    height: 45,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  pickerContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
    color: '#495057',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    height: 45,
    justifyContent: 'center',
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  picker: {
    // height: 45,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default FilterForm;



