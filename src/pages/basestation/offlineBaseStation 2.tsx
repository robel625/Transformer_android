// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { TextInput, Button } from 'react-native-paper';
// import { Picker } from '@react-native-picker/picker';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { showToast } from '@/util/action';
// import type { Transformer, Inspection, LvFeeder } from '@/types/entity';
// import 'react-native-get-random-values';
// import { v4 as uuidv4 } from 'uuid';
// import { syncService } from '@/services';

// // Constants for dropdown options
// const TRANSFORMER_TYPES = ['Conservator', 'Hermatical', 'Compact'];
// const CAPACITIES = ['10', '25', '50', '100', '200', '315', '400', '500', '630', '800', '1250', '2500'];
// const PRIMARY_VOLTAGES = ['15', '19', '33'];
// const COOLING_TYPES = ['ONAN', 'Dry Type'];
// const MANUFACTURERS = [
//   'ABB Tanzania', 'Apex', 'China Natinal Electric wire and cable Imp/Exp corporations', 'Iran Transformer',
//   'Kobera', 'Koncar', "Mar son's", 'METEC'
// ];
// const SERVICE_TYPES = ['Dedicated', 'Public'];
// const STATUSES = ['New', 'Maintained'];
// const VECTOR_GROUPS = ['DY1', 'DY5', 'DY11', 'Other'];


// const CONDITIONS = ['Good', 'Fair', 'Poor'];
// const STATUS_OPTIONS = ['Ok', 'one missed', 'two missed', 'all missed'];
// const DISTRIBUTION_BOX_TYPES = ['Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5'];
// const OIL_LEVEL_OPTIONS = ['Full', '0.75', '0.5','0.25'];
// const HORN_GAP_OPTIONS = ['Good', 'Poor'];
// const LINKAGE_OPTIONS = ['Yes', 'No'];
// const AVAILABILITY_OPTIONS = ['Available', 'Not Available'];
// const INSULATION_OPTIONS = ['Acceptable', 'Not Acceptable'];

// // Component for required field label
// const RequiredLabel = ({ text }: { text: string }) => (
//   <View style={styles.labelContainer}>
//     <Text style={styles.label}>{text}</Text>
//     <Text style={styles.required}>*</Text>
//   </View>
// );

// // Helper function to create an empty LV feeder
// const createEmptyLvFeeder = (): Partial<LvFeeder> => ({
//   type_of_distribution_box: '',
//   R_load_current: '',
//   S_load_current: '',
//   T_load_current: '',
//   R_fuse_rating: '',
//   S_fuse_rating: '',
//   T_fuse_rating: '',
// });

// interface OfflineTransformerModalProps {
//   visible: boolean;
//   transformerId?: string;
//   onClose: () => void;
//   onDataChange: (newData: Transformer, isEdit: boolean) => void;
// }

// export function OfflineTransformerModal({
//   visible,
//   transformerId,
//   onClose,
//   onDataChange,
// }: OfflineTransformerModalProps) {
//   // State for transformer data
//   const [transformerData, setTransformerData] = useState<Partial<Transformer>>({
//     basestation: '',
//     trafo_type: '',
//     capacity: '',
//     dt_number: '',
//     primary_voltage: '',
//     colling_type: '',
//     serial_number: '',
//     manufacturer: '',
//     service_type: '',
//     status: '',
//     vector_group: '',
//     impedance_voltage: '',
//     winding_weight: '',
//     oil_weight: '',
//     year_of_manufacturing: '',
//     date_of_installation: '',
//   });
  
//   // State for inspection data
//   const [inspectionData, setInspectionData] = useState<Partial<Inspection>>({
//     transformer_data: transformerId,
//     body_condition: '',
//     arrester: '',
//     drop_out: '',
//     mv_bushing: '',
//     mv_cable_lug: '',
//     lv_bushing: '',
//     lv_cable_lug: '',
//     oil_level: '',
//     fuse_link: '',
//     horn_gap: '',
//     silica_gel: '',
//     has_linkage: '',
//     arrester_body_ground: '',
//     neutral_ground: '',
//     status_of_mounting: '',
//     mounting_condition: '',
//     N_load_current: '',
//     R_S_Voltage: '',
//     R_T_Voltage: '',
//     T_S_Voltage: '',
//   });
  
//   // State for LV feeders
//   const [lvFeeders, setLvFeeders] = useState<Partial<LvFeeder>[]>([createEmptyLvFeeder()]);
  
//   // State for validation errors
//   const [transformerErrors, setTransformerErrors] = useState<Record<string, boolean>>({});
//   const [inspectionErrors, setInspectionErrors] = useState<Record<string, boolean>>({});
//   const [feederErrors, setFeederErrors] = useState<Record<string, Record<string, boolean>>>({});
  
