import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, HelperText} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import type { Transformer } from '@/types/entity';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';
import DateTimePicker from '@react-native-community/datetimepicker';
import NetInfo from '@react-native-community/netinfo';

const TRANSFORMER_TYPES = [
  { value: 'Conservator', label: 'Conservator' },
  { value: 'Hermatical', label: 'Hermatical' },
  { value: 'Compact', label: 'Compact' },
];

const CAPACITIES = [
  { value: '10', label: '10 kVA' },
  { value: '25', label: '25 kVA' },
  { value: '50', label: '50 kVA' },
  { value: '100', label: '100 kVA' },
  { value: '200', label: '200 kVA' },
  { value: '315', label: '315 kVA' },
  { value: '400', label: '400 kVA' },
  { value: '500', label: '500 kVA' },
  { value: '630', label: '630 kVA' },
  { value: '800', label: '800 kVA' },
  { value: '1250', label: '1250 kVA' },
  { value: '2500', label: '2500 kVA' },
];

const PRIMARY_VOLTAGES = [
  { value: '15', label: '15 kVA' },
  { value: '19', label: '19 kVA' },
  { value: '33', label: '33 kVA' },
];

const COOLING_TYPES = [
  { value: 'ONAN', label: 'ONAN' },
  { value: 'Dry Type', label: 'Dry Type' },
];

const MANUFACTURERS = [
  { value: 'ABB Tanzania', label: 'ABB Tanzania' },
  { value: 'Apex', label: 'Apex' },
  { value: 'China Natinal Electric wire and cable Imp/Exp corporations', label: 'China Natinal Electric wire and cable Imp/Exp corporations' },
  { value: 'Iran Transformer', label: 'Iran Transformer' },
  { value: 'Kobera', label: 'Kobera' },
  { value: 'Koncar', label: 'Koncar' },
  { value: "Mar son's", label: "Mar son's" },
  { value: 'METEC', label: 'METEC' },
];

const SERVICE_TYPES = [
  { value: 'Dedicated', label: 'Dedicated' },
  { value: 'Public', label: 'Public' },
];

const STATUSES = [
  { value: 'New', label: 'New' },
  { value: 'Maintained', label: 'Maintained' },
];

const VECTOR_GROUPS = [
  { value: 'DY1', label: 'DY1' },
  { value: 'DY5', label: 'DY5' },
  { value: 'DY11', label: 'DY11' },
  { value: 'Other', label: 'Other' },
];

const RequiredLabel = ({ text }: { text: string }) => (
  <Text style={styles.label}>
    {text}<Text style={styles.required}>*</Text>
  </Text>
);

export interface TransformerModalProps {
  title: string;
  show: boolean;
  formValue: Transformer;
  onOk: () => void;
  onCancel: () => void;
  onDataChange: (newData: Transformer, isEdit: boolean) => void;
}

