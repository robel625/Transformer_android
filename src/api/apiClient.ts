import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const BASE_URL = Platform.select({
  ios: 'http://localhost:8000',
  android: 'https://trafoback.eeuethics.et', // Android emulator localhost
  // android: 'http://197.156.127.150:9010', 
  // android: 'http://192.168.0.5:8000', // Android device localhost
});

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      // Navigation will be handled by the auth check
    }
    return Promise.reject(error);
  }
);

export default apiClient;


const apisync = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apisync.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apisync.interceptors.response.use(
  (response) => {
    return {
      status: response.status,
      data: response.data
    };
  },
  async (error) => {
    return {
      status: error.response?.status,
      error: error.response?.data
    };
  }
);

export { apisync };