//   // Loading state
//   const [loading, setLoading] = useState(false);
  
//   // Current step (0 = transformer, 1 = inspection, 2 = LV feeders)
//   const [currentStep, setCurrentStep] = useState(0);
  
//   // Date picker state
//   const [showDatePicker, setShowDatePicker] = useState(false);
  
//   // Reset form when modal becomes visible
//   useEffect(() => {
//     if (visible) {
//       resetForm();
//     }
//   }, [visible]);
  
//   // Handle transformer field changes
//   const handleTransformerChange = (field: keyof Transformer, value: any) => {
//     setTransformerData(prev => ({ ...prev, [field]: value }));
//     if (transformerErrors[field]) {
//       setTransformerErrors(prev => ({ ...prev, [field]: false }));
//     }
//   };
  
//   // Handle inspection field changes
//   const handleInspectionChange = (field: keyof Inspection, value: any) => {
//     setInspectionData(prev => ({ ...prev, [field]: value }));
//     if (inspectionErrors[field]) {
//       setInspectionErrors(prev => ({ ...prev, [field]: false }));
//     }
//   };
  
//   // Handle LV feeder field changes
//   const handleFeederChange = (index: number, field: keyof LvFeeder, value: any) => {
//     const updatedFeeders = [...lvFeeders];
//     updatedFeeders[index] = { ...updatedFeeders[index], [field]: value };
//     setLvFeeders(updatedFeeders);
    
//     if (feederErrors[index]?.[field]) {
//       const newErrors = { ...feederErrors };
//       newErrors[index][field] = false;
//       setFeederErrors(newErrors);
//     }
//   };
  
//   // Add a new LV feeder
//   const addLvFeeder = () => {
//     setLvFeeders([...lvFeeders, createEmptyLvFeeder()]);
//   };
  
//   // Remove an LV feeder
//   const removeLvFeeder = (index: number) => {
//     if (lvFeeders.length > 1) {
//       const updatedFeeders = [...lvFeeders];
//       updatedFeeders.splice(index, 1);
//       setLvFeeders(updatedFeeders);
      
//       // Update errors
//       const newErrors = { ...feederErrors };
//       delete newErrors[index];
//       setFeederErrors(newErrors);
//     }
//   };
  
//   // Handle date change
//   const handleDateChange = (event: any, selectedDate?: Date) => {
//     setShowDatePicker(false);
//     if (selectedDate) {
//       handleTransformerChange('date_of_installation', selectedDate.toISOString().split('T')[0]);
//     }
//   };
  
//   // Validate transformer data
//   const validateTransformer = () => {
//     const newErrors: Record<string, boolean> = {};
//     const requiredFields: (keyof Transformer)[] = [
//       'trafo_type',
//       'capacity',
//       'dt_number',
//       'primary_voltage',
//       'colling_type',
//       'serial_number',
//       'manufacturer',
//       'service_type',
//       'status',
//       'vector_group',
//       'impedance_voltage',
//       'winding_weight',
//       'oil_weight',
//       'year_of_manufacturing',
//     ];
    
//     let hasError = false;
//     requiredFields.forEach(field => {
//       if (!transformerData[field]) {
//         newErrors[field] = true;
//         hasError = true;
//       }
//     });
    
//     setTransformerErrors(newErrors);
//     return !hasError;
//   };
  
//   // Validate inspection data
//   const validateInspection = () => {
//     const newErrors: Record<string, boolean> = {};
//     const requiredFields: (keyof Inspection)[] = [
//       'body_condition',
//       'arrester',
//       'drop_out',
//       'mv_bushing',
//       'mv_cable_lug',
//       'lv_bushing',
//       'lv_cable_lug',
//       'oil_level',
//       'fuse_link',
//       'horn_gap',
//       'silica_gel',
//       'has_linkage',
//       'arrester_body_ground',
//       'neutral_ground',
//       'status_of_mounting',
//       'mounting_condition',
//       'N_load_current',
//       'R_S_Voltage',
//       'R_T_Voltage',
//       'T_S_Voltage',
//     ];
    
//     let hasError = false;
//     requiredFields.forEach(field => {
//       if (!inspectionData[field]) {
//         newErrors[field] = true;
//         hasError = true;
//       }
//     });
    
//     setInspectionErrors(newErrors);
//     return !hasError;
//   };
  
//   // Validate LV feeders
//   const validateFeeders = () => {
//     const newErrors: Record<string, Record<string, boolean>> = {};
//     const requiredFields: (keyof LvFeeder)[] = [
//       'type_of_distribution_box',
//       'R_load_current',
//       'S_load_current',
//       'T_load_current',
//       'R_fuse_rating',
//       'S_fuse_rating',
//       'T_fuse_rating',
//     ];
    
