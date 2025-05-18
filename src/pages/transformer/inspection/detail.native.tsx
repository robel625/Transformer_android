import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';
import type { Inspection } from '@/types/entity';
import dayjs from 'dayjs';
import LvFeederList from './LvFeeder/index.native';

export default function InspectionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  
  const [data, setData] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await transformerService.getPopulatedInspection(id);
      setData(response);
    } catch (error) {
      console.error('Error fetching inspection:', error);
      showToast('Failed to load inspection details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load inspection details</Text>
      </View>
    );
  }

  const inspectionDetails = [
    { label: 'ID', value: data.id },
    { label: 'Transformer ID', value: data.transformer_data?.id },
    { label: 'Base Station Code', value: data.transformer_data?.basestation?.station_code },
    { label: 'Body Condition', value: data.body_condition },
    { label: 'Arrester', value: data.arrester },
    { label: 'Drop Out', value: data.drop_out },
    { label: 'Fuse Link', value: data.fuse_link },
    { label: 'MV Bushing', value: data.mv_bushing },
    { label: 'MV Cable Lug', value: data.mv_cable_lug },
    { label: 'LV Bushing', value: data.lv_bushing },
    { label: 'LV Cable Lug', value: data.lv_cable_lug },
    { label: 'Oil Level', value: data.oil_level },
    { label: 'Insulation Level', value: data.insulation_level },
    { label: 'Horn Gap', value: data.horn_gap },
    { label: 'Silica Gel', value: data.silica_gel },
    { label: 'Has Linkage', value: data.has_linkage ? 'Yes' : 'No' },
    { label: 'Arrester Body Ground', value: data.arrester_body_ground },
    { label: 'Neutral Ground', value: data.neutral_ground },
    { label: 'Status of Mounting', value: data.status_of_mounting },
    { label: 'Mounting Condition', value: data.mounting_condition },
    { label: 'N Load Current', value: data.N_load_current },
    { label: 'R-S Voltage', value: data.R_S_Voltage },
    { label: 'R-T Voltage', value: data.R_T_Voltage },
    { label: 'T-S Voltage', value: data.T_S_Voltage },
    { label: 'Created By', value: data.created_by?.username },
    { label: 'Updated By', value: data.updated_by?.username },
    { label: 'Created At', value: dayjs(data.created_at).format('YYYY-MM-DD HH:mm') },
    { label: 'Updated At', value: dayjs(data.updated_at).format('YYYY-MM-DD HH:mm') },
    { label: 'Voltage Phase Unbalance', value: data.voltage_phase_unbalance },
    { label: 'Average Voltage', value: data.average_voltage },
  ];

  const sections = [
    {
      title: 'details',
      data: [inspectionDetails],
      renderItem: () => (
        <View style={styles.content}>
          <View style={styles.card}>
            {inspectionDetails.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.label}>{item.label}:</Text>
                <Text style={styles.value}>{item.value || 'N/A'}</Text>
              </View>
            ))}
          </View>
        </View>
      )
    },
    {
      title: 'lvfeeders',
      data: [id],
      renderItem: () => <LvFeederList inspectionId={id} />
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Details</Text>
      </View>

      <SectionList
        sections={sections}
        renderItem={({ section }) => section.renderItem()}
        renderSectionHeader={() => null}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  value: {
    flex: 2,
    fontSize: 14,
  },
});
