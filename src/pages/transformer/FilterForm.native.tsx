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
// import { DatePickerInput } from 'react-native-paper-dates';
import moment from 'moment';
import orgService from '@/api/services/orgService';
import { showToast } from '@/util/action';
import { useOrgStore } from '@/store/useOrgStore';

// Constants from the original component
const TRANSFORMER_TYPES = [
  { value: 'Conservator', label: 'Conservator' },
  { value: 'Hermatical', label: 'Hermatical' },
  { value: 'Compact', label: 'Compact' },
];

const MANUFACTURER_CHOICES = [
  { value: 'ABB Tanzania', label: 'ABB Tanzania' },
  { value: 'Apex', label: 'Apex' },
  { value: 'China Natinal Electric wire and cable Imp/Exp corporations', 
    label: 'China Natinal Electric wire and cable Imp/Exp corporations' },
  { value: 'Iran Transformer', label: 'Iran Transformer' },
  { value: 'Kobera', label: 'Kobera' },
  { value: 'Koncar', label: 'Koncar' },
  { value: "Mar son's", label: "Mar son's" },
  { value: 'METEC', label: 'METEC' },
  { value: 'Minel Transformer', label: 'Minel Transformer' },
];

const SERVICE_TYPE_CHOICES = [
  { value: 'Dedicated', label: 'Dedicated' },
  { value: 'Public', label: 'Public' },
];

const STATUS_CHOICES = [
  { value: 'New', label: 'New' },
  { value: 'Maintained', label: 'Maintained' },
];

const INSPECTION_STATUS_OPTIONS = [
  { value: 'inspected', label: 'Inspected' },
  { value: 'not_inspected', label: 'Not Inspected' },
];

export interface FilterState {
  id: number;
  station_code: string;
  region: string;
  csc: string;
  trafo_type: string;
  capacity: string;
  dt_number: string;
  primary_voltage: string;
  colling_type: string;
  serial_number: string;
  manufacturer: string;
  vector_group: string;
  impedance_voltage: string;
  winding_weight: string;
  oil_weight: string;
  year_of_manufacturing: string;
  date_of_installation: string;
  inspection_date_range: [string | null, string | null];
  inspection_status: string;
  service_type: string;
  status: string;
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

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, index) => ({
      value: (currentYear - index).toString(),
      label: (currentYear - index).toString()
    })
  );

  useEffect(() => {
    fetchRegions().catch(error => {
      // Don't show error toast if we're using persisted data
      if (!regions.length) {
        showToast('No data available - please connect to internet');
      }
    });
  }, []);

  useEffect(() => {
    if (filters.region) {
      const selectedRegion = regions.find(r => r.csc_code === filters.region);
      console.log('Selected Region:', selectedRegion);
      
      if (selectedRegion) {
        // Check different possible property names
        const cscs = selectedRegion.cscs || selectedRegion.csc_centers || selectedRegion.csc_list;
        console.log('CSCs found:', cscs);
        
        if (cscs) {
          setSelectedCSCs(cscs);
        } else {
          console.log('No CSCs property found in region object');
          setSelectedCSCs([]);
        }
      } else {
        console.log('No matching region found for:', filters.region);
        setSelectedCSCs([]);
      }
    } else {
      setSelectedCSCs([]);
    }
  }, [filters.region, regions]);

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
    console.log(`Rendering ${label} picker with items:`, items);
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

  const renderCSCPicker = () => {
    console.log('Rendering CSC picker with CSCs:', selectedCSCs);
    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>CSC</Text>
        <View style={[styles.pickerWrapper, !filters.region && styles.pickerDisabled]}>
          <Picker
            enabled={!!filters.region}
            selectedValue={filters.csc}
            onValueChange={(itemValue) => {
              console.log('CSC selected:', itemValue);
              onFilterChange('csc', itemValue);
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select CSC" value="" />
            {selectedCSCs.map((csc, index) => {
              const uniqueKey = `csc-${csc.csc_code}-${index}`;
              console.log('Creating CSC item with key:', uniqueKey);
              return (
                <Picker.Item 
                  key={uniqueKey}
                  label={csc.name} 
                  value={csc.csc_code} 
                />
              );
            })}
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
            <Text style={styles.title}>Filter Transformers</Text>
            <TouchableOpacity onPress={onClose}>
                          <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.container}>
            <TextInput
                label="Transformer id"
                value={filters.id}
                onChangeText={(text) => onFilterChange('id', text)}
                style={styles.input}
              />

            <TextInput
              label="Station Code"
              value={filters.station_code}
              onChangeText={(text) => onFilterChange('station_code', text)}
              style={styles.input}
            />

            {renderPicker('Region', filters.region, regions.map((region, index) => ({
              value: region.csc_code,
              label: region.name,
              key: `region-${region.csc_code}-${index}` // Add unique key
            })), 'region')}

            {renderCSCPicker()}
            
            {renderPicker('Transformer Type', filters.trafo_type, TRANSFORMER_TYPES, 'trafo_type')}
            
            <TextInput
              label="DT Number"
              value={filters.dt_number}
              onChangeText={(text) => onFilterChange('dt_number', text)}
              style={styles.input}
            />

            <TextInput
              label="Serial Number"
              value={filters.serial_number}
              onChangeText={(text) => onFilterChange('serial_number', text)}
              style={styles.input}
            />

            {renderPicker('Manufacturer', filters.manufacturer, MANUFACTURER_CHOICES, 'manufacturer')}
            
            <TextInput
              label="Impedance Voltage (%)"
              value={filters.impedance_voltage}
              onChangeText={(text) => onFilterChange('impedance_voltage', text)}
              keyboardType="numeric"
              style={styles.input}
            />

            {renderPicker(
              'Year of Manufacturing',
              filters.year_of_manufacturing || '',
              years,
              'year_of_manufacturing'
            )}

            {renderPicker('Inspection Status', filters.inspection_status, INSPECTION_STATUS_OPTIONS, 'inspection_status')}
            
            {renderPicker('Service Type', filters.service_type, SERVICE_TYPE_CHOICES, 'service_type')}
            
            {renderPicker('Status', filters.status, STATUS_CHOICES, 'status')}

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
    marginBottom: 14,
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
    height: 45,
    justifyContent: 'center',
  },
  pickerDisabled: {
    backgroundColor: '#e9ecef',
    opacity: 0.8,
  },
  picker: {
    // height: 45,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  resetButtonText: {
    color: '#6c757d',
  },
  applyButton: {
    backgroundColor: '#0d6efd',
  },
  applyButtonText: {
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 22,
    color: '#666',
  }
});

export default FilterForm;