//     let hasError = false;
//     lvFeeders.forEach((feeder, index) => {
//       newErrors[index] = {};
      
//       requiredFields.forEach(field => {
//         if (!feeder[field]) {
//           newErrors[index][field] = true;
//           hasError = true;
//         }
//       });
//     });
    
//     setFeederErrors(newErrors);
//     return !hasError;
//   };
  
//   // Handle next step
//   const handleNextStep = () => {
//     console.log("Current step before next:", currentStep);
    
//     if (currentStep === 0) {
//       // For testing, temporarily bypass validation
//       if (validateTransformer()) {
//         setCurrentStep(1);
//         console.log("Moving to step 1");
//       } else {
//         showToast('Please fill in all required transformer fields');
//       }
//     } else if (currentStep === 1) {
//       // For testing, temporarily bypass validation
//       if (validateInspection()) {
//         setCurrentStep(2);
//         console.log("Moving to step 2");
//       } else {
//         showToast('Please fill in all required inspection fields');
//       }
//     }
    
//     // Force a re-render
//     setTimeout(() => {
//       console.log("Current step after next:", currentStep);
//     }, 100);
//   };
  
//   // Handle previous step
//   const handlePrevStep = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     }
//   };
  
//   // Reset form
//   const resetForm = () => {
//     setTransformerData({
//       basestation: '',
//       trafo_type: '',
//       capacity: '',
//       dt_number: '',
//       primary_voltage: '',
//       colling_type: '',
//       serial_number: '',
//       manufacturer: '',
//       service_type: '',
//       status: '',
//       vector_group: '',
//       impedance_voltage: '',
//       winding_weight: '',
//       oil_weight: '',
//       year_of_manufacturing: '',
//       date_of_installation: '',
//     });
//     setInspectionData({
//       transformer_data: transformerId,
//       body_condition: '',
//       arrester: '',
//       drop_out: '',
//       mv_bushing: '',
//       mv_cable_lug: '',
//       lv_bushing: '',
//       lv_cable_lug: '',
//       oil_level: '',
//       fuse_link: '',
//       horn_gap: '',
//       silica_gel: '',
//       has_linkage: '',
//       arrester_body_ground: '',
//       neutral_ground: '',
//       status_of_mounting: '',
//       mounting_condition: '',
//       N_load_current: '',
//       R_S_Voltage: '',
//       R_T_Voltage: '',
//       T_S_Voltage: '',
//     });
//     setLvFeeders([createEmptyLvFeeder()]);
//     setTransformerErrors({});
//     setInspectionErrors({});
//     setFeederErrors({});
//     setCurrentStep(0);
//   };
  
//   // Handle form submission
//   const handleSubmit = async () => {
//     try {
//       // Validate all steps
//       const isTransformerValid = validateTransformer();
//       const isInspectionValid = validateInspection();
//       const areFeedersValid = validateFeeders();
      
//       if (!isTransformerValid) {
//         setCurrentStep(0);
//         showToast('Please fill in all required transformer fields');
//         return;
//       }
      
//       if (!isInspectionValid) {
//         setCurrentStep(1);
//         showToast('Please fill in all required inspection fields');
//         return;
//       }
      
//       if (!areFeedersValid) {
//         setCurrentStep(2);
//         showToast('Please fill in all required LV feeder fields');
//         return;
//       }
      
//       setLoading(true);
      
//       // Generate a temporary ID for the transformer
//       const tempTransformerId = uuidv4();
      
