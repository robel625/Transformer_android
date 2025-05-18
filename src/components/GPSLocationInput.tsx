import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, PermissionsAndroid, Alert } from 'react-native';
import { TextInput, ProgressBar } from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface GPSLocationInputProps {
  value: string;
  onChange: (value: string, accuracy?: number) => void;
  style?: any;
  accuracyThreshold?: number;
}

interface LocationReading {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export function GPSLocationInput({ 
  value, 
  onChange, 
  style,
  accuracyThreshold = 50
}: GPSLocationInputProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);
  
  const locationReadings = useRef<LocationReading[]>([]);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const watchId = useRef<number | null>(null);

  const COLLECTION_DURATION = 20000; // 20 seconds
  const PROGRESS_UPDATE_INTERVAL = 50; // 50ms for smooth progress bar

  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return '#666';
    if (accuracy <= 10) return '#4CAF50';
    if (accuracy <= 30) return '#FFC107';
    if (accuracy <= 50) return '#FF9800';
    return '#F44336';
  };

  const startProgressBar = () => {
    const startTime = Date.now();
    setProgress(0);
    
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = elapsed / COLLECTION_DURATION;
      
      if (newProgress >= 1) {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        finishCollection();
      } else {
        setProgress(newProgress);
      }
    }, PROGRESS_UPDATE_INTERVAL);
  };

  const startLocationWatch = async () => {
    const hasPermission = Platform.OS === 'ios' 
      ? await hasPermissionIOS()
      : await hasPermissionAndroid();

    if (!hasPermission) return;

    watchId.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        locationReadings.current.push({
          latitude,
          longitude,
          accuracy,
          timestamp: Date.now()
        });

        // Update current best accuracy
        const bestReading = getBestReading();
        if (bestReading) {
          setCurrentAccuracy(bestReading.accuracy);
          setStatusMessage(`Best accuracy: ${bestReading.accuracy.toFixed(0)}m`);
        }
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 1000,
        fastestInterval: 500
      }
    );
  };

  const getBestReading = (): LocationReading | null => {
    if (locationReadings.current.length === 0) return null;
    return locationReadings.current.reduce((best, current) => 
      current.accuracy < best.accuracy ? current : best
    );
  };

  const finishCollection = () => {
    setIsCollecting(false);
    setProgress(1);
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    const bestReading = getBestReading();
    if (bestReading) {
      const gpsString = `${bestReading.latitude},${bestReading.longitude}`;
      onChange(gpsString, bestReading.accuracy);
      setStatusMessage(`Location set with ${bestReading.accuracy.toFixed(0)}m accuracy`);
      setCurrentAccuracy(bestReading.accuracy);
    } else {
      setStatusMessage('No accurate readings obtained');
    }

    setLoading(false);
    locationReadings.current = [];
  };

  const getCurrentLocation = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setIsCollecting(true);
      setStatusMessage('Collecting GPS data...');
      locationReadings.current = [];

      await startLocationWatch();
      startProgressBar();

    } catch (error) {
      console.error('Location error:', error);
      handleLocationError(error);
      setLoading(false);
      setIsCollecting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
      Geolocation.stopObserving();
    };
  }, []);

  const hasPermissionIOS = async () => {
    try {
      const status = await Geolocation.requestAuthorization('whenInUse');
      if (status === 'granted') {
        return true;
      }
      
      setStatusMessage('Location permission denied');
      return false;
    } catch (error) {
      console.error('iOS permission error:', error);
      setStatusMessage('Error checking permissions');
      return false;
    }
  };

  const hasPermissionAndroid = async () => {
    try {
      if (Platform.Version < 23) {
        return true;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to location to get your GPS coordinates.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      setStatusMessage('Location permission denied');
      return false;
    } catch (error) {
      console.error('Android permission error:', error);
      setStatusMessage('Error checking permissions');
      return false;
    }
  };

  const handleLocationError = (error: any) => {
    let message = 'Error getting location';
    if (error.code === 1) {
      message = 'Location permission denied';
    } else if (error.code === 2) {
      message = 'Location unavailable';
    } else if (error.code === 3) {
      message = 'Location request timeout';
    }
    
    setStatusMessage(message);
    Alert.alert(
      'Location Error',
      'Failed to get your location. Please make sure location services are enabled and try again.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          label="GPS Location"
          value={value}
          editable={false} // Make input read-only
          style={[styles.input, style]}
          placeholder="Use location button to get GPS coordinates"
          right={
            <TextInput.Icon
              icon={() => (
                <TouchableOpacity 
                  onPress={getCurrentLocation} 
                  disabled={loading}
                  style={styles.iconButton}
                >
                  <Icon 
                    name={loading ? 'location-searching' : 'my-location'} 
                    size={24} 
                    color={loading ? '#999' : '#6200ee'}
                  />
                </TouchableOpacity>
              )}
            />
          }
        />
      </View>
      {isCollecting && (
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color="#6200ee" 
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {`Collecting GPS data (${(progress * 100).toFixed(0)}%)`}
          </Text>
        </View>
      )}
      <View style={styles.statusContainer}>
        {statusMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}
        {currentAccuracy !== null && (
          <View style={styles.accuracyIndicator}>
            <View 
              style={[
                styles.accuracyDot, 
                { backgroundColor: getAccuracyColor(currentAccuracy) }
              ]} 
            />
            <Text style={styles.accuracyText}>
              Accuracy: {currentAccuracy.toFixed(0)}m
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 4,
    marginLeft: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  accuracyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  accuracyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
  },
  iconButton: {
    padding: 8,
  }
});







