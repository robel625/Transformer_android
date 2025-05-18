import React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

// Constants
const CONDITIONS = ['Good', 'Fair', 'Poor'];
const STATUS_OPTIONS = ['Ok', 'one missed', 'two missed', 'all missed'];
const AVAILABILITY_OPTIONS = ['Available', 'Not Available'];
const HORN_GAP_OPTIONS = ['Good', 'Poor'];
const LINKAGE_OPTIONS = ['Yes', 'No'];

interface InspectionFormProps {
  inspectionData: any;
  errors: Record<string, boolean>;
  handleInspectionChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  loading: boolean;
}

export const InspectionForm: React.FC<InspectionFormProps> = ({
  inspectionData,
  errors,
  handleInspectionChange,
  onNext,
  onPrevious,
  loading,
}) => {
  return (
    <ScrollView style={styles.form}>
      {/* Body Condition */}
      <RequiredLabel text="Body Condition" />
      <View style={[styles.pickerContainer, errors.body_condition && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.body_condition}
          onValueChange={(value) => handleInspectionChange('body_condition', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Body Condition" value="" enabled={false} style={{ color: '#666' }} />
          {CONDITIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Arrester */}
      <RequiredLabel text="Arrester" />
      <View style={[styles.pickerContainer, errors.arrester && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.arrester}
          onValueChange={(value) => handleInspectionChange('arrester', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Arrester Status" value="" enabled={false} style={{ color: '#666' }} />
          {STATUS_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Drop Out */}
      <RequiredLabel text="Drop Out" />
      <View style={[styles.pickerContainer, errors.drop_out && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.drop_out}
          onValueChange={(value) => handleInspectionChange('drop_out', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Drop Out Status" value="" enabled={false} style={{ color: '#666' }} />
          {STATUS_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* MV Bushing */}
      <RequiredLabel text="MV Bushing" />
      <View style={[styles.pickerContainer, errors.mv_bushing && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.mv_bushing}
          onValueChange={(value) => handleInspectionChange('mv_bushing', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select MV Bushing Status" value="" enabled={false} style={{ color: '#666' }} />
          {STATUS_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* MV Cable Lug */}
      <RequiredLabel text="MV Cable Lug" />
      <View style={[styles.pickerContainer, errors.mv_cable_lug && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.mv_cable_lug}
          onValueChange={(value) => handleInspectionChange('mv_cable_lug', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select MV Cable Lug Status" value="" enabled={false} style={{ color: '#666' }} />
          {STATUS_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* LV Bushing */}
      <RequiredLabel text="LV Bushing" />
      <View style={[styles.pickerContainer, errors.lv_bushing && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.lv_bushing}
          onValueChange={(value) => handleInspectionChange('lv_bushing', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select LV Bushing Status" value="" enabled={false} style={{ color: '#666' }} />
          {STATUS_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* LV Cable Lug */}
      <RequiredLabel text="LV Cable Lug" />
      <View style={[styles.pickerContainer, errors.lv_cable_lug && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.lv_cable_lug}
          onValueChange={(value) => handleInspectionChange('lv_cable_lug', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select LV Cable Lug Status" value="" enabled={false} style={{ color: '#666' }} />
          {STATUS_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Oil Level */}
      <RequiredLabel text="Oil Level" />
      <View style={[styles.pickerContainer, errors.oil_level && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.oil_level}
          onValueChange={(value) => handleInspectionChange('oil_level', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Oil Level" value="" enabled={false} style={{ color: '#666' }} />
          {['Full', '0.75', '0.5', '0.25'].map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Fuse Link */}
      <RequiredLabel text="Fuse Link" />
      <View style={[styles.pickerContainer, errors.fuse_link && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.fuse_link}
          onValueChange={(value) => handleInspectionChange('fuse_link', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Fuse Link Status" value="" enabled={false} style={{ color: '#666' }} />
          {STATUS_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Horn Gap */}
      <RequiredLabel text="Horn Gap" />
      <View style={[styles.pickerContainer, errors.horn_gap && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.horn_gap}
          onValueChange={(value) => handleInspectionChange('horn_gap', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Horn Gap Status" value="" enabled={false} style={{ color: '#666' }} />
          {HORN_GAP_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Silica Gel */}
      <RequiredLabel text="Silica Gel" />
      <View style={[styles.pickerContainer, errors.silica_gel && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.silica_gel}
          onValueChange={(value) => handleInspectionChange('silica_gel', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Silica Gel Condition" value="" enabled={false} style={{ color: '#666' }} />
          {CONDITIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Has Linkage */}
      <RequiredLabel text="Has Linkage" />
      <View style={[styles.pickerContainer, errors.has_linkage && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.has_linkage}
          onValueChange={(value) => handleInspectionChange('has_linkage', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Linkage Status" value="" enabled={false} style={{ color: '#666' }} />
          {LINKAGE_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Arrester Body Ground */}
      <RequiredLabel text="Arrester Body Ground" />
      <View style={[styles.pickerContainer, errors.arrester_body_ground && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.arrester_body_ground}
          onValueChange={(value) => handleInspectionChange('arrester_body_ground', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Arrester Body Ground" value="" enabled={false} style={{ color: '#666' }} />
          {AVAILABILITY_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Neutral Ground */}
      <RequiredLabel text="Neutral Ground" />
      <View style={[styles.pickerContainer, errors.neutral_ground && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.neutral_ground}
          onValueChange={(value) => handleInspectionChange('neutral_ground', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Neutral Ground" value="" enabled={false} style={{ color: '#666' }} />
          {AVAILABILITY_OPTIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Status of Mounting */}
      <RequiredLabel text="Status of Mounting" />
      <View style={[styles.pickerContainer, errors.status_of_mounting && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.status_of_mounting}
          onValueChange={(value) => handleInspectionChange('status_of_mounting', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Status of Mounting" value="" enabled={false} style={{ color: '#666' }} />
          {CONDITIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* Mounting Condition */}
      <RequiredLabel text="Mounting Condition" />
      <View style={[styles.pickerContainer, errors.mounting_condition && styles.inputError]}>
        <Picker
          selectedValue={inspectionData.mounting_condition}
          onValueChange={(value) => handleInspectionChange('mounting_condition', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Mounting Condition" value="" enabled={false} style={{ color: '#666' }} />
          {CONDITIONS.map(option => (
            <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
          ))}
        </Picker>
      </View>

      {/* N Load Current */}
      <RequiredLabel text="N Load Current (A)" />
      <TextInput
        value={inspectionData.N_load_current?.toString()}
        onChangeText={(value) => handleInspectionChange('N_load_current', value)}
        keyboardType="numeric"
        style={[styles.input, errors.N_load_current && styles.inputError]}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />

      {/* R-S Voltage */}
      <RequiredLabel text="R-S Voltage (V)" />
      <TextInput
        value={inspectionData.R_S_Voltage?.toString()}
        onChangeText={(value) => handleInspectionChange('R_S_Voltage', value)}
        keyboardType="numeric"
        style={[styles.input, errors.R_S_Voltage && styles.inputError]}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />

      {/* R-T Voltage */}
      <RequiredLabel text="R-T Voltage (V)" />
      <TextInput
        value={inspectionData.R_T_Voltage?.toString()}
        onChangeText={(value) => handleInspectionChange('R_T_Voltage', value)}
        keyboardType="numeric"
        style={[styles.input, errors.R_T_Voltage && styles.inputError]}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />

      {/* T-S Voltage */}
      <RequiredLabel text="T-S Voltage (V)" />
      <TextInput
        value={inspectionData.T_S_Voltage?.toString()}
        onChangeText={(value) => handleInspectionChange('T_S_Voltage', value)}
        keyboardType="numeric"
        style={[styles.input, errors.T_S_Voltage && styles.inputError]}
        mode="outlined"
        outlineColor="#e1e1e1"
        activeOutlineColor="#1890ff"
        dense={true}
      />
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
});