//       // Format date values
//       const currentDate = new Date().toISOString();
      
      
//       // Prepare transformer data in the required format
//       const submissionData = {
//         trafo_type: transformerData.trafo_type,
//         capacity: transformerData.capacity,
//         dt_number: transformerData.dt_number,
//         primary_voltage: transformerData.primary_voltage,
//         colling_type: transformerData.colling_type,
//         serial_number: transformerData.serial_number,
//         service_type: transformerData.service_type,
//         status: transformerData.status,
//         manufacturer: transformerData.manufacturer,
//         vector_group: transformerData.vector_group,
//         impedance_voltage: transformerData.impedance_voltage,
//         winding_weight: transformerData.winding_weight,
//         oil_weight: transformerData.oil_weight,
//         year_of_manufacturing: transformerData.year_of_manufacturing,
//         date_of_installation: transformerData.date_of_installation,
//         created_at: currentDate,
//         updated_at: currentDate,
//         basestation: transformerData.basestation || null,
//         id: tempTransformerId,
//         inspection_data: {
//           body_condition: inspectionData.body_condition,
//           arrester: inspectionData.arrester,
//           drop_out: inspectionData.drop_out,
//           fuse_link: inspectionData.fuse_link,
//           mv_bushing: inspectionData.mv_bushing,
//           mv_cable_lug: inspectionData.mv_cable_lug,
//           lv_bushing: inspectionData.lv_bushing,
//           lv_cable_lug: inspectionData.lv_cable_lug,
//           oil_level: inspectionData.oil_level,
//           insulation_level: null,
//           horn_gap: inspectionData.horn_gap,
//           silica_gel: inspectionData.silica_gel,
//           has_linkage: inspectionData.has_linkage,
//           arrester_body_ground: inspectionData.arrester_body_ground,
//           neutral_ground: inspectionData.neutral_ground,
//           status_of_mounting: inspectionData.status_of_mounting,
//           mounting_condition: inspectionData.mounting_condition,
//           N_load_current: inspectionData.N_load_current,
//           R_S_Voltage: inspectionData.R_S_Voltage,
//           R_T_Voltage: inspectionData.R_T_Voltage,
//           T_S_Voltage: inspectionData.T_S_Voltage,
//           transformer_data: tempTransformerId,
//           lvfeeders: lvFeeders.map(feeder => ({
//             type_of_distribution_box: feeder.type_of_distribution_box,
//             R_load_current: feeder.R_load_current,
//             S_load_current: feeder.S_load_current,
//             T_load_current: feeder.T_load_current,
//             R_fuse_rating: feeder.R_fuse_rating,
//             S_fuse_rating: feeder.S_fuse_rating,
//             T_fuse_rating: feeder.T_fuse_rating
//           }))
//         }
//       };

//       console.log("KKKKKKKKKKKKKKKKKKKKKKKKKK,", submissionData);
      
//       // Add to sync queue
//       await syncService.addToQueue({
//         endpoint: '/api/transformer/process-transformer-offline/',
//         method: 'POST',
//         title: 'Create Offline Transformer',
//         data: submissionData,
//       });
      
//       // Update UI with new data
//       onDataChange(submissionData as Transformer, false);
      
//       showToast('Transformer saved for sync');
//       resetForm();
//       onClose();
//     } catch (error: any) {
//       console.error('Operation failed:', error);
//       showToast(error?.message || 'Operation failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Handle close
//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };
  
//   // Render transformer form
//   const renderTransformerForm = () => (
//     <ScrollView style={styles.form}>
//       {/* Station Code */}
//       <Text style={styles.label}>Station Code</Text>
//       <TextInput
//         value={transformerData.basestation}
//         onChangeText={(value) => handleTransformerChange('basestation', value)}
//         style={styles.input}
//         mode="outlined"
//         outlineColor="#e1e1e1"
//         activeOutlineColor="#1890ff"
//         dense={true}
//       />
      
//       {/* Transformer Type */}
//       <RequiredLabel text="Transformer Type" />
//       <View style={[
//         styles.pickerContainer,
//         transformerErrors.trafo_type && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={transformerData.trafo_type}
//           onValueChange={(value) => handleTransformerChange('trafo_type', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Transformer Type" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {TRANSFORMER_TYPES.map(option => (
//             <Picker.Item
//               key={option}
//               label={option}
//               value={option}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* Capacity */}
//       <RequiredLabel text="Capacity" />
//       <View style={[
//         styles.pickerContainer,
//         transformerErrors.capacity && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={transformerData.capacity}
//           onValueChange={(value) => handleTransformerChange('capacity', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Capacity" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {CAPACITIES.map(option => (
//             <Picker.Item
//               key={option}
//               label={`${option} kVA`}
//               value={option}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* DT Number */}
//       <RequiredLabel text="DT Number" />
//       <TextInput
//         value={transformerData.dt_number}
//         onChangeText={(value) => handleTransformerChange('dt_number', value)}
//         style={[
//           styles.input,
//           transformerErrors.dt_number && styles.inputError
//         ]}
//         mode="outlined"
//         outlineColor="#e1e1e1"
//         activeOutlineColor="#1890ff"
//         dense={true}
//       />
      
//       {/* Primary Voltage */}
//       <RequiredLabel text="Primary Voltage" />
//       <View style={[
//         styles.pickerContainer,
//         transformerErrors.primary_voltage && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={transformerData.primary_voltage}
//           onValueChange={(value) => handleTransformerChange('primary_voltage', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Primary Voltage" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {PRIMARY_VOLTAGES.map(option => (
//             <Picker.Item
//               key={option}
//               label={`${option} kV`}
//               value={option}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* Cooling Type */}
//       <RequiredLabel text="Cooling Type" />
//       <View style={[
//         styles.pickerContainer,
//         transformerErrors.colling_type && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={transformerData.colling_type}
//           onValueChange={(value) => handleTransformerChange('colling_type', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Cooling Type" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {COOLING_TYPES.map(option => (
//             <Picker.Item
//               key={option}
//               label={option}
//               value={option}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* Serial Number */}
//       <RequiredLabel text="Serial Number" />
//       <TextInput
//         value={transformerData.serial_number}
//         onChangeText={(value) => handleTransformerChange('serial_number', value)}
//         style={[
//           styles.input,
//           transformerErrors.serial_number && styles.inputError
//         ]}
//         mode="outlined"
//         outlineColor="#e1e1e1"
//         activeOutlineColor="#1890ff"
//         dense={true}
//       />
      
