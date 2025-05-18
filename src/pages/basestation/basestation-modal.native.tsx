import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import type { Basestation } from '@/types/entity';
import { STATION_TYPES } from '@/types/entity';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';
import { useOrgStore } from '@/store/useOrgStore';
import { GPSLocationInput } from '@/components/GPSLocationInput';

const RequiredLabel = ({ text }: { text: string }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.label}>{text}</Text>
    <Text style={styles.required}>*</Text>
  </View>
);

export interface BasestationModalProps {
  title: string;
  show: boolean;
  formValue: Basestation;
  onOk: () => void;
  onCancel: () => void;
  onDataChange: (newData: Basestation, isEdit: boolean) => void;
}

export function BasestationModal({ title, show, formValue, onOk, onCancel, onDataChange }: BasestationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Basestation>>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  
  // Replace state with store
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

  // Load regions on component mount
  useEffect(() => {
      fetchRegions().catch(error => {
        // Don't show error toast if we're using persisted data
        if (!regions.length) {
          showToast('No data available - please connect to internet');
        }
      });
    }, []);

  // Add this effect to load initial data when editing
  useEffect(() => {
    if (title === "Edit Basestation" && formValue) {
      setFormData(formValue);
      const selectedRegion = regions.find(region => region.name === formValue.region);
      if (selectedRegion) {
        setSelectedCSCs(selectedRegion.csc_centers);
        setSelectedSubstations(selectedRegion.substations);
        
        const substation = selectedRegion.substations.find(
          (sub: any) => sub.name === formValue.substation
        );
        if (substation) {
          setSelectedFeeders(substation.feeders || []);
        }
      }
    }
  }, [title, formValue, regions]);

  // Handle region selection
  const handleRegionChange = (regionCode: string) => {
    const selectedRegion = regions.find(region => region.csc_code === regionCode);
    if (selectedRegion) {
      setSelectedCSCs(selectedRegion.csc_centers);
      setSelectedSubstations(selectedRegion.substations);
      setFormData(prev => ({
        ...prev,
        region: selectedRegion.name,
        csc: undefined,
        substation: undefined,
        feeder: undefined,
      }));
    }
  };

  // Handle substation selection
  const handleSubstationChange = (substationName: string) => {
    const selectedRegion = regions.find(region => 
      region.substations.some((sub: any) => sub.name === substationName)
    );
    
    if (selectedRegion) {
      const substation = selectedRegion.substations.find(
        (sub: any) => sub.name === substationName
      );
      if (substation) {
        setSelectedFeeders(substation.feeders || []);
        setFormData(prev => ({
          ...prev,
          substation: substationName,
          feeder: undefined,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newErrors: Record<string, any> = {};
      
      if (title === "Create New Basestation") {
        if (!formData.region || !formData.csc || !formData.substation || 
            !formData.feeder || !formData.address || !formData.gps_location || 
            !formData.station_type) {
          showToast('Please fill in all required fields');
          return;
        }
        const response = await transformerService.createBasestation(formData as Basestation);
        console.log("createBasestation response", response);
        if (response) {
          showToast('Base Station created successfully');
          onDataChange(response, false);
          setFormData({});
          setErrors({}); // Clear errors
          onOk();
        }
      } else if (title === "Edit Basestation") {
        if (!formValue?.station_code) {
          showToast('Invalid station code');
          return;
        }

        // Validate reason field
        if (!formData.reason || formData.reason.trim().length < 10) {
          newErrors.reason = "Reason must be at least 10 characters long";
          setErrors(newErrors);
          showToast('Please provide a valid reason for the update');
          return;
        }
        
        await transformerService.updateBasestation(formValue.station_code, formData as Partial<Basestation>);
        onDataChange({ ...formValue, ...formData }, true);
        showToast('Base Station updated successfully');
        setFormData({});
        setErrors({}); // Clear errors
        onOk();
      }
    } catch (error: any) {
      console.error('Operation failed:', error);
      showToast(error?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Also clear form data and errors when modal is closed
  const handleCancel = () => {
    setFormData({});
    setErrors({});
    onCancel();
  };

  return (
    <Modal
      visible={show}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}  // Updated to use handleCancel
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.form}>
            {/* Region Select */}
            <Text style={styles.label}>Region</Text>
            <Picker
              selectedValue={formData.region}
              onValueChange={handleRegionChange}
              enabled={title !== "Edit Basestation"}
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

            {/* CSC Select */}
            <Text style={styles.label}>CSC</Text>
            <Picker
              selectedValue={formData.csc}
              onValueChange={(value) => setFormData(prev => ({ ...prev, csc: value }))}
              enabled={title !== "Edit Basestation"}
              style={styles.picker}
            >
              <Picker.Item label="Select CSC" value="" />
              {selectedCSCs?.map(csc => (
                <Picker.Item
                  key={csc.csc_code}
                  label={csc.name}
                  value={csc.name}
                />
              )) || []}
            </Picker>

            {/* Substation Select */}
            <Text style={styles.label}>Substation</Text>
            <Picker
              selectedValue={formData.substation}
              onValueChange={handleSubstationChange}
              style={styles.picker}
            >
              <Picker.Item label="Select Substation" value="" />
              {selectedSubstations?.map((sub: any) => (
                <Picker.Item
                  key={sub.id}
                  label={sub.name}
                  value={sub.name}
                />
              )) || []}
            </Picker>

            {/* Feeder Select */}
            <Text style={styles.label}>Feeder</Text>
            <Picker
              selectedValue={formData.feeder}
              onValueChange={(value) => setFormData(prev => ({ ...prev, feeder: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Select Feeder" value="" />
              {selectedFeeders?.map((feeder: any) => (
                <Picker.Item
                  key={feeder.id}
                  label={feeder.feeder_name}
                  value={feeder.feeder_name}
                />
              )) || []}
            </Picker>

            {/* Address */}
            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={value => setFormData(prev => ({ ...prev, address: value }))}
              style={styles.input}
              multiline
            />

            {/* GPS Location */}
            <GPSLocationInput
              value={formData.gps_location || ''}
              onChange={value => setFormData(prev => ({ ...prev, gps_location: value }))}
              style={styles.input}
            />

            {/* Station Type Picker */}
            <Text style={styles.label}>Station Type</Text>
            <Picker
              selectedValue={formData.station_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, station_type: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Select Station Type" value="" />
              {STATION_TYPES?.map((type) => (
                <Picker.Item
                  key={type}
                  label={type}
                  value={type}
                />
              ))}
            </Picker>
          </ScrollView>


          {title === "Edit Basestation" && (
            <View style={styles.formField}>
              <RequiredLabel text="Reason for Update" />
              <TextInput
                mode="outlined"
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
                numberOfLines={4}
                outlineColor="#e1e1e1"
                activeOutlineColor="#1890ff"
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleCancel}  // Updated to use handleCancel
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
              {loading ? 'Saving...' : 'Save'}
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
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    // flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  picker: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    marginLeft: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  required: {
    color: '#ff4d4f',
    marginLeft: 2,
  },

  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1,
    backgroundColor: '#fff8f8',
  },
});