export function TransformerModal({ 
  title, 
  show, 
  formValue, 
  onOk, 
  onCancel, 
  onDataChange 
}: TransformerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Transformer>>(formValue);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [networkState, setNetworkState] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState(state.isConnected);
    });
  
    // Fetch initial state
    NetInfo.fetch().then((state) => {
      setNetworkState(state.isConnected);
    });
  
    return () => unsubscribe();
  }, []);
  

  useEffect(() => {
    setFormData(formValue);
  }, [formValue]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Create an object to track field errors
      const newErrors: Record<string, boolean> = {};
      const requiredFields = [
        'trafo_type',
        'capacity',
        'dt_number',
        'primary_voltage',
        'colling_type',
        'serial_number',
        'manufacturer',
        'service_type',
        'status',
        'vector_group',
        'impedance_voltage',
        'winding_weight',
        'oil_weight',
        'year_of_manufacturing',
      ];

      // Add reason validation for edit mode
      if (title === "Edit Transformer") {
        requiredFields.push('reason');
        if (!formData.reason || formData.reason.trim().length === 0) {
          newErrors.reason = true;
          hasError = true;
        }
      }

      // Check all required fields
      let hasError = false;
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = true;
          hasError = true;
        }
      });

      setErrors(newErrors);

      if (hasError) {
        showToast('Please fill in all required fields');
        return;
      }
      
      if (title === "New Transformer") {

        if (formData.date_of_installation === "") {
          delete formData.date_of_installation;
        }
        const response = await transformerService.createTransformer(formData as Transformer);
        if (response?.error) {
          showToast(response.error);
          return;
        }
        if (response) {
          showToast('Transformer created successfully');
          onDataChange(response, false);
          setFormData({});
          onOk();
        }
      } else if (title === "Edit Transformer") {
        if (!formValue?.id) {
          showToast('Invalid transformer ID');
          return;
        }

        if (formData.date_of_installation === "") {
          delete formData.date_of_installation;
        }
        
        await transformerService.updateTransformer(formValue.id, formData as Partial<Transformer>);
        onDataChange({ ...formValue, ...formData } as Transformer, true);
        showToast('Transformer updated successfully');
        setFormData({});
        onOk();
      }
    } catch (error: any) {
      console.error('Operation failed:', error);
      showToast(error?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({});
    onCancel();
  };

  return (
    <Modal
      visible={show}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.form}>
            {/* Station Code */}
            <Text style={styles.label}>Station Code</Text>
            <TextInput
              label="Station Code"
              value={formData.basestation}
              onChangeText={value => {
                setFormData(prev => ({ ...prev, basestation: value }));
                setErrors(prev => ({ ...prev, basestation: false }));
              }}
              style={[
                styles.input,
                errors.basestation && styles.inputError
              ]}
              placeholder="Enter station code"
            />

            {/* Transformer Type */}
            <RequiredLabel text="Transformer Type" />
            <View style={[
              styles.pickerContainer,
              errors.trafo_type && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.trafo_type}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, trafo_type: value }));
                  setErrors(prev => ({ ...prev, trafo_type: false }));
                }}
                style={styles.picker}
                mode="dropdown"
                // itemStyle={{ fontSize: 14 }}
              >
                <Picker.Item 
                  label="Select Transformer Type" 
                  value="" 
                  color="#666"
                />
                {TRANSFORMER_TYPES.map(type => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                    color="#000"
                  />
                ))}
              </Picker>
            </View>

            {/* Capacity */}
            <RequiredLabel text="Capacity" />
            <View style={[
              styles.pickerContainer,
              errors.capacity && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.capacity}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, capacity: value }));
                  setErrors(prev => ({ ...prev, capacity: false }));
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Capacity" value="" />
                {CAPACITIES.map(cap => (
                  <Picker.Item
                    key={cap.value}
                    label={cap.label}
                    value={cap.value}
                  />
                ))}
              </Picker>
            </View>

            {/* DT Number */}
            <RequiredLabel text="DT Number" />
            <TextInput
              label="DT Number"
              value={formData.dt_number}
              onChangeText={value => {
                setFormData(prev => ({ ...prev, dt_number: value }));
                setErrors(prev => ({ ...prev, dt_number: false }));
              }}
              style={[
                styles.input,
                errors.dt_number && styles.inputError
              ]}
              placeholder="Enter DT number"
            />

            {/* Primary Voltage */}
            <RequiredLabel text="Primary Voltage" />
            <View style={[
              styles.pickerContainer,
              errors.primary_voltage && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.primary_voltage}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, primary_voltage: value }));
                  setErrors(prev => ({ ...prev, primary_voltage: false }));
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Primary Voltage" value="" />
                {PRIMARY_VOLTAGES.map(voltage => (
                  <Picker.Item
                    key={voltage.value}
                    label={voltage.label}
                    value={voltage.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Cooling Type */}
            <RequiredLabel text="Cooling Type" />
            <View style={[
              styles.pickerContainer,
              errors.colling_type && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.colling_type}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, colling_type: value }));
                  setErrors(prev => ({ ...prev, colling_type: false }));
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Cooling Type" value="" />
                {COOLING_TYPES.map(type => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Serial Number */}
            <RequiredLabel text="Serial Number" />
            <TextInput
              label="Serial Number"
              value={formData.serial_number}
              onChangeText={value => {
                setFormData(prev => ({ ...prev, serial_number: value }));
                setErrors(prev => ({ ...prev, serial_number: false }));
              }}
              style={[
                styles.input,
                errors.serial_number && styles.inputError
              ]}
              placeholder="Enter serial number"
            />

            {/* Manufacturer */}
            <RequiredLabel text="Manufacturer" />
            <View style={[
              styles.pickerContainer,
              errors.manufacturer && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.manufacturer}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, manufacturer: value }));
                  setErrors(prev => ({ ...prev, manufacturer: false }));
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Manufacturer" value="" />
                {MANUFACTURERS.map(mfr => (
                  <Picker.Item
                    key={mfr.value}
                    label={mfr.label}
                    value={mfr.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Service Type */}
            <RequiredLabel text="Service Type" />
            <View style={[
              styles.pickerContainer,
              errors.service_type && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.service_type}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, service_type: value }));
                  setErrors(prev => ({ ...prev, service_type: false }));
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Service Type" value="" />
                {SERVICE_TYPES.map(type => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Status */}
            <RequiredLabel text="Status" />
            <View style={[
              styles.pickerContainer,
              errors.status && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, status: value }));
                  setErrors(prev => ({ ...prev, status: false }));
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Status" value="" />
                {STATUSES.map(status => (
                  <Picker.Item
                    key={status.value}
                    label={status.label}
                    value={status.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Vector Group */}
            <RequiredLabel text="Vector Group" />
            <View style={[
              styles.pickerContainer,
              errors.vector_group && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.vector_group}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, vector_group: value }));
                  setErrors(prev => ({ ...prev, vector_group: false }));
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Vector Group" value="" />
                {VECTOR_GROUPS.map(group => (
                  <Picker.Item
                    key={group.value}
                    label={group.label}
                    value={group.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Impedance Voltage */}
            <TextInput
              label="Impedance Voltage (%)"
              value={formData.impedance_voltage?.toString()}
              onChangeText={value => {
                const numValue = parseFloat(value) || 0;
                setFormData(prev => ({ ...prev, impedance_voltage: numValue }));
              }}
              keyboardType="decimal-pad"
              style={[styles.input, errors.impedance_voltage && styles.inputError]}
            />

            {/* Winding Weight */}
            <TextInput
              label="Winding Weight (kg)"
              value={formData.winding_weight?.toString()}
              onChangeText={value => {
                const numValue = parseFloat(value) || 0;
                setFormData(prev => ({ ...prev, winding_weight: numValue }));
              }}
              keyboardType="decimal-pad"
              style={[styles.input, errors.winding_weight && styles.inputError]}
            />

            {/* Oil Weight */}
            <TextInput
              label="Oil Weight (kg)"
              value={formData.oil_weight?.toString()}
              onChangeText={value => {
                const numValue = parseFloat(value) || 0;
                setFormData(prev => ({ ...prev, oil_weight: numValue }));
              }}
              keyboardType="decimal-pad"
              style={[styles.input, errors.oil_weight && styles.inputError]}
            />

            {/* Year of Manufacturing */}
            <Text style={styles.label}>Year of Manufacturing</Text>
            <View style={[
              styles.pickerContainer,
              errors.vector_group && styles.inputError
            ]}>
            <Picker
              selectedValue={formData.year_of_manufacturing?.toString()}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                year_of_manufacturing: parseInt(value) 
              }))}
              style={styles.picker}
            >
              <Picker.Item label="Select Year" value="" />
              {Array.from(
                { length: new Date().getFullYear() - 1900 + 1 }, 
                (_, i) => new Date().getFullYear() - i
              ).map(year => (
                <Picker.Item 
                  key={year.toString()} 
                  label={year.toString()} 
                  value={year.toString()} 
                />
              ))}
            </Picker>
            </View>

            {/* Date of Installation */}
            <Text style={styles.label}>Date of Installation</Text>
            <Pressable 
              style={[styles.dateButton, errors.date_of_installation && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {formData.date_of_installation 
                  ? new Date(formData.date_of_installation).toLocaleDateString()
                  : 'Select Date'}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={formData.date_of_installation 
                  ? new Date(formData.date_of_installation) 
                  : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate && event.type !== 'dismissed') {
                    setFormData(prev => ({ 
                      ...prev, 
                      date_of_installation: selectedDate.toISOString().split('T')[0] 
                    }));
                    setErrors(prev => ({ ...prev, date_of_installation: false }));
                  }
                }}
              />
            )}

            {/* Add reason field only for edit mode */}
            {title === "Edit Transformer" && (
              <>
                <Text style={styles.label}>Reason for Update<Text style={styles.required}>*</Text></Text>
                <TextInput
                  multiline
                  numberOfLines={2}
                  placeholder="Please provide a detailed reason for this update"
                  value={formData.reason}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, reason: value }));
                    setErrors(prev => ({ ...prev, reason: false }));
                  }}
                  style={[
                    styles.input1,
                    styles.textArea,
                    errors.reason && styles.inputError
                  ]}
                />
              </>
            )}

            

            {/* {title === "New Transformer" && !formValue.id && networkState === false && (
              <TouchableOpacity
                style={styles.addButton}
                // onPress={add_inspection_LvFeeder}
                accessible={true}
                accessibilityLabel="Add new inspection"
              >
                <Icon name="add-circle" size={20} color="#2196F3" />
                <Text style={styles.addButtonText}>Add Inspection</Text>
              </TouchableOpacity>
            )} */}

          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            >
              {title === "New Transformer" ? "Create" : "Update"}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  form: {
    flexGrow: 1,
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
  input1: {
    height: 55,
    // marginBottom: 16,
    // backgroundColor: '#f8f9fa',
    // borderRadius: 8,
    // fontSize: 14,
    // borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  inputError: {
    borderColor: '#ff4d4f',
    borderWidth: 1,
  },
  pickerContainer: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    height: 35,
  },
  picker: {
    height: 55,
    backgroundColor: 'transparent',
    fontSize: 10, // This won't work directly on Picker
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#495057',
  },
  required: {
    color: '#ff4d4f',
    marginLeft: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateButton: {
    height: 45,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  datePicker: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#2196F3',
    marginLeft: 8,
    fontWeight: '500',
  },
});