//       {/* Manufacturer */}
//       <RequiredLabel text="Manufacturer" />
//       <View style={[
//         styles.pickerContainer,
//         transformerErrors.manufacturer && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={transformerData.manufacturer}
//           onValueChange={(value) => handleTransformerChange('manufacturer', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Manufacturer" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {MANUFACTURERS.map(option => (
//             <Picker.Item
//               key={option}
//               label={option}
//               value={option}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* Service Type */}
//       <RequiredLabel text="Service Type" />
//       <View style={[
//         styles.pickerContainer,
//         transformerErrors.service_type && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={transformerData.service_type}
//           onValueChange={(value) => handleTransformerChange('service_type', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Service Type" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {SERVICE_TYPES.map(option => (
//             <Picker.Item
//               key={option}
//               label={option}
//               value={option}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* Status */}
//       <RequiredLabel text="Status" />
//       <View style={[
//         styles.pickerContainer,
//         transformerErrors.status && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={transformerData.status}
//           onValueChange={(value) => handleTransformerChange('status', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Status" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {STATUSES.map(option => (
//             <Picker.Item
//               key={option}
//               label={option}
//               value={option}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* Vector Group */}
//       <RequiredLabel text="Vector Group" />
//       <View style={[
//         styles.pickerContainer,
//         transformerErrors.vector_group && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={transformerData.vector_group}
//           onValueChange={(value) => handleTransformerChange('vector_group', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Vector Group" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {VECTOR_GROUPS.map(option => (
//             <Picker.Item
//               key={option}
//               label={option}
//               value={option}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* Impedance Voltage */}
//       <RequiredLabel text="Impedance Voltage" />
//       <TextInput
//         value={transformerData.impedance_voltage?.toString()}
//         onChangeText={(value) => handleTransformerChange('impedance_voltage', value)}
//         keyboardType="numeric"
//         style={[
//           styles.input,
//           transformerErrors.impedance_voltage && styles.inputError
//         ]}
//         mode="outlined"
//         outlineColor="#e1e1e1"
//         activeOutlineColor="#1890ff"
//         dense={true}
//       />
      
//       {/* Winding Weight */}
//       <RequiredLabel text="Winding Weight" />
//       <TextInput
//         value={transformerData.winding_weight?.toString()}
//         onChangeText={(value) => handleTransformerChange('winding_weight', value)}
//         keyboardType="numeric"
//         style={[
//           styles.input,
//           transformerErrors.winding_weight && styles.inputError
//         ]}
//         mode="outlined"
//         outlineColor="#e1e1e1"
//         activeOutlineColor="#1890ff"
//         dense={true}
//       />
      
//       {/* Oil Weight */}
//       <RequiredLabel text="Oil Weight" />
//       <TextInput
//         value={transformerData.oil_weight?.toString()}
//         onChangeText={(value) => handleTransformerChange('oil_weight', value)}
//         keyboardType="numeric"
//         style={[
//           styles.input,
//           transformerErrors.oil_weight && styles.inputError
//         ]}
//         mode="outlined"
//         outlineColor="#e1e1e1"
//         activeOutlineColor="#1890ff"
//         dense={true}
//       />
      
//       {/* Year of Manufacturing */}
//       <RequiredLabel text="Year of Manufacturing" />
//       <View style={[
//         styles.pickerContainer,
//         transformerErrors.year_of_manufacturing && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={transformerData.year_of_manufacturing}
//           onValueChange={(value) => handleTransformerChange('year_of_manufacturing', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Year" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
//             <Picker.Item
//               key={year}
//               label={year}
//               value={year}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* Date of Installation */}
//       <Text style={styles.label}>Date of Installation</Text>
//       <TouchableOpacity
//         style={styles.dateButton}
//         onPress={() => setShowDatePicker(true)}
//       >
//         <Text style={styles.dateButtonText}>
//           {transformerData.date_of_installation || 'Select Date'}
//         </Text>
//       </TouchableOpacity>
      
//       {showDatePicker && (
//         <DateTimePicker
//           value={transformerData.date_of_installation ? new Date(transformerData.date_of_installation) : new Date()}
//           mode="date"
//           display="default"
//           onChange={handleDateChange}
//         />
//       )}
//     </ScrollView>
//   );
  
