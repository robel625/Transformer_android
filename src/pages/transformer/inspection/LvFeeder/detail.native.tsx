import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';
import dayjs from 'dayjs';

interface LvFeeder {
  id?: number;
  type_of_distribution_box: string;
  inspection_id: number;
  R_load_current: number;
  S_load_current: number;
  T_load_current: number;
  R_fuse_rating: string;
  S_fuse_rating: string;
  T_fuse_rating: string;
  created_at: string;
  updated_at: string;
  created_by: {
    email: string;
  };
  updated_by: {
    email: string;
  };
  inspection_data?: {
    id: number;
    transformer_data: number;
  };
  transformer_load?: number;
  current_phase_unbalance?: number;
  percentage_of_neutral?: number;
}

export default function LvFeederDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const [data, setData] = useState<LvFeeder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await transformerService.getPopulatedLvFeeder(id);
      setData(response);
    } catch (error) {
      console.error('Error fetching LvFeeder data:', error);
      showToast('Failed to load LvFeeder data');
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

  const DetailRow = ({ label, value }: { label: string; value: any }) => (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );

  const LinkRow = ({ label, value, onPress }: { label: string; value: any; onPress: () => void }) => (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}:</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.link}>{value || 'N/A'}</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.errorText}>Failed to load LvFeeder data</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LvFeeder Details</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.card}>
          <DetailRow label="ID" value={data.id} />
          
          <LinkRow
            label="Transformer ID"
            value={data.inspection_data?.transformer_data}
            onPress={() => navigation.navigate('TransformerDetail', {
              id: data.inspection_data?.transformer_data
            })}
          />
          
          <LinkRow
            label="Inspection ID"
            value={data.inspection_data?.id}
            onPress={() => navigation.navigate('InspectionDetail', {
              id: data.inspection_data?.id
            })}
          />

          <DetailRow label="Distribution Box" value={data.type_of_distribution_box} />
          <DetailRow label="R Load Current" value={data.R_load_current} />
          <DetailRow label="S Load Current" value={data.S_load_current} />
          <DetailRow label="T Load Current" value={data.T_load_current} />
          <DetailRow label="R Fuse Rating" value={data.R_fuse_rating} />
          <DetailRow label="S Fuse Rating" value={data.S_fuse_rating} />
          <DetailRow label="T Fuse Rating" value={data.T_fuse_rating} />
          <DetailRow label="Created By" value={data.created_by?.username} />
          <DetailRow label="Updated By" value={data.updated_by?.username} />
          <DetailRow label="Created At" value={ dayjs(data.created_at).format('YYYY-MM-DD HH:mm') } />
          <DetailRow label="Updated At" value= { dayjs(data.updated_at).format('YYYY-MM-DD HH:mm') } />
          <DetailRow label="Transformer Load" value={data.transformer_load} />
          <DetailRow label="Current Phase Unbalance" value={data.current_phase_unbalance} />
          <DetailRow label="Percentage of Neutral" value={data.percentage_of_neutral} />

        </View>
      </ScrollView>
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
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  link: {
    flex: 1,
    fontSize: 16,
    color: '#1890ff',
    textDecorationLine: 'underline',
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
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4f',
    textAlign: 'center',
  },
});