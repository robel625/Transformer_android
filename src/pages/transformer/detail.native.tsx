import React, { useState, useEffect } from 'react';
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
import dayjs from 'dayjs';
import transformerService from '@/api/services/transformerService';
import logService from '@/api/services/logService';
import { showToast } from '@/util/action';
import type { TransformerData } from '@/types/entity';
import BasestationMap from './BasestationMap';
import InspectionScreen from './inspection/index.native';
import OfflineIndicator from '@/components/OfflineIndicator';

const ITEMS_PER_PAGE = 10;

export default function TransformerDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params as { id: string };
    const [data, setData] = useState<TransformerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTimeline, setShowTimeline] = useState(false);
    const [changeLogs, setChangeLogs] = useState<any[]>([]);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!id) {
            showToast("Invalid transformer ID");
            navigation.goBack();
            return;
        }

        try {
            const response = await transformerService.getPopulatedTransformer(id);
            if (!response) {
                throw new Error('No data received');
            }
            setData(response);
        } catch (error) {
            console.error("Error fetching transformer data:", error);
            showToast("Failed to load transformer data");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const fetchChangeLogs = async (page: number, append: boolean = false) => {
        if (!id) return;
        
        setTimelineLoading(true);
        try {
            const response = await logService.getSpecificChangeLogs(
                id,
                'Transformer Data',
                {
                    page,
                    pageSize: ITEMS_PER_PAGE,
                    field_name: "basestation",
                }
            );

            const newLogs = response?.results || [];
            const totalCount = response?.count || 0;

            if (append) {
                setChangeLogs(prev => [...prev, ...newLogs]);
            } else {
                setChangeLogs(newLogs);
            }

            setHasMore(page * ITEMS_PER_PAGE < totalCount);
        } catch (error) {
            console.error("Error fetching change logs:", error);
            showToast("Failed to load change logs");
            setChangeLogs([]);
        } finally {
            setTimelineLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !timelineLoading) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchChangeLogs(nextPage, true);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const AboutBase_Station = [
            {
                label: "Station Code",
                val: data?.basestation?.station_code,
            },
            {
                label: "Region",
                val: data?.basestation?.region,
            },
            {
                label: "CSC",
                val: data?.basestation?.csc,
            },
    
            {
                label: "Substation",
                val: data?.basestation?.substation,
            },
            {
                label: "Feeder",
                val: data?.basestation?.feeder,
            },
            {
                label: "Address",
                val: data?.basestation?.address,
            },
            {
                label: "GPS Location",
                val: data?.basestation?.gps_location,
            },
            {
                label: "Station Type",
                val: data?.basestation?.station_type,
            },
        ];

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
                <Text>Failed to load transformer details</Text>
            </View>
        );
    }

    const renderInfoItem = (label: string, value: any) => (
        <View style={styles.infoItem}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value}>{value || 'N/A'}</Text>
        </View>
    );

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
                <Text style={styles.headerTitle}>Transformer Details</Text>
                <TouchableOpacity
                    style={styles.timelineButton}
                    onPress={() => {
                        setShowTimeline(!showTimeline);
                        if (!showTimeline && changeLogs.length === 0) {
                            setCurrentPage(1);
                            fetchChangeLogs(1, false);
                        }
                    }}
                >
                    <Icon name="history" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <SectionList
                sections={[
                    {
                        title: 'main',
                        data: [1], // Just need one item to render the main content
                    }
                ]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item }) => (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Transformer Information</Text>
                            {renderInfoItem("Transformer ID", data.id)}
                            {renderInfoItem("Station Code", data.basestation?.station_code)}
                            {renderInfoItem("Transformer Type", data.trafo_type)}
                            {renderInfoItem("Capacity", data.capacity)}
                            {renderInfoItem("DT Number", data.dt_number)}
                            {renderInfoItem("Primary Voltage", data.primary_voltage)}
                            {renderInfoItem("Cooling Type", data.colling_type)}
                            {renderInfoItem("Serial Number", data.serial_number)}
                            {renderInfoItem("Manufacturer", data.manufacturer)}
                            {renderInfoItem("Vector Group", data.vector_group)}
                            {renderInfoItem("Impedance Voltage", data.impedance_voltage)}
                            {renderInfoItem("Winding Weight", data.winding_weight)}
                            {renderInfoItem("Oil Weight", data.oil_weight)}
                            {renderInfoItem("Year of Manufacturing", data.year_of_manufacturing)}
                            {renderInfoItem("Date of Installation", 
                                data.date_of_installation ? 
                                dayjs(data.date_of_installation).format('YYYY-MM-DD') : 
                                'N/A'
                            )}
                            {renderInfoItem("Created By", data.created_by?.username)}
                            {renderInfoItem("Updated By", data.updated_by?.username)}
                            {renderInfoItem("Created At", dayjs(data.created_at).format('YYYY-MM-DD HH:mm'))}
                            {renderInfoItem("Updated At", dayjs(data.updated_at).format('YYYY-MM-DD HH:mm'))}
                        </View>

                        {showTimeline && (
                            <View style={styles.timelineContainer}>
                                <Text style={styles.timelineTitle}>Movement History</Text>
                                {changeLogs.length === 0 && !timelineLoading ? (
                                    <Text style={styles.emptyText}>No movements found</Text>
                                ) : (
                                    changeLogs.map((log, index) => (
                                        <View key={`log-${index}`} style={styles.timelineItem}>
                                            <Text style={styles.timestamp}>
                                                {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm')}
                                            </Text>
                                            <Text style={styles.changedBy}>
                                                Changed by: {log.changed_by}
                                            </Text>
                                            <View style={styles.changeDetails}>
                                                <Text style={styles.oldValue}>
                                                    From: {log.old_value || 'None'}
                                                </Text>
                                                <Text style={styles.newValue}>
                                                    To: {log.new_value}
                                                </Text>
                                            </View>
                                        </View>
                                    ))
                                )}
                                
                                {timelineLoading && (
                                    <ActivityIndicator style={styles.timelineLoader} />
                                )}
                                
                                {!timelineLoading && hasMore && (
                                    <TouchableOpacity
                                        style={styles.loadMoreButton}
                                        onPress={handleLoadMore}
                                    >
                                        <Text style={styles.loadMoreText}>Load More</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {data?.basestation?.gps_location && (
                            <View style={styles.mapContainer}>
                                <BasestationMap gps_location={data.basestation.gps_location} />
                            </View>
                        )}

                        <View style={styles.basestationContainer}>
                            {data?.basestation ? (
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>Base Station Details</Text>
                                    <View style={styles.detailsContainer}>
                                        {AboutBase_Station.map((item) => (
                                            <View style={styles.detailRow} key={item.label}>
                                                <Text style={styles.detailLabel}>{item.label}:</Text>
                                                <Text style={styles.detailValue}>{item.val}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyCard}>
                                    <Text style={styles.emptyText}>No Base Station found</Text>
                                </View>
                            )}
                        </View>

                        <View style={{ marginTop: 40, marginHorizontal: 8 }}>
                            <InspectionScreen id={id} />
                        </View>
                    </>
                )}
                renderSectionHeader={() => null}
                stickySectionHeadersEnabled={false}
                keyExtractor={(item, index) => `section-${index}`}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    timelineButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    card: {
        margin: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        flex: 1,
        fontWeight: '500',
    },
    value: {
        flex: 2,
        color: '#666',
    },
    timelineContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
    },
    timelineTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    timelineItem: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    timestamp: {
        fontSize: 14,
        color: '#666',
    },
    changedBy: {
        fontSize: 14,
        marginTop: 4,
        color: '#444',
    },
    changeDetails: {
        marginTop: 8,
    },
    oldValue: {
        color: '#666',
    },
    newValue: {
        color: '#000',
        marginTop: 4,
    },
    timelineLoader: {
        marginVertical: 16,
    },
    loadMoreButton: {
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    loadMoreText: {
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 16,
    },
    mapContainer: {
        margin: 16,
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
    },
    basestationContainer: {
        margin: 16,
    },
    emptyCard: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        flex: 1,
        fontWeight: '500',
    },
    detailValue: {
        flex: 2,
        color: '#666',
    },
});