//   // Render inspection form
//   const renderInspectionForm = () => (
//     <ScrollView style={styles.form}>
//       {/* Body Condition */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Body Condition" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.body_condition && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.body_condition}
//             onValueChange={(value) => handleInspectionChange('body_condition', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Body Condition" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {CONDITIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Arrester */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Arrester" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.arrester && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.arrester}
//             onValueChange={(value) => handleInspectionChange('arrester', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Arrester Status" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {STATUS_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Drop Out */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Drop Out" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.drop_out && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.drop_out}
//             onValueChange={(value) => handleInspectionChange('drop_out', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Drop Out Status" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {STATUS_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* MV Bushing */}
//       <View style={styles.formField}>
//         <RequiredLabel text="MV Bushing" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.mv_bushing && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.mv_bushing}
//             onValueChange={(value) => handleInspectionChange('mv_bushing', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select MV Bushing Status" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {STATUS_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* MV Cable Lug */}
//       <View style={styles.formField}>
//         <RequiredLabel text="MV Cable Lug" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.mv_cable_lug && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.mv_cable_lug}
//             onValueChange={(value) => handleInspectionChange('mv_cable_lug', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select MV Cable Lug Status" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {STATUS_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* LV Bushing */}
//       <View style={styles.formField}>
//         <RequiredLabel text="LV Bushing" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.lv_bushing && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.lv_bushing}
//             onValueChange={(value) => handleInspectionChange('lv_bushing', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select LV Bushing Status" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {STATUS_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* LV Cable Lug */}
//       <View style={styles.formField}>
//         <RequiredLabel text="LV Cable Lug" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.lv_cable_lug && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.lv_cable_lug}
//             onValueChange={(value) => handleInspectionChange('lv_cable_lug', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select LV Cable Lug Status" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {STATUS_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Oil Level */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Oil Level" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.oil_level && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.oil_level}
//             onValueChange={(value) => handleInspectionChange('oil_level', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Oil Level" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {OIL_LEVEL_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Insulation Level - Not Required */}
//       <View style={styles.formField}>
//         <Text style={styles.label}>Insulation Level</Text>
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={inspectionData.insulation_level}
//             onValueChange={(value) =>
//               handleInspectionChange('insulation_level', value)
//             }
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Insulation Level" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {INSULATION_OPTIONS.map((option) => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Fuse Link */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Fuse Link" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.fuse_link && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.fuse_link}
//             onValueChange={(value) => handleInspectionChange('fuse_link', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Fuse Link Status" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {STATUS_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Horn Gap */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Horn Gap" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.horn_gap && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.horn_gap}
//             onValueChange={(value) => handleInspectionChange('horn_gap', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Horn Gap Status" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {HORN_GAP_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Silica Gel */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Silica Gel" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.silica_gel && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.silica_gel}
//             onValueChange={(value) => handleInspectionChange('silica_gel', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Silica Gel Condition" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {CONDITIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Has Linkage */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Has Linkage" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.has_linkage && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.has_linkage}
//             onValueChange={(value) => handleInspectionChange('has_linkage', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Linkage Status" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {LINKAGE_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Arrester Body Ground */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Arrester Body Ground" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.arrester_body_ground && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.arrester_body_ground}
//             onValueChange={(value) => handleInspectionChange('arrester_body_ground', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Arrester Body Ground" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {AVAILABILITY_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Neutral Ground */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Neutral Ground" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.neutral_ground && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.neutral_ground}
//             onValueChange={(value) => handleInspectionChange('neutral_ground', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Neutral Ground" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {AVAILABILITY_OPTIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Status of Mounting */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Status of Mounting" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.status_of_mounting && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.status_of_mounting}
//             onValueChange={(value) => handleInspectionChange('status_of_mounting', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Status of Mounting" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {CONDITIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Mounting Condition */}
//       <View style={styles.formField}>
//         <RequiredLabel text="Mounting Condition" />
//         <View style={[
//           styles.pickerContainer,
//           inspectionErrors.mounting_condition && styles.inputError
//         ]}>
//           <Picker
//             selectedValue={inspectionData.mounting_condition}
//             onValueChange={(value) => handleInspectionChange('mounting_condition', value)}
//             style={styles.picker}
//           >
//             <Picker.Item 
//               label="Select Mounting Condition" 
//               value="" 
//               enabled={false}
//               style={{ color: '#666' }}
//             />
//             {CONDITIONS.map(option => (
//               <Picker.Item
//                 key={option}
//                 label={option}
//                 value={option}
//                 style={{ color: '#000' }}
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* N Load Current */}
//       <View style={styles.formField}>
//         <RequiredLabel text="N Load Current (A)" />
//         <TextInput
//           value={inspectionData.N_load_current?.toString()}
//           onChangeText={(value) => handleInspectionChange('N_load_current', value)}
//           keyboardType="numeric"
//           style={[
//             styles.input,
//             inspectionErrors.N_load_current && styles.inputError
//           ]}
//           mode="outlined"
//           outlineColor="#e1e1e1"
//           activeOutlineColor="#1890ff"
//           dense={true}
//         />
//       </View>
      
