import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Button } from 'react-native-paper';
import { showToast } from '@/util/action';
import { v4 as uuidv4 } from 'uuid';
import { syncService } from '@/services';

// Import your three form steps
import { TransformerForm } from './steps/TransformerForm'; // Update path accordingly
import { InspectionForm } from './steps/InspectionForm';   // Update path accordingly
import { LvFeederForm } from './steps/LvFeederForm';       // Update path accordingly

interface OfflineTransformerModalProps {
  visible: boolean;
  transformerId?: string;
  onClose: () => void;
  onDataChange: (newData: any, isEdit: boolean) => void;
}

export const OfflineTransformerModal: React.FC<OfflineTransformerModalProps> = ({
  visible,
  transformerId,
  onClose,
  onDataChange,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Initial state for forms
  const [transformerData, setTransformerData] = useState<any>({});
  const [inspectionData, setInspectionData] = useState<any>({});
  const [feedersData, setFeedersData] = useState<any[]>([{}]);

  const [transformerErrors, setTransformerErrors] = useState<Record<string, boolean>>({});
  const [inspectionErrors, setInspectionErrors] = useState<Record<string, boolean>>({});
  const [feederErrors, setFeederErrors] = useState<Record<string, Record<string, boolean>>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setTransformerData({});
    setInspectionData({});
    setFeedersData([{}]);
    setTransformerErrors({});
    setInspectionErrors({});
    setFeederErrors({});
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep === 0 && validateTransformer()) {
      setCurrentStep(1);
    } else if (currentStep === 1 && validateInspection()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateTransformer = () => {
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
    let hasError = false;
    const newErrors: Record<string, boolean> = {};
    requiredFields.forEach((field) => {
      if (!transformerData[field]) {
        newErrors[field] = true;
        hasError = true;
      }
    });
    setTransformerErrors(newErrors);
    if (hasError) {
      showToast('Please fill all required transformer fields');
    }
    return !hasError;
  };

  const validateInspection = () => {
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
      'T_S_Voltage',
    ];
    let hasError = false;
    const newErrors: Record<string, boolean> = {};
    requiredFields.forEach((field) => {
      if (!inspectionData[field]) {
        newErrors[field] = true;
        hasError = true;
      }
    });
    setInspectionErrors(newErrors);
    if (hasError) {
      showToast('Please fill all required inspection fields');
    }
    return !hasError;
  };

  const validateFeeders = () => {
    let hasError = false;
    const newErrors: Record<string, Record<string, boolean>> = {};
    feedersData.forEach((feeder, index) => {
      const feederErrors: Record<string, boolean> = {};
      const requiredFields = [
        'type_of_distribution_box',
        'R_load_current',
        'S_load_current',
        'T_load_current',
        'R_fuse_rating',
        'S_fuse_rating',
        'T_fuse_rating',
      ];
      requiredFields.forEach((field) => {
        if (!feeder[field]) {
          feederErrors[field] = true;
          hasError = true;
        }
      });
      if (Object.keys(feederErrors).length > 0) {
        newErrors[index] = feederErrors;
      }
    });
    setFeederErrors(newErrors);
    if (hasError) {
      showToast('Please fill all required LV Feeder fields');
    }
    return !hasError;
  };

  const handleSubmit = async () => {
    if (!validateTransformer() || !validateInspection() || !validateFeeders()) {
      return;
    }

    try {
      setLoading(true);
      const tempId = uuidv4();

      const submissionData = {
        trafo_type: transformerData.trafo_type,
        capacity: transformerData.capacity,
        dt_number: transformerData.dt_number,
        primary_voltage: transformerData.primary_voltage,
        colling_type: transformerData.colling_type,
        serial_number: transformerData.serial_number,
        service_type: transformerData.service_type,
        status: transformerData.status,
        manufacturer: transformerData.manufacturer,
        vector_group: transformerData.vector_group,
        impedance_voltage: transformerData.impedance_voltage,
        winding_weight: transformerData.winding_weight,
        oil_weight: transformerData.oil_weight,
        year_of_manufacturing: transformerData.year_of_manufacturing,
        date_of_installation: transformerData.date_of_installation,
        basestation: transformerData.basestation,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        inspection_data: {
          body_condition: inspectionData.body_condition,
          arrester: inspectionData.arrester,
          drop_out: inspectionData.drop_out,
          mv_bushing: inspectionData.mv_bushing,
          mv_cable_lug: inspectionData.mv_cable_lug,
          lv_bushing: inspectionData.lv_bushing,
          lv_cable_lug: inspectionData.lv_cable_lug,
          oil_level: inspectionData.oil_level,
          fuse_link: inspectionData.fuse_link,
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
          transformer_data: tempId,
          lvfeeders: feedersData,
        },
      };

      await syncService.addToQueue({
        endpoint: '/api/transformer/process-transformer-offline/',
        method: 'POST',
        title: 'Create Offline Transformer',
        data: submissionData,
      });

      onDataChange(submissionData, false);
      showToast('Transformer saved for sync');
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast(error.message || 'Failed to submit data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, currentStep >= 0 && styles.activeStep]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, currentStep >= 1 && styles.activeStep]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, currentStep >= 2 && styles.activeStep]} />
          </View>

          {/* Form Steps */}
          {currentStep === 0 && (
            <TransformerForm
              transformerData={transformerData}
              errors={transformerErrors}
              handleTransformerChange={setTransformerData}
              onNext={handleNext}
              onPrevious={onClose}
              loading={loading}
            />
          )}

          {currentStep === 1 && (
            <InspectionForm
              inspectionData={inspectionData}
              errors={inspectionErrors}
              handleInspectionChange={setInspectionData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              loading={loading}
            />
          )}

          {currentStep === 2 && (
            <LvFeederForm
              feeders={feedersData}
              errors={feederErrors}
              handleFeederChange={(index, field, value) => {
                const updated = [...feedersData];
                updated[index] = { ...updated[index], [field]: value };
                setFeedersData(updated);
              }}
              addFeeder={() => setFeedersData([...feedersData, {}])}
              removeFeeder={(index) => {
                const updated = [...feedersData];
                updated.splice(index, 1);
                setFeedersData(updated);
              }}
              onSubmit={handleSubmit}
              onPrevious={handlePrevious}
              loading={loading}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: '#1890ff',
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});