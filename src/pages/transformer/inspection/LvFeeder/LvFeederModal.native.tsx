import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import type { LvFeeder } from '#/entity';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';

interface LvFeederModalProps {
  show: boolean;
  title: string;
  inspectionId: number;
  formValue: LvFeeder;
  onClose: () => void;
  onDataChange: (newData: LvFeeder, isEdit: boolean) => void;
}

const RequiredLabel = ({ text }: { text: string }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.label}>{text}</Text>
    <Text style={styles.required}>*</Text>
  </View>
);

export function LvFeederModal({
  show,
  title,
  inspectionId,
  formValue,
  onClose,
  onDataChange,
}: LvFeederModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<LvFeeder>>(formValue);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add this function to reset all form values
  const resetForm = () => {
    setFormData({
      type_of_distribution_box: '',
      R_load_current: '',
      S_load_current: '',
      T_load_current: '',
      R_fuse_rating: '',
      S_fuse_rating: '',
      T_fuse_rating: '',
      reason: '',
    });
    setErrors({});
  };

  // Update the useEffect to set initial form data when modal opens
  useEffect(() => {
    if (formValue.id) {
      setFormData(formValue);
    } else {
      resetForm();
    }
  }, [formValue]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type_of_distribution_box) {
      newErrors.type_of_distribution_box = 'Distribution box type is required';
    }
    if (!formData.R_load_current) {
      newErrors.R_load_current = 'R load current is required';
    }
    if (!formData.S_load_current) {
      newErrors.S_load_current = 'S load current is required';
    }
    if (!formData.T_load_current) {
      newErrors.T_load_current = 'T load current is required';
    }
    if (!formData.R_fuse_rating) {
      newErrors.R_fuse_rating = 'R fuse rating is required';
    }
    if (!formData.S_fuse_rating) {
      newErrors.S_fuse_rating = 'S fuse rating is required';
    }
    if (!formData.T_fuse_rating) {
      newErrors.T_fuse_rating = 'T fuse rating is required';
    }
    if (formValue.id && !formData.reason) {
      newErrors.reason = 'Reason for update is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        inspection_data: inspectionId,
      };

      let response;
      if (formValue.id) {
        response = await transformerService.updateLvFeeder(formValue.id, data);
        onDataChange({ ...formValue, ...response }, true);
        showToast('LvFeeder updated successfully');
      } else {
        response = await transformerService.createLvFeeder(data);
        onDataChange(response, false);
        showToast('LvFeeder created successfully');
      }
      
      resetForm(); // Reset form after successful submission
      onClose();
    } catch (error: any) {
      console.error('LvFeeder operation error:', error);
      showToast(error.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add a handleClose function
  const handleClose = () => {
    resetForm(); // Reset form when closing
    onClose();
  };

  const handleInputChange = (name: keyof LvFeeder, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Modal
      visible={show}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <ScrollView style={styles.form}>
            {/* Distribution Box Type */}
            <View style={styles.formField}>
              <RequiredLabel text="Distribution Box" />
              <View style={[
                styles.pickerContainer,
                errors.type_of_distribution_box && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.type_of_distribution_box}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, type_of_distribution_box: value }));
                    setErrors(prev => ({ ...prev, type_of_distribution_box: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Distribution Box" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {["Box 1", "Box 2", "Box 3", "Box 4", "Box 5"].map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
              {errors.type_of_distribution_box && (
                <Text style={styles.errorText}>Please select a distribution box</Text>
              )}
            </View>

            {/* Load Current Fields */}
            {['R', 'S', 'T'].map((phase) => (
              <View key={`${phase}_load_current`} style={styles.formField}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{`${phase} Load Current (A)`}</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  value={formData[`${phase}_load_current` as keyof LvFeeder]?.toString()}
                  onChangeText={(value) => handleInputChange(`${phase}_load_current` as keyof LvFeeder, value)}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  error={!!errors[`${phase}_load_current`]}
                />
              </View>
            ))}

            {/* Fuse Rating Fields */}
            {['R', 'S', 'T'].map((phase) => (
              <View key={`${phase}_fuse_rating`} style={styles.formField}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{`${phase} Fuse Rating (A)`}</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  value={formData[`${phase}_fuse_rating` as keyof LvFeeder]?.toString()}
                  onChangeText={(value) => handleInputChange(`${phase}_fuse_rating` as keyof LvFeeder, value)}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  error={!!errors[`${phase}_fuse_rating`]}
                />
              </View>
            ))}

            {/* Reason field for edit mode */}
            {formValue.id && (
              <View style={styles.formField}>
                <RequiredLabel text="Reason for Update" />
                <TextInput
                  mode="outlined"
                  label=""
                  value={formData.reason}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, reason: value }));
                    setErrors(prev => ({ ...prev, reason: false }));
                  }}
                  style={[
                    styles.input1,
                    errors.reason && styles.inputError
                  ]}
                  placeholder="Reason must be at least 10 characters long"
                  multiline
                  numberOfLines={2}
                  outlineColor="#e1e1e1"
                  activeOutlineColor="#1890ff"
                  dense={true}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
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
    textAlign: 'center',
  },
  form: {
    flexGrow: 1,
  },
  formField: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  required: {
    color: '#dc3545',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 4,
    height: 40,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 4,
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#1890ff',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1,
    backgroundColor: '#fff8f8',
  },
});