//       {/* R-S Voltage */}
//       <View style={styles.formField}>
//         <RequiredLabel text="R-S Voltage (V)" />
//         <TextInput
//           value={inspectionData.R_S_Voltage?.toString()}
//           onChangeText={(value) => handleInspectionChange('R_S_Voltage', value)}
//           keyboardType="numeric"
//           style={[
//             styles.input,
//             inspectionErrors.R_S_Voltage && styles.inputError
//           ]}
//           mode="outlined"
//           outlineColor="#e1e1e1"
//           activeOutlineColor="#1890ff"
//           dense={true}
//         />
//       </View>
      
//       {/* R-T Voltage */}
//       <View style={styles.formField}>
//         <RequiredLabel text="R-T Voltage (V)" />
//         <TextInput
//           value={inspectionData.R_T_Voltage?.toString()}
//           onChangeText={(value) => handleInspectionChange('R_T_Voltage', value)}
//           keyboardType="numeric"
//           style={[
//             styles.input,
//             inspectionErrors.R_T_Voltage && styles.inputError
//           ]}
//           mode="outlined"
//           outlineColor="#e1e1e1"
//           activeOutlineColor="#1890ff"
//           dense={true}
//         />
//       </View>
      
//       {/* T-S Voltage */}
//       <View style={styles.formField}>
//         <RequiredLabel text="T-S Voltage (V)" />
//         <TextInput
//           value={inspectionData.T_S_Voltage?.toString()}
//           onChangeText={(value) => handleInspectionChange('T_S_Voltage', value)}
//           keyboardType="numeric"
//           style={[
//             styles.input,
//             inspectionErrors.T_S_Voltage && styles.inputError
//           ]}
//           mode="outlined"
//           outlineColor="#e1e1e1"
//           activeOutlineColor="#1890ff"
//           dense={true}
//         />
//       </View>
//     </ScrollView>
//   );

//   // Make sure the renderLvFeedersForm function is properly defined
//   const renderLvFeedersForm = () => ( 
//     <ScrollView style={styles.form}>
//       <Text style={styles.sectionTitle}>LV Feeders</Text>
      
//       {lvFeeders.map((feeder, index) => (
//         <View key={index} style={styles.feederContainer}>
//           <View style={styles.feederHeader}>
//             <Text style={styles.feederTitle}>Feeder #{index + 1}</Text>
//             {lvFeeders.length > 1 && (
//               <TouchableOpacity 
//                 onPress={() => removeLvFeeder(index)}
//                 style={styles.removeButton}
//               >
//                 <Icon name="delete" size={20} color="#f44336" />
//               </TouchableOpacity>
//             )}
//           </View>
          
//           {/* Distribution Box Type */}
//           <View style={styles.formField}>
//             <RequiredLabel text="Distribution Box" />
//             <View style={[
//               styles.pickerContainer,
//               feederErrors[index]?.type_of_distribution_box && styles.inputError
//             ]}>
//               <Picker
//                 selectedValue={feeder.type_of_distribution_box}
//                 onValueChange={(value) => handleFeederChange(index, 'type_of_distribution_box', value)}
//                 style={styles.picker}
//               >
//                 <Picker.Item 
//                   label="Select Distribution Box" 
//                   value="" 
//                   enabled={false}
//                   style={{ color: '#666' }}
//                 />
//                 {DISTRIBUTION_BOX_TYPES.map(option => (
//                   <Picker.Item
//                     key={option}
//                     label={option}
//                     value={option}
//                     style={{ color: '#000' }}
//                   />
//                 ))}
//               </Picker>
//             </View>
//           </View>
          
//           {/* Load Current Fields */}
//           {['R', 'S', 'T'].map((phase) => (
//             <View key={`${phase}_load_current`} style={styles.formField}>
//               <RequiredLabel text={`${phase} Load Current (A)`} />
//               <TextInput
//                 value={feeder[`${phase}_load_current` as keyof LvFeeder]?.toString()}
//                 onChangeText={(value) => handleFeederChange(index, `${phase}_load_current` as keyof LvFeeder, value)}
//                 keyboardType="numeric"
//                 style={styles.input}
//                 mode="outlined"
//                 error={!!feederErrors[index]?.[`${phase}_load_current` as keyof LvFeeder]}
//               />
//             </View>
//           ))}
          
