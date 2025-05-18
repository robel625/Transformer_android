import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// Constants for dropdown options
const TRANSFORMER_TYPES = ['Conservator', 'Hermatical', 'Compact'];
const CAPACITIES = ['10', '25', '50', '100', '200', '315', '400', '500', '630', '800', '1250', '2500'];
const PRIMARY_VOLTAGES = ['15', '19', '33'];
const COOLING_TYPES = ['ONAN', 'Dry Type'];
const MANUFACTURERS = [
  'ABB Tanzania', 'Apex', 'China Natinal Electric wire and cable Imp/Exp corporations', 'Iran Transformer',
  'Kobera', 'Koncar', "Mar son's", 'METEC'
];
const SERVICE_TYPES = ['Dedicated', 'Public'];
const STATUSES = ['New', 'Maintained'];
const VECTOR_GROUPS = ['DY1', 'DY5', 'DY11', 'Other'];

interface TransformerFormProps {
  transformerData: any;
  errors: Record<string, boolean>;
  handleTransformerChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  loading: boolean;
}

export const TransformerForm: React.FC<TransformerFormProps> = ({
  transformerData,
  errors,
  handleTransformerChange,
  onNext,
  onPrevious,
  loading,
}) => {
  return (
    <ScrollView style={styles.form}>
      {/* Station Code */}
      <Text style={styles.label}>Station Code</Text>
      <TextInput
        value={transformerData.basestation}
        onChangeText={(value) => handleTransformerChange('basestation', value)}
        style={styles.input}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />

      {/* Transformer Type */}
      <RequiredLabel text="Transformer Type" />
      <View style={[styles.pickerContainer, errors.trafo_type && styles.inputError]}>
        <Picker
          selectedValue={transformerData.trafo_type}
          onValueChange={(value) => handleTransformerChange('trafo_type', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Transformer Type" value="" enabled={false} style={{ color: '#666' }} />
          {TRANSFORMER_TYPES.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Capacity */}
      <RequiredLabel text="Capacity" />
      <View style={[styles.pickerContainer, errors.capacity && styles.inputError]}>
        <Picker
          selectedValue={transformerData.capacity}
          onValueChange={(value) => handleTransformerChange('capacity', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Capacity" value="" enabled={false} style={{ color: '#666' }} />
          {CAPACITIES.map(option => (
            <Picker.Item key={option} label={`${option} kVA`} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* DT Number */}
      <RequiredLabel text="DT Number" />
      <TextInput
        value={transformerData.dt_number}
        onChangeText={(value) => handleTransformerChange('dt_number', value)}
        style={[styles.input, errors.dt_number && styles.inputError]}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />

      {/* Primary Voltage */}
      <RequiredLabel text="Primary Voltage" />
      <View style={[styles.pickerContainer, errors.primary_voltage && styles.inputError]}>
        <Picker
          selectedValue={transformerData.primary_voltage}
          onValueChange={(value) => handleTransformerChange('primary_voltage', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Primary Voltage" value="" enabled={false} style={{ color: '#666' }} />
          {PRIMARY_VOLTAGES.map(option => (
            <Picker.Item key={option} label={`${option} kV`} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Cooling Type */}
      <RequiredLabel text="Cooling Type" />
      <View style={[styles.pickerContainer, errors.colling_type && styles.inputError]}>
        <Picker
          selectedValue={transformerData.colling_type}
          onValueChange={(value) => handleTransformerChange('colling_type', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Cooling Type" value="" enabled={false} style={{ color: '#666' }} />
          {COOLING_TYPES.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Serial Number */}
      <RequiredLabel text="Serial Number" />
      <TextInput
        value={transformerData.serial_number}
        onChangeText={(value) => handleTransformerChange('serial_number', value)}
        style={[styles.input, errors.serial_number && styles.inputError]}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />

      {/* Manufacturer */}
      <RequiredLabel text="Manufacturer" />
      <View style={[styles.pickerContainer, errors.manufacturer && styles.inputError]}>
        <Picker
          selectedValue={transformerData.manufacturer}
          onValueChange={(value) => handleTransformerChange('manufacturer', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Manufacturer" value="" enabled={false} style={{ color: '#666' }} />
          {MANUFACTURERS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Service Type */}
      <RequiredLabel text="Service Type" />
      <View style={[styles.pickerContainer, errors.service_type && styles.inputError]}>
        <Picker
          selectedValue={transformerData.service_type}
          onValueChange={(value) => handleTransformerChange('service_type', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Service Type" value="" enabled={false} style={{ color: '#666' }} />
          {SERVICE_TYPES.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Status */}
      <RequiredLabel text="Status" />
      <View style={[styles.pickerContainer, errors.status && styles.inputError]}>
        <Picker
          selectedValue={transformerData.status}
          onValueChange={(value) => handleTransformerChange('status', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Status" value="" enabled={false} style={{ color: '#666' }} />
          {STATUSES.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Vector Group */}
      <RequiredLabel text="Vector Group" />
      <View style={[styles.pickerContainer, errors.vector_group && styles.inputError]}>
        <Picker
          selectedValue={transformerData.vector_group}
          onValueChange={(value) => handleTransformerChange('vector_group', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Vector Group" value="" enabled={false} style={{ color: '#666' }} />
          {VECTOR_GROUPS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Impedance Voltage */}
      <RequiredLabel text="Impedance Voltage" />
      <TextInput
        value={transformerData.impedance_voltage?.toString()}
        onChangeText={(value) => handleTransformerChange('impedance_voltage', value)}
        keyboardType="numeric"
        style={[styles.input, errors.impedance_voltage && styles.inputError]}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />

      {/* Winding Weight */}
      <RequiredLabel text="Winding Weight" />
      <TextInput
        value={transformerData.winding_weight?.toString()}
        onChangeText={(value) => handleTransformerChange('winding_weight', value)}
        keyboardType="numeric"
        style={[styles.input, errors.winding_weight && styles.inputError]}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />

      {/* Oil Weight */}
      <RequiredLabel text="Oil Weight" />
      <TextInput
        value={transformerData.oil_weight?.toString()}
        onChangeText={(value) => handleTransformerChange('oil_weight', value)}
        keyboardType="numeric"
        style={[styles.input, errors.oil_weight && styles.inputError]}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />

      {/* Year of Manufacturing */}
      <RequiredLabel text="Year of Manufacturing" />
      <View style={[styles.pickerContainer, errors.year_of_manufacturing && styles.inputError]}>
        <Picker
          selectedValue={transformerData.year_of_manufacturing}
          onValueChange={(value) => handleTransformerChange('year_of_manufacturing', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Year" value="" enabled={false} style={{ color: '#666' }} />
          {Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
            <Picker.Item key={year} label={year} value={year} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Date of Installation */}
      <Text style={styles.label}>Date of Installation</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => {}}>
        <Text style={styles.dateButtonText}>
          {transformerData.date_of_installation || 'Select Date'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Required Label Component
const RequiredLabel = ({ text }: { text: string }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.label}>{text}</Text>
    <Text style={styles.required}>*</Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  form: {
    maxHeight: '70%',
  },
  formField: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    color: 'red',
    marginLeft: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
    height: 40,
  },
  inputError: {
    borderColor: 'red',
  },
  dateButton: {
    height: 45,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingHorizontal: 12,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#495057',
  },
});