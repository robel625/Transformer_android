import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TextInput } from 'react-native-paper';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';
import type { Inspection } from '@/types/entity';

interface InspectionModalProps {
  visible: boolean;
  inspection: Inspection | null;
  transformerId: string;
  onClose: () => void;
  onDataChange: (newData: Inspection, isEdit: boolean) => void;
}

const CONDITIONS = ['Good', 'Fair', 'Poor'];
const STATUS_OPTIONS = ['Ok', 'one missed', 'two missed', 'all missed'];
const AVAILABILITY_OPTIONS = ['Available', 'Not Available'];
const OIL_LEVEL_OPTIONS = ['Full', '0.75', '0.5', '0.25'];
const INSULATION_OPTIONS = ['Acceptable', 'Not Acceptable'];
const HORN_GAP_OPTIONS = ['Good', 'Poor'];
const LINKAGE_OPTIONS = ['Yes', 'No'];

const RequiredLabel = ({ text }: { text: string }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.label}>{text}</Text>
    <Text style={styles.required}>*</Text>
  </View>
);

export function InspectionModal({
  visible,
  title,
  inspection,
  transformerId,
  onClose,
  onDataChange,
}: InspectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Inspection>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Reset form function
  const resetForm = () => {
    setFormData({
      transformer_data: transformerId,
      // Reset all fields to empty or default values
      body_condition: '',
      arrester: '',
      drop_out: '',
      mv_bushing: '',
      mv_cable_lug: '',
      lv_bushing: '',
      lv_cable_lug: '',
      oil_level: '',
      fuse_link: '',
      horn_gap: '',
      silica_gel: '',
      has_linkage: '',
      arrester_body_ground: '',
      neutral_ground: '',
      status_of_mounting: '',
      mounting_condition: '',
      N_load_current: 0,
      R_S_Voltage: 0,
      R_T_Voltage: 0,
      T_S_Voltage: 0
    });
    setErrors({});
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (inspection) {
      setFormData(inspection);
    } else {
      setFormData({
        transformer_data: transformerId,
      });
    }
    setErrors({}); // Reset errors when modal opens/closes
  }, [inspection, transformerId]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Create an object to track field errors
      const newErrors: Record<string, boolean> = {};
      const requiredFields = [
        'body_condition',
        'arrester',
        'drop_out',
        'mv_bushing',
        'mv_cable_lug',
        'lv_bushing',
        'lv_cable_lug',
        'oil_level',
        'fuse_link',
        'horn_gap',
        'silica_gel',
        'has_linkage',
        'arrester_body_ground',
        'neutral_ground',
        'status_of_mounting',
        'mounting_condition',
        'N_load_current',
        'R_S_Voltage',
        'R_T_Voltage',
        'T_S_Voltage'
      ];

      if (title === "Edit Inspection") {
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

      let response;
      if (inspection) {
        response = await transformerService.updateInspection(inspection.id, formData);
        onDataChange(response, true);
      } else {
        response = await transformerService.createInspection(formData);
        onDataChange(response, false);
      }
      showToast(`Inspection ${inspection ? 'updated' : 'created'} successfully`);
      resetForm(); // Reset form after successful submission
      onClose();
    } catch (error) {
      showToast(`Failed to ${inspection ? 'update' : 'create'} inspection`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {inspection ? 'Edit Inspection' : 'Create New Inspection'}
          </Text>

          <ScrollView style={styles.form}>
            {/* Body Condition */}
            <View style={styles.formField}>
              <RequiredLabel text="Body Condition" />
              <View style={[
                styles.pickerContainer,
                errors.body_condition && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.body_condition}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, body_condition: value }));
                    setErrors(prev => ({ ...prev, body_condition: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Body Condition" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {CONDITIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Arrestor */}
            <View style={styles.formField}>
              <RequiredLabel text="Arrestor" />
              <View style={[
                styles.pickerContainer,
                errors.arrester && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.arrester}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, arrester: value }));
                    setErrors(prev => ({ ...prev, arrester: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Arrestor Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {STATUS_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Drop Out */}
            <View style={styles.formField}>
              <RequiredLabel text="Drop Out" />
              <View style={[
                styles.pickerContainer,
                errors.drop_out && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.drop_out}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, drop_out: value }));
                    setErrors(prev => ({ ...prev, drop_out: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Drop Out Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {STATUS_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Fuse Link */}
            <View style={styles.formField}>
              <RequiredLabel text="Fuse Link" />
              <View style={[
                styles.pickerContainer,
                errors.fuse_link && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.fuse_link}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, fuse_link: value }));
                    setErrors(prev => ({ ...prev, fuse_link: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Fuse Link Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {STATUS_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* MV Bushing */}
            <View style={styles.formField}>
              <RequiredLabel text="MV Bushing" />
              <View style={[
                styles.pickerContainer,
                errors.mv_bushing && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.mv_bushing}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, mv_bushing: value }));
                    setErrors(prev => ({ ...prev, mv_bushing: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select MV Bushing Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {STATUS_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* MV Cable Lug */}
            <View style={styles.formField}>
              <RequiredLabel text="MV Cable Lug" />
              <View style={[
                styles.pickerContainer,
                errors.mv_cable_lug && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.mv_cable_lug}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, mv_cable_lug: value }));
                    setErrors(prev => ({ ...prev, mv_cable_lug: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select MV Cable Lug Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {STATUS_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* LV Bushing */}
            <View style={styles.formField}>
              <RequiredLabel text="LV Bushing" />
              <View style={[
                styles.pickerContainer,
                errors.lv_bushing && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.lv_bushing}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, lv_bushing: value }));
                    setErrors(prev => ({ ...prev, lv_bushing: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select LV Bushing Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {STATUS_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* LV Cable Lug */}
            <View style={styles.formField}>
              <RequiredLabel text="LV Cable Lug" />
              <View style={[
                styles.pickerContainer,
                errors.lv_cable_lug && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.lv_cable_lug}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, lv_cable_lug: value }));
                    setErrors(prev => ({ ...prev, lv_cable_lug: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select LV Cable Lug Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {STATUS_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Oil Level */}
            <View style={styles.formField}>
              <RequiredLabel text="Oil Level" />
              <View style={[
                styles.pickerContainer,
                errors.oil_level && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.oil_level}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, oil_level: value }));
                    setErrors(prev => ({ ...prev, oil_level: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Oil Level" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {OIL_LEVEL_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Insulation Level - Not Required */}
            <View style={styles.formField}>
              <Text style={styles.label}>Insulation Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.insulation_level}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, insulation_level: value }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Insulation Level" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {INSULATION_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Horn Gap Status */}
            <View style={styles.formField}>
              <RequiredLabel text="Horn Gap Status" />
              <View style={[
                styles.pickerContainer,
                errors.horn_gap && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.horn_gap}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, horn_gap: value }));
                    setErrors(prev => ({ ...prev, horn_gap: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Horn Gap Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {HORN_GAP_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Silica Gel */}
            <View style={styles.formField}>
              <RequiredLabel text="Silica Gel" />
              <View style={[
                styles.pickerContainer,
                errors.silica_gel && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.silica_gel}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, silica_gel: value }));
                    setErrors(prev => ({ ...prev, silica_gel: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Silica Gel Condition" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {CONDITIONS.map(condition => (
                    <Picker.Item
                      key={condition}
                      label={condition}
                      value={condition}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Has Linkage */}
            <View style={styles.formField}>
              <RequiredLabel text="Has Linkage" />
              <View style={[
                styles.pickerContainer,
                errors.has_linkage && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.has_linkage}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, has_linkage: value }));
                    setErrors(prev => ({ ...prev, has_linkage: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Linkage Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {LINKAGE_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Arrestor-Body Ground */}
            <View style={styles.formField}>
              <RequiredLabel text="Arrestor-Body Ground" />
              <View style={[
                styles.pickerContainer,
                errors.arrester_body_ground && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.arrester_body_ground}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, arrester_body_ground: value }));
                    setErrors(prev => ({ ...prev, arrester_body_ground: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Arrestor-Body Ground Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {AVAILABILITY_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Neutral Ground */}
            <View style={styles.formField}>
              <RequiredLabel text="Neutral Ground" />
              <View style={[
                styles.pickerContainer,
                errors.neutral_ground && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.neutral_ground}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, neutral_ground: value }));
                    setErrors(prev => ({ ...prev, neutral_ground: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Neutral Ground Status" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {AVAILABILITY_OPTIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Status of Mounting */}
            <View style={styles.formField}>
              <RequiredLabel text="Status of Mounting" />
              <View style={[
                styles.pickerContainer,
                errors.status_of_mounting && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.status_of_mounting}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, status_of_mounting: value }));
                    setErrors(prev => ({ ...prev, status_of_mounting: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Status of Mounting" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {CONDITIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Mounting Condition */}
            <View style={styles.formField}>
              <RequiredLabel text="Mounting Condition" />
              <View style={[
                styles.pickerContainer,
                errors.mounting_condition && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.mounting_condition}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, mounting_condition: value }));
                    setErrors(prev => ({ ...prev, mounting_condition: false }));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label="Select Mounting Condition" 
                    value="" 
                    enabled={false}
                    style={{ color: '#666' }}
                  />
                  {CONDITIONS.map(option => (
                    <Picker.Item
                      key={option}
                      label={option}
                      value={option}
                      style={{ color: '#000' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* N Load Current */}
            <RequiredLabel text="N Load Current" />
            <TextInput
              mode="outlined"
              label=""
              value={formData.N_load_current?.toString()}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, N_load_current: parseFloat(value) || 0 }));
                setErrors(prev => ({ ...prev, N_load_current: false }));
              }}
              style={[
                styles.input,
                errors.N_load_current && styles.inputError
              ]}
              keyboardType="numeric"
              outlineColor="#e1e1e1"
              activeOutlineColor="#1890ff"
              dense={true}
            />

            {/* R-S Voltage */}
            <RequiredLabel text="R-S Voltage" />
            <TextInput
              mode="outlined"
              label=""
              value={formData.R_S_Voltage?.toString()}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, R_S_Voltage: parseFloat(value) || 0 }));
                setErrors(prev => ({ ...prev, R_S_Voltage: false }));
              }}
              style={[
                styles.input,
                errors.R_S_Voltage && styles.inputError
              ]}
              keyboardType="numeric"
              outlineColor="#e1e1e1"
              activeOutlineColor="#1890ff"
              dense={true}
            />

            {/* R-T Voltage */}
            <RequiredLabel text="R-T Voltage" />
            <TextInput
              mode="outlined"
              label=""
              value={formData.R_T_Voltage?.toString()}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, R_T_Voltage: parseFloat(value) || 0 }));
                setErrors(prev => ({ ...prev, R_T_Voltage: false }));
              }}
              style={[
                styles.input,
                errors.R_T_Voltage && styles.inputError
              ]}
              keyboardType="numeric"
              outlineColor="#e1e1e1"
              activeOutlineColor="#1890ff"
              dense={true}
            />

            {/* T-S Voltage */}
            <RequiredLabel text="T-S Voltage" />
            <TextInput
              mode="outlined"
              label=""
              value={formData.T_S_Voltage?.toString()}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, T_S_Voltage: parseFloat(value) || 0 }));
                setErrors(prev => ({ ...prev, T_S_Voltage: false }));
              }}
              style={[
                styles.input,
                errors.T_S_Voltage && styles.inputError
              ]}
              keyboardType="numeric"
              outlineColor="#e1e1e1"
              activeOutlineColor="#1890ff"
              dense={true}
            />
          </ScrollView>

          {/* Add reason field only for edit mode */}
          {inspection && (
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
                <Text style={styles.submitButtonText}>
                  {inspection ? 'Update' : 'Create'}
                </Text>
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
    color: '#1a1a1a',
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
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  required: {
    color: '#dc3545',
    marginLeft: 4,
  },
  input: {
    height: 45,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingHorizontal: 12,
  },
  input1: {
    height: 55,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1,
    backgroundColor: '#fff8f8',
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    height: 45,
    marginBottom: 10,
  },
  picker: {
    height: 55,
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'android' ? -8 : 0,
    marginBottom: Platform.OS === 'android' ? -4 : 0,
    paddingHorizontal: 8,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    // marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  submitButton: {
    backgroundColor: '#1890ff',
  },
  cancelButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});













