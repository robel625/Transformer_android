// import React from 'react';
// import { ScrollView, View, StyleSheet } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { Picker } from '@react-native-picker/picker';
// import RequiredLabel from '@/components/RequiredLabel';
// import GPSLocationInput from '@/components/GPSLocationInput';
// import type { Basestation } from '@/types/entity';

// // Constants
// const STATION_TYPES = ['Pole Mounted', 'Pad Mounted', 'Ground Mounted', 'Single Steel Pole', 'Double Steel Pole', 'H-Pole'];

// interface BaseStationFormProps {
//   baseStation: Partial<Basestation>;
//   baseStationErrors: Record<string, boolean>;
//   handleBaseStationChange: (field: keyof Basestation, value: string) => void;
//   handleRegionChange: (value: string) => void;
//   handleCSCChange: (value: string) => void;
//   handleSubstationChange: (value: string) => void;
//   regions: any[];
//   selectedCSCs: any[];
//   selectedSubstations: any[];
//   selectedFeeders: any[];
// }

// const BaseStationForm = ({
//   baseStation,
//   baseStationErrors,
//   handleBaseStationChange,
//   handleRegionChange,
//   handleCSCChange,
//   handleSubstationChange,
//   regions,
//   selectedCSCs,
//   selectedSubstations,
//   selectedFeeders,
// }: BaseStationFormProps) => {
//   return (
//     <ScrollView style={styles.form}>
//       {/* Station Code */}
//       <RequiredLabel text="Station Code" />
//       <TextInput
//         value={baseStation.station_code}
//         onChangeText={(value) => handleBaseStationChange('station_code', value)}
//         style={[
//           styles.input,
//           baseStationErrors.station_code && styles.inputError
//         ]}
//         mode="outlined"
//         outlineColor="#e1e1e1"
//         activeOutlineColor="#1890ff"
//         dense={true}
//         placeholder="Enter station code"
//       />
      
//       {/* Region */}
//       <RequiredLabel text="Region" />
//       <View style={[
//         styles.pickerContainer,
//         baseStationErrors.region && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={baseStation.region}
//           onValueChange={(value) => handleRegionChange(value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Region" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {regions.map(region => (
//             <Picker.Item
//               key={region.id || region.name}
//               label={region.name}
//               value={region.name}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
      
//       {/* CSC */}
//       <RequiredLabel text="CSC" />
//       <View style={[
//         styles.pickerContainer,
//         baseStationErrors.csc && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={baseStation.csc}
//           onValueChange={(value) => handleCSCChange(value)}
//           style={styles.picker}
//           enabled={!!baseStation.region}
//         >
//           <Picker.Item 
//             label="Select CSC" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {selectedCSCs?.map((csc: any) => (
//             <Picker.Item
//               key={csc.id || csc.name}
//               label={csc.name}
//               value={csc.name}
//               style={{ color: '#000' }}
//             />
//           )) || []}
//         </Picker>
//       </View>
      
//       {/* Substation */}
//       <RequiredLabel text="Substation" />
//       <View style={[
//         styles.pickerContainer,
//         baseStationErrors.substation && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={baseStation.substation}
//           onValueChange={(value) => handleSubstationChange(value)}
//           style={styles.picker}
//           enabled={!!baseStation.csc}
//         >
//           <Picker.Item 
//             label="Select Substation" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {selectedSubstations?.map((substation: any) => (
//             <Picker.Item
//               key={substation.id || substation.name}
//               label={substation.name}
//               value={substation.name}
//               style={{ color: '#000' }}
//             />
//           )) || []}
//         </Picker>
//       </View>
      
//       {/* Feeder */}
//       <RequiredLabel text="Feeder" />
//       <View style={[
//         styles.pickerContainer,
//         baseStationErrors.feeder && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={baseStation.feeder}
//           onValueChange={(value) => handleBaseStationChange('feeder', value)}
//           style={styles.picker}
//           enabled={!!baseStation.substation}
//         >
//           <Picker.Item 
//             label="Select Feeder" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {selectedFeeders?.map((feeder: any) => (
//             <Picker.Item
//               key={feeder.id || feeder.feeder_name}
//               label={feeder.feeder_name}
//               value={feeder.feeder_name}
//               style={{ color: '#000' }}
//             />
//           )) || []}
//         </Picker>
//       </View>
      
//       {/* Address */}
//       <RequiredLabel text="Address" />
//       <TextInput
//         value={baseStation.address}
//         onChangeText={(value) => handleBaseStationChange('address', value)}
//         style={[
//           styles.input,
//           baseStationErrors.address && styles.inputError
//         ]}
//         mode="outlined"
//         outlineColor="#e1e1e1"
//         activeOutlineColor="#1890ff"
//         dense={true}
//         multiline
//         placeholder="Enter address"
//       />
      
//       {/* GPS Location */}
//       <RequiredLabel text="GPS Location" />
//       <GPSLocationInput
//         value={baseStation.gps_location || ''}
//         onChange={(value) => handleBaseStationChange('gps_location', value)}
//         style={[
//           styles.input,
//           baseStationErrors.gps_location && styles.inputError
//         ]}
//       />
      
//       {/* Station Type */}
//       <RequiredLabel text="Station Type" />
//       <View style={[
//         styles.pickerContainer,
//         baseStationErrors.station_type && styles.inputError
//       ]}>
//         <Picker
//           selectedValue={baseStation.station_type}
//           onValueChange={(value) => handleBaseStationChange('station_type', value)}
//           style={styles.picker}
//         >
//           <Picker.Item 
//             label="Select Station Type" 
//             value="" 
//             enabled={false}
//             style={{ color: '#666' }}
//           />
//           {STATION_TYPES.map(option => (
//             <Picker.Item
//               key={option}
//               label={option}
//               value={option}
//               style={{ color: '#000' }}
//             />
//           ))}
//         </Picker>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   form: {
//     maxHeight: '70%',
//   },
//   input: {
//     backgroundColor: '#f9f9f9',
//     marginBottom: 16,
//     height: 40,
//   },
//   inputError: {
//     borderColor: 'red',
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
// });

// export default BaseStationForm;