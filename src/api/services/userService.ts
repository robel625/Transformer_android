import apiClient from '../apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface SignInReq {
  username: string;
  password: string;
}

export interface SignUpReq extends SignInReq {
  email: string;
}

export interface UpdatePasswordReq {
  old_password: string;
  new_password: string;
}

interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

const userService = {
  signin: async (data: { username: string; password: string }): Promise<SignInResponse> => {
    const response = await apiClient.post('/auth/signin', data);
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('refreshToken', response.refreshToken);
    await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    return response;
  },

  signup: async (data: SignUpReq) => {
    const response = await apiClient.post('/auth/signup', data);
    await AsyncStorage.setItem('userToken', response.token);
    return response;
  },

  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API call success
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userData',
        'userToken'
      ]);
    }
  },

  updateUserProfile: async (userId: string, data: Partial<UserInfo>) => {
    return apiClient.patch(`/auth/users/${userId}`, data);
  },

  updateAvatar: async (userId: string, imageUri: string) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image';

    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    return apiClient.patch(`/auth/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updatePassword: async (data: UpdatePasswordReq) => {
    return apiClient.post('/auth/users/password', data);
  },

  resetPassword: async (email: string) => {
    return apiClient.post('/auth/reset-password', { email });
  },

  getUser: async (id: string): Promise<UserInfo> => {
    return apiClient.get(`/auth/users/${id}`);
  },

  checkAuth: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  }
};

export default userService;



