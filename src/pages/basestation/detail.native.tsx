import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import transformerService from '@/api/services/transformerService';
import { showToast } from '@/util/action';
import type { Basestation } from '@/types/entity';
import BasestationMap from '../transformer/BasestationMap';
import OfflineIndicator from '@/components/OfflineIndicator';

interface TransformerMovement {
  id: number;
  timestamp: string;
  transformer_id: string;
  movement_type: 'moved_in' | 'moved_out' | 'feeder_change' | 'substation_change';
  old_location: string;
  new_location: string;
  changed_by: string;
  reason?: string;
}

interface CurrentTransformer {
  id: string;
  serial_number: string;
}

const ITEMS_PER_PAGE = 100;

export default function BasestationDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Basestation | null>(null);
  const [changeLogs, setChangeLogs] = useState<TransformerMovement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [currentTransformers, setCurrentTransformers] = useState<CurrentTransformer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { station_code } = route.params as { station_code: string };

  const fetchData = async () => {
    try {
      const response = await transformerService.getBasestation(station_code);
      setData(response);
    } catch (error) {
      console.error("Error fetching basestation:", error);
      showToast('Failed to load basestation details');
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeLogs = async (page: number, append: boolean = false) => {
    setTimelineLoading(true);
    try {
      const response = await transformerService.getBasestationChangeLogs(station_code, page, ITEMS_PER_PAGE);
      setCurrentTransformers(response.current_transformers || []);
      
      const newLogs = response.movements?.results || [];
      const totalCount = response.movements?.count || 0;

      if (append) {
        setChangeLogs(prev => [...prev, ...newLogs]);
      } else {
        setChangeLogs(newLogs);
      }

      setHasMore(page * ITEMS_PER_PAGE < totalCount);
    } catch (error) {
      console.error("Error fetching change logs:", error);
      showToast('Failed to load change logs');
      setChangeLogs([]);
      setCurrentTransformers([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!timelineLoading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchChangeLogs(nextPage, true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await fetchChangeLogs(1, false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    fetchChangeLogs(1, false);
  }, [station_code]);

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
        <Text style={styles.errorText}>Failed to load basestation details</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineIndicator />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Basestation Details</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Basic Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>
          <View style={styles.infoContainer}>
            <InfoRow label="Station Code" value={data.station_code} />
            <InfoRow label="Region" value={data.region} />
            <InfoRow label="CSC" value={data.csc} />
            <InfoRow label="Substation" value={data.substation} />
            <InfoRow label="Feeder" value={data.feeder} />
            <InfoRow label="Address" value={data.address} />
            <InfoRow label="GPS Location" value={data.gps_location} />
            <InfoRow label="Station Type" value={data.station_type} />
            <InfoRow label="Created At" value={dayjs(data.created_at).format("MMM DD, YYYY h:mm A")} />
            <InfoRow label="Updated At" value={dayjs(data.updated_at).format("MMM DD, YYYY h:mm A")} />
            <InfoRow label="Created By" value={data.created_by?.username} />
            <InfoRow label="Updated By" value={data.updated_by?.username} />
          </View>
        </View>

        {/* Map */}
        {data.gps_location && (
          <View style={styles.mapContainer}>
            <BasestationMap gps_location={data.gps_location} />
          </View>
        )}

        {/* Current Transformers */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Transformers</Text>
          {currentTransformers.length > 0 ? (
            currentTransformers.map((transformer) => (
              <View key={transformer.id} style={styles.transformerItem}>
                <View>
                  <Text style={styles.transformerId}>Transformer ID: {transformer.id}</Text>
                  <Text style={styles.transformerSerial}>
                    Serial Number: {transformer.serial_number}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TransformerDetail', { id: transformer.id })}
                >
                  <Icon name="arrow-forward" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No transformers currently at this location</Text>
          )}
        </View>

        {/* Historical Movements Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historical Movements</Text>
          {changeLogs.length > 0 ? (
            changeLogs.map((log: TransformerMovement, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.timestamp}>
                  {dayjs(log.timestamp).format("MMM DD, YYYY h:mm A")}
                </Text>
                <View style={styles.logContent}>
                  {log.movement_type === 'feeder_change' ? (
                    <Text style={styles.logText}>Feeder changed</Text>
                  ) : log.movement_type === 'substation_change' ? (
                    <Text style={styles.logText}>Substation changed</Text>
                  ) : (
                    <Text style={styles.logText}>
                      Transformer {log.transformer_id.replace('TR-', '')} 
                      {log.movement_type === 'moved_in' ? ' moved into ' : ' moved out of '}
                      this location
                    </Text>
                  )}
                  <Text style={styles.logDetails}>Changed by: {log.changed_by}</Text>
                  {log.reason && <Text style={styles.logDetails}>Reason: {log.reason}</Text>}
                  <Text style={styles.logDetails}>
                    {log.movement_type === 'feeder_change' ? 'Previous Feeder: ' : 'From: '}
                    {log.old_location}
                  </Text>
                  <Text style={[styles.logDetails, { color: log.movement_type === 'moved_out' ? '#faad14' : '#52c41a' }]}>
                    {log.movement_type === 'feeder_change' ? 'New Feeder: ' : 'To: '}
                    {log.new_location}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No historical movements found</Text>
          )}
        </View>
          
        {hasMore && !timelineLoading && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);

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
  content: {
    flex: 1,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    width: 120,
    fontSize: 14,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 14,
  },
  mapContainer: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  transformerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transformerId: {
    fontSize: 16,
    fontWeight: '500',
  },
  transformerSerial: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 16,
  },
  logItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  logContent: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
  },
  logText: {
    fontSize: 14,
    marginBottom: 8,
  },
  logDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadMoreButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreText: {
    color: '#666',
    fontSize: 14,
  },
});
