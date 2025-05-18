import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

// Constants
const DISTRIBUTION_BOX_TYPES = ['Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5'];

interface LvFeederFormProps {
  feeders: any[];
  errors: Record<string, Record<string, boolean>>;
  handleFeederChange: (index: number, field: string, value: any) => void;
  addFeeder: () => void;
  removeFeeder: (index: number) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  loading: boolean;
}

export const LvFeederForm: React.FC<LvFeederFormProps> = ({
  feeders,
  errors,
  handleFeederChange,
  addFeeder,
  removeFeeder,
  onSubmit,
  onPrevious,
  loading,
}) => {
  return (
    <ScrollView style={styles.form}>
      <Text style={styles.sectionTitle}>LV Feeders</Text>
      {feeders.map((feeder, index) => (
        <View key={index} style={styles.feederContainer}>
          <View style={styles.feederHeader}>
            <Text style={styles.feederTitle}>Feeder #{index + 1}</Text>
            {feeders.length > 1 && (
              <TouchableOpacity onPress={() => removeFeeder(index)} style={styles.removeButton}>
                <Text style={{ color: 'red' }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Distribution Box Type */}
          <Text style={styles.label}>Distribution Box</Text>
          <View style={[styles.pickerContainer, errors[index]?.type_of_distribution_box && styles.inputError]}>
            <Picker
              selectedValue={feeder.type_of_distribution_box}
              onValueChange={(value) => handleFeederChange(index, 'type_of_distribution_box', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Distribution Box" value="" enabled={false} style={{ color: '#666' }} />
              {DISTRIBUTION_BOX_TYPES.map(option => (
                <Picker.Item key={option} label={option} value={option} style={{ color: '#000' }} />
              ))}
            </Picker>
          </View>

          {/* Load Current Fields */}
          {['R', 'S', 'T'].map((phase) => (
            <View key={`${phase}_load_current`} style={styles.formField}>
              <Text style={styles.label}>{`${phase} Load Current (A)`}</Text>
              <TextInput
                value={feeder[`${phase}_load_current`] || ''}
                onChangeText={(value) => handleFeederChange(index, `${phase}_load_current`, value)}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                error={!!errors[index]?.[`${phase}_load_current`]}
              />
            </View>
          ))}

          {/* Fuse Rating Fields */}
          {['R', 'S', 'T'].map((phase) => (
            <View key={`${phase}_fuse_rating`} style={styles.formField}>
              <Text style={styles.label}>{`${phase} Fuse Rating (A)`}</Text>
              <TextInput
                value={feeder[`${phase}_fuse_rating`] || ''}
                onChangeText={(value) => handleFeederChange(index, `${phase}_fuse_rating`, value)}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                error={!!errors[index]?.[`${phase}_fuse_rating`]}
              />
            </View>
          ))}
        </View>
      ))}

      {/* Add Feeder Button */}
      <TouchableOpacity style={styles.addButton} onPress={addFeeder}>
        <Text style={styles.addButtonText}>Add Another Feeder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  form: {
    maxHeight: '70%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  feederContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  feederHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  feederTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    padding: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0e8ff',
  },
  addButtonText: {
    color: '#2196F3',
    marginLeft: 8,
    fontWeight: '500',
  },
});