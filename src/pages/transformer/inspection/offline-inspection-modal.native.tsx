import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { showToast } from '@/util/action';
import type { Inspection, LvFeeder } from '@/types/entity';
import storageService from '@/services/storageService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { syncService } from '@/services';


interface OfflineInspectionModalProps {
  visible: boolean;
  transformerId: string;
  onClose: () => void;
  onDataChange: (newData: Inspection, isEdit: boolean) => void;
}

// Constants for dropdown options
const CONDITIONS = ['Good', 'Fair', 'Poor'];
const STATUS_OPTIONS = ['Ok', 'one missed', 'two missed', 'all missed'];
const DISTRIBUTION_BOX_TYPES = ['Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5'];
const OIL_LEVEL_OPTIONS = ['Full', '0.75', '0.5','0.25'];
const HORN_GAP_OPTIONS = ['Good', 'Poor'];
const LINKAGE_OPTIONS = ['Yes', 'No'];
const AVAILABILITY_OPTIONS = ['Available', 'Not Available'];
const INSULATION_OPTIONS = ['Acceptable', 'Not Acceptable'];

// Component for required field label
const RequiredLabel = ({ text }: { text: string }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.label}>{text}</Text>
    <Text style={styles.required}>*</Text>
  </View>
);

export function OfflineInspectionModal({
  visible,
  transformerId,
  onClose,
  onDataChange,
}: OfflineInspectionModalProps) {
  // State for inspection data
  const [inspectionData, setInspectionData] = useState<Partial<Inspection>>({
    transformer_data: transformerId,
    body_condition: '',
    arrester: '',
    drop_out: '',
    mv_bushing: '',
    mv_cable_lug: '',
    lv_bushing: '',
    lv_cable_lug: '',
    oil_level: '',
    insulation_level: '',
    fuse_link: '',
    horn_gap: '',
    silica_gel: '',
    has_linkage: '',
    arrester_body_ground: '',
    neutral_ground: '',
    status_of_mounting: '',
    mounting_condition: '',
    N_load_current: '',
    R_S_Voltage: '',
    R_T_Voltage: '',
    T_S_Voltage: '',
  });
  
  // State for LV feeders
  const [lvFeeders, setLvFeeders] = useState<Partial<LvFeeder>[]>([
    createEmptyLvFeeder()
  ]);
  
  // State for validation errors
  const [inspectionErrors, setInspectionErrors] = useState<Record<string, boolean>>({});
  const [feederErrors, setFeederErrors] = useState<Record<string, Record<string, boolean>>>({});
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Current step (0 = inspection, 1 = LV feeders)
  const [currentStep, setCurrentStep] = useState(0);
  
  // Function to create an empty LV feeder
  function createEmptyLvFeeder(): Partial<LvFeeder> {
    return {
      type_of_distribution_box: '',
      R_load_current: '',
      S_load_current: '',
      T_load_current: '',
      R_fuse_rating: '',
      S_fuse_rating: '',
      T_fuse_rating: '',
      temp_id: uuidv4(), // Temporary ID for tracking
    };
  }
  
  // Handle inspection field changes
  const handleInspectionChange = (field: keyof Inspection, value: any) => {
    setInspectionData(prev => ({ ...prev, [field]: value }));
    if (inspectionErrors[field]) {
      setInspectionErrors(prev => ({ ...prev, [field]: false }));
    }
  };
  
  // Handle LV feeder field changes
  const handleFeederChange = (index: number, field: keyof LvFeeder, value: any) => {
    const updatedFeeders = [...lvFeeders];
    // Create a new object instead of mutating the existing one
    updatedFeeders[index] = { 
      ...updatedFeeders[index], 
      [field]: value 
    };
    setLvFeeders(updatedFeeders);
    
    // Clear error if exists
    if (feederErrors[index]?.[field]) {
      const updatedErrors = { ...feederErrors };
      if (!updatedErrors[index]) {
        updatedErrors[index] = {};
      }
      updatedErrors[index] = { ...updatedErrors[index], [field]: false };
      setFeederErrors(updatedErrors);
    }
  };
  
  // Add a new LV feeder
  const addLvFeeder = () => {
    setLvFeeders(prev => [...prev, createEmptyLvFeeder()]);
  };
  
  // Remove an LV feeder
  const removeLvFeeder = (index: number) => {
    if (lvFeeders.length <= 1) {
      showToast('At least one LV feeder is required');
      return;
    }
    
    setLvFeeders(prev => prev.filter((_, i) => i !== index));
    
    // Remove errors for this feeder
    const updatedErrors = { ...feederErrors };
    delete updatedErrors[index];
    setFeederErrors(updatedErrors);
  };
  
  // Validate inspection data
  const validateInspection = () => {
    const newErrors: Record<string, boolean> = {};
    const requiredFields: (keyof Inspection)[] = [
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
      'T_S_Voltage',
    ];
    
    let hasError = false;
    requiredFields.forEach(field => {
      if (!inspectionData[field]) {
        newErrors[field] = true;
        hasError = true;
      }
    });
    
    setInspectionErrors(newErrors);
    return !hasError;
  };
  
  // Validate LV feeders
  const validateFeeders = () => {
    const newErrors: Record<string, Record<string, boolean>> = {};
    const requiredFields: (keyof LvFeeder)[] = [
      'type_of_distribution_box',
      'R_load_current',
      'S_load_current',
      'T_load_current',
      'R_fuse_rating',
      'S_fuse_rating',
      'T_fuse_rating',
    ];
    
    let hasError = false;
    lvFeeders.forEach((feeder, index) => {
      newErrors[index] = {};
      
      requiredFields.forEach(field => {
        if (!feeder[field]) {
          newErrors[index][field] = true;
          hasError = true;
        }
      });
    });
    
    setFeederErrors(newErrors);
    return !hasError;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 0) {
      if (validateInspection()) {
        setCurrentStep(1);
      } else {
        showToast('Please fill in all required inspection fields');
      }
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(0);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate both inspection and feeders
      const isInspectionValid = validateInspection();
      const areFeedersValid = validateFeeders();
      
      if (!isInspectionValid || !areFeedersValid) {
        showToast('Please fill in all required fields');
        return;
      }
      
      setLoading(true);
      
      // Generate a temporary ID for the inspection
      const tempInspectionId = uuidv4();
      
      // Calculate voltage phase unbalance and average voltage
      const rs = parseFloat(inspectionData.R_S_Voltage?.toString() || '0');
      const rt = parseFloat(inspectionData.R_T_Voltage?.toString() || '0');
      const ts = parseFloat(inspectionData.T_S_Voltage?.toString() || '0');
      
      const avgVoltage = ((rs + rt + ts) / 3).toFixed(2);
      
      // Calculate voltage unbalance using the formula: 
      // (max deviation from average / average) * 100
      const maxDeviation = Math.max(
        Math.abs(rs - avgVoltage), 
        Math.abs(rt - avgVoltage), 
        Math.abs(ts - avgVoltage)
      );
      const voltageUnbalance = (100 - ((maxDeviation / avgVoltage) * 100)).toFixed(2);
      
      // Prepare inspection data with LV feeders in the required format
      const data =  {
          body_condition: inspectionData.body_condition,
          arrester: inspectionData.arrester,
          drop_out: inspectionData.drop_out,
          fuse_link: inspectionData.fuse_link,
          mv_bushing: inspectionData.mv_bushing,
          mv_cable_lug: inspectionData.mv_cable_lug,
          lv_bushing: inspectionData.lv_bushing,
          lv_cable_lug: inspectionData.lv_cable_lug,
          oil_level: inspectionData.oil_level,
          insulation_level: null, // Not included in the form
          horn_gap: inspectionData.horn_gap,
          silica_gel: inspectionData.silica_gel,
          has_linkage: inspectionData.has_linkage,
          arrester_body_ground: inspectionData.arrester_body_ground,
          neutral_ground: inspectionData.neutral_ground,
          status_of_mounting: inspectionData.status_of_mounting,
          mounting_condition: inspectionData.mounting_condition,
          N_load_current: inspectionData.N_load_current,
          R_S_Voltage: inspectionData.R_S_Voltage,
          R_T_Voltage: inspectionData.R_T_Voltage,
          T_S_Voltage: inspectionData.T_S_Voltage,
          transformer_data: transformerId,
          lvfeeders: lvFeeders.map(feeder => ({
            type_of_distribution_box: feeder.type_of_distribution_box,
            R_load_current: feeder.R_load_current,
            S_load_current: feeder.S_load_current,
            T_load_current: feeder.T_load_current,
            R_fuse_rating: feeder.R_fuse_rating,
            S_fuse_rating: feeder.S_fuse_rating,
            T_fuse_rating: feeder.T_fuse_rating
          }))
        };
      
      // // Store inspection in offline storage
      // await storageService.addToSyncQueue({
      //   endpoint: '/api/transformer/offlineinspection',
      //   method: 'POST',
      //   title: 'Create Offline Inspection',
      //   data: JSON.stringify(inspectionPayload),
      //   timestamp: Date.now(),
      //   status: 'pending',
      //   retryCount: 0,
      // });

      console.log("KKKKKKKKKKKKKKKKKKKKKKKKKK,", data);

      await syncService.addToQueue({
        endpoint: '/api/transformer/create-inspection-with-feeders/',
        method: 'POST',
        title: 'Create Inspection with LV Feeders',
        data,
      });

      
      // Update UI with new data
      onDataChange({
        ...inspectionData,
        id: tempInspectionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_offline_created: true,
      } as Inspection, false);
      
      showToast('Inspection and LV feeders saved for sync');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving offline inspection:', error);
      showToast('Failed to save inspection data');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setInspectionData({
      transformer_data: transformerId,
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
      N_load_current: '',
      R_S_Voltage: '',
      R_T_Voltage: '',
      T_S_Voltage: '',
    });
    setLvFeeders([createEmptyLvFeeder()]);
    setInspectionErrors({});
    setFeederErrors({});
    setCurrentStep(0);
  };
  
  // Handle close
  const handleClose = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => {
            resetForm();
            onClose();
          }
        },
      ]
    );
  };
  
  // Render inspection form
  const renderInspectionForm = () => (
    <ScrollView style={styles.form}>
      {/* Body Condition */}
      <View style={styles.formField}>
        <RequiredLabel text="Body Condition" />
        <View style={[
          styles.pickerContainer,
          inspectionErrors.body_condition && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.body_condition}
            onValueChange={(value) => handleInspectionChange('body_condition', value)}
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

      {/* Arrester */}
      <View style={styles.formField}>
        <RequiredLabel text="Arrester" />
        <View style={[
          styles.pickerContainer,
          inspectionErrors.arrester && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.arrester}
            onValueChange={(value) => handleInspectionChange('arrester', value)}
            style={styles.picker}
          >
            <Picker.Item 
              label="Select Arrester Status" 
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
          inspectionErrors.drop_out && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.drop_out}
            onValueChange={(value) => handleInspectionChange('drop_out', value)}
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

      {/* MV Bushing */}
      <View style={styles.formField}>
        <RequiredLabel text="MV Bushing" />
        <View style={[
          styles.pickerContainer,
          inspectionErrors.mv_bushing && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.mv_bushing}
            onValueChange={(value) => handleInspectionChange('mv_bushing', value)}
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
          inspectionErrors.mv_cable_lug && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.mv_cable_lug}
            onValueChange={(value) => handleInspectionChange('mv_cable_lug', value)}
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
          inspectionErrors.lv_bushing && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.lv_bushing}
            onValueChange={(value) => handleInspectionChange('lv_bushing', value)}
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
          inspectionErrors.lv_cable_lug && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.lv_cable_lug}
            onValueChange={(value) => handleInspectionChange('lv_cable_lug', value)}
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
          inspectionErrors.oil_level && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.oil_level}
            onValueChange={(value) => handleInspectionChange('oil_level', value)}
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
            selectedValue={inspectionData.insulation_level}
            onValueChange={(value) =>
              handleInspectionChange('insulation_level', value)
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

      {/* Fuse Link */}
      <View style={styles.formField}>
        <RequiredLabel text="Fuse Link" />
        <View style={[
          styles.pickerContainer,
          inspectionErrors.fuse_link && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.fuse_link}
            onValueChange={(value) => handleInspectionChange('fuse_link', value)}
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

      {/* Horn Gap */}
      <View style={styles.formField}>
        <RequiredLabel text="Horn Gap" />
        <View style={[
          styles.pickerContainer,
          inspectionErrors.horn_gap && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.horn_gap}
            onValueChange={(value) => handleInspectionChange('horn_gap', value)}
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
          inspectionErrors.silica_gel && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.silica_gel}
            onValueChange={(value) => handleInspectionChange('silica_gel', value)}
            style={styles.picker}
          >
            <Picker.Item 
              label="Select Silica Gel Condition" 
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

      {/* Has Linkage */}
      <View style={styles.formField}>
        <RequiredLabel text="Has Linkage" />
        <View style={[
          styles.pickerContainer,
          inspectionErrors.has_linkage && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.has_linkage}
            onValueChange={(value) => handleInspectionChange('has_linkage', value)}
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

      {/* Arrester Body Ground */}
      <View style={styles.formField}>
        <RequiredLabel text="Arrester Body Ground" />
        <View style={[
          styles.pickerContainer,
          inspectionErrors.arrester_body_ground && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.arrester_body_ground}
            onValueChange={(value) => handleInspectionChange('arrester_body_ground', value)}
            style={styles.picker}
          >
            <Picker.Item 
              label="Select Arrester Body Ground" 
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
          inspectionErrors.neutral_ground && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.neutral_ground}
            onValueChange={(value) => handleInspectionChange('neutral_ground', value)}
            style={styles.picker}
          >
            <Picker.Item 
              label="Select Neutral Ground" 
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
          inspectionErrors.status_of_mounting && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.status_of_mounting}
            onValueChange={(value) => handleInspectionChange('status_of_mounting', value)}
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
          inspectionErrors.mounting_condition && styles.inputError
        ]}>
          <Picker
            selectedValue={inspectionData.mounting_condition}
            onValueChange={(value) => handleInspectionChange('mounting_condition', value)}
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

      {/* Numeric fields */}
      <View style={styles.formField}>
        <RequiredLabel text="N Load Current (A)" />
        <TextInput
          value={inspectionData.N_load_current?.toString()}
          onChangeText={(value) => handleInspectionChange('N_load_current', value)}
          keyboardType="numeric"
          style={[
            styles.input,
            inspectionErrors.N_load_current && styles.inputError
          ]}
          mode="outlined"
          outlineColor="#e1e1e1"
          activeOutlineColor="#1890ff"
          dense={true}
        />
      </View>
      
      <View style={styles.formField}>
        <RequiredLabel text="R-S Voltage (V)" />
        <TextInput
          value={inspectionData.R_S_Voltage?.toString()}
          onChangeText={(value) => handleInspectionChange('R_S_Voltage', value)}
          keyboardType="numeric"
          style={[
            styles.input,
            inspectionErrors.R_S_Voltage && styles.inputError
          ]}
          mode="outlined"
          outlineColor="#e1e1e1"
          activeOutlineColor="#1890ff"
          dense={true}
        />
      </View>
      
      <View style={styles.formField}>
        <RequiredLabel text="R-T Voltage (V)" />
        <TextInput
          value={inspectionData.R_T_Voltage?.toString()}
          onChangeText={(value) => handleInspectionChange('R_T_Voltage', value)}
          keyboardType="numeric"
          style={[
            styles.input,
            inspectionErrors.R_T_Voltage && styles.inputError
          ]}
          mode="outlined"
          outlineColor="#e1e1e1"
          activeOutlineColor="#1890ff"
          dense={true}
        />
      </View>
      
      <View style={styles.formField}>
        <RequiredLabel text="T-S Voltage (V)" />
        <TextInput
          value={inspectionData.T_S_Voltage?.toString()}
          onChangeText={(value) => handleInspectionChange('T_S_Voltage', value)}
          keyboardType="numeric"
          style={[
            styles.input,
            inspectionErrors.T_S_Voltage && styles.inputError
          ]}
          mode="outlined"
          outlineColor="#e1e1e1"
          activeOutlineColor="#1890ff"
          dense={true}
        />
      </View>
    </ScrollView>
  );
  
  // Render LV feeders form
  const renderLvFeedersForm = () => (
    <ScrollView style={styles.form}>
      <Text style={styles.sectionTitle}>LV Feeders</Text>
      
      {lvFeeders.map((feeder, index) => (
        <View key={feeder.temp_id} style={styles.feederContainer}>
          <View style={styles.feederHeader}>
            <Text style={styles.feederTitle}>Feeder #{index + 1}</Text>
            {lvFeeders.length > 1 && (
              <TouchableOpacity 
                onPress={() => removeLvFeeder(index)}
                style={styles.removeButton}
              >
                <Icon name="delete" size={20} color="#f44336" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Distribution Box Type */}
          <View style={styles.formField}>
            <RequiredLabel text="Distribution Box" />
            <View style={[
              styles.pickerContainer,
              feederErrors[index]?.type_of_distribution_box && styles.inputError
            ]}>
              <Picker
                selectedValue={feeder.type_of_distribution_box}
                onValueChange={(value) => handleFeederChange(index, 'type_of_distribution_box', value)}
                style={styles.picker}
              >
                <Picker.Item 
                  label="Select Distribution Box" 
                  value="" 
                  enabled={false}
                  style={{ color: '#666' }}
                />
                {DISTRIBUTION_BOX_TYPES.map(option => (
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
          
          {/* Load Current Fields */}
          {['R', 'S', 'T'].map((phase) => (
            <View key={`${phase}_load_current`} style={styles.formField}>
              <RequiredLabel text={`${phase} Load Current (A)`} />
              <TextInput
                value={feeder[`${phase}_load_current` as keyof LvFeeder]?.toString()}
                onChangeText={(value) => handleFeederChange(index, `${phase}_load_current` as keyof LvFeeder, value)}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                error={!!feederErrors[index]?.[`${phase}_load_current` as keyof LvFeeder]}
              />
            </View>
          ))}
          
          {/* Fuse Rating Fields */}
          {['R', 'S', 'T'].map((phase) => (
            <View key={`${phase}_fuse_rating`} style={styles.formField}>
              <RequiredLabel text={`${phase} Fuse Rating (A)`} />
              <TextInput
                value={feeder[`${phase}_fuse_rating` as keyof LvFeeder]?.toString()}
                onChangeText={(value) => handleFeederChange(index, `${phase}_fuse_rating` as keyof LvFeeder, value)}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                error={!!feederErrors[index]?.[`${phase}_fuse_rating` as keyof LvFeeder]}
              />
            </View>
          ))}
        </View>
      ))}
      
      {/* Add Feeder Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={addLvFeeder}
      >
        <Icon name="add-circle" size={20} color="#2196F3" />
        <Text style={styles.addButtonText}>Add Another Feeder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {currentStep === 0 ? 'Add Offline Inspection' : 'Add LV Feeders'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <View style={[
              styles.stepDot,
              currentStep === 0 && styles.activeStepDot
            ]} />
            <View style={styles.stepLine} />
            <View style={[
              styles.stepDot,
              currentStep === 1 && styles.activeStepDot
            ]} />
          </View>
          
          {/* Form content based on current step */}
          {currentStep === 0 ? renderInspectionForm() : renderLvFeedersForm()}
          
          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {currentStep === 1 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handlePrevStep}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            {currentStep === 0 ? (
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={handleNextStep}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '90%',
    maxHeight: '90%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  activeStepDot: {
    backgroundColor: '#2196F3',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
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
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#9e9e9e',
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#2196F3',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  feederContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  feederHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feederTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});