//           {/* Fuse Rating Fields */}
//           {['R', 'S', 'T'].map((phase) => (
//             <View key={`${phase}_fuse_rating`} style={styles.formField}>
//               <RequiredLabel text={`${phase} Fuse Rating (A)`} />
//               <TextInput
//                 value={feeder[`${phase}_fuse_rating` as keyof LvFeeder]?.toString()}
//                 onChangeText={(value) => handleFeederChange(index, `${phase}_fuse_rating` as keyof LvFeeder, value)}
//                 keyboardType="numeric"
//                 style={styles.input}
//                 mode="outlined"
//                 error={!!feederErrors[index]?.[`${phase}_fuse_rating` as keyof LvFeeder]}
//               />
//             </View>
//           ))}
//         </View>
//       ))}
      
//       {/* Add Feeder Button */}
//       <TouchableOpacity 
//         style={styles.addButton}
//         onPress={addLvFeeder}
//       >
//         <Icon name="add-circle" size={20} color="#2196F3" />
//         <Text style={styles.addButtonText}>Add Another Feeder</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );

//   // Make sure the state update is working correctly
//   useEffect(() => {
//     console.log("Current step changed to:", currentStep);
//   }, [currentStep]);
  
//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={handleClose}
//     >
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           {/* Header */}
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>
//               {currentStep === 0 ? 'Add Transformer' : 
//                currentStep === 1 ? 'Add Inspection' : 'Add LV Feeders'}
//             </Text>
//             <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
//               <Icon name="close" size={24} color="#000" />
//             </TouchableOpacity>
//           </View>
          
//           {/* Progress indicator */}
//           <View style={styles.stepIndicator}>
//             <View style={[styles.stepDot, currentStep >= 0 && styles.activeStepDot]} />
//             <View style={styles.stepLine} />
//             <View style={[styles.stepDot, currentStep >= 1 && styles.activeStepDot]} />
//             <View style={styles.stepLine} />
//             <View style={[styles.stepDot, currentStep >= 2 && styles.activeStepDot]} />
//           </View>
          
//           {/* Form content based on current step */}
//           {currentStep === 0 ? renderTransformerForm() : 
//            currentStep === 1 ? renderInspectionForm() : renderLvFeedersForm()}
          
//           {/* Navigation buttons */}
//           <View style={styles.buttonContainer}>
//             {currentStep > 0 && (
//               <Button
//                 mode="outlined"
//                 onPress={handlePrevStep}
//                 style={styles.button}
//                 disabled={loading}
//               >
//                 Previous
//               </Button>
//             )}
            
//             {currentStep < 2 ? (
//               <Button
//                 mode="contained"
//                 onPress={handleNextStep}
//                 style={styles.button}
//                 disabled={loading}
//               >
//                 Next
//               </Button>
//             ) : (
//               <Button
//                 mode="contained"
//                 onPress={handleSubmit}
//                 style={styles.button}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   'Submit'
//                 )}
//               </Button>
//             )}
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     width: '90%',
//     maxHeight: '90%',
//     padding: 16,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   form: {
//     maxHeight: '70%',
//   },
//   formField: {
//     marginBottom: 16,
//   },
//   labelContainer: {
//     flexDirection: 'row',
//     marginBottom: 4,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   required: {
//     color: 'red',
//     marginLeft: 4,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 16,
//   },
//   picker: {
//     height: 50,
//   },
//   input: {
//     backgroundColor: '#f9f9f9',
//     marginBottom: 16,
//     height: 40,
//   },
//   inputError: {
//     borderColor: 'red',
//   },
//   dateButton: {
//     height: 45,
//     marginBottom: 16,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//     borderWidth: 1,
//     borderColor: '#e1e1e1',
//     paddingHorizontal: 12,
//   },
//   dateButtonText: {
//     fontSize: 14,
//     color: '#495057',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   button: {
//     paddingVertical: 12,
//     borderRadius: 4,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   cancelButton: {
//     backgroundColor: '#9e9e9e',
//   },
//   nextButton: {
//     backgroundColor: '#2196F3',
//   },
//   submitButton: {
//     backgroundColor: '#4CAF50',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   stepIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   stepDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#ccc',
//     marginHorizontal: 5,
//   },
//   activeStepDot: {
//     backgroundColor: '#2196F3',
//   },
//   stepLine: {
//     flex: 1,
//     height: 2,
//     backgroundColor: '#ccc',
//     marginHorizontal: 5,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     marginBottom: 16,
//     backgroundColor: '#f0f9ff',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#d0e8ff',
//   },
//   addButtonText: {
//     color: '#2196F3',
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   feederContainer: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 16,
//     backgroundColor: '#f9f9f9',
//   },
//   feederHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   feederTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   removeButton: {
//     padding: 8,
//     borderRadius: 4,
//   },
// });






















