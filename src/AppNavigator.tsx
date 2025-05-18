import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './pages/auth';
import DrawerNavigator from './DrawerNavigator';
import TransformerDetailScreen from './pages/transformer/detail.native';
import BasestationDetailScreen from './pages/basestation/detail.native';
import InspectionDetailScreen from './pages/transformer/inspection/detail.native';
import LvFeederDetailScreen from './pages/transformer/inspection/LvFeeder/detail.native';
import PendingSyncPage from './pages/sync/PendingSyncPage';

const Stack = createStackNavigator();

const NavigationContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#54D3C2" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
          <Stack.Screen name="TransformerDetail" component={TransformerDetailScreen} />
          <Stack.Screen name="BasestationDetail" component={BasestationDetailScreen} />
          <Stack.Screen name="InspectionDetail" component={InspectionDetailScreen} />
          <Stack.Screen name="LvFeederDetail" component={LvFeederDetailScreen} />
          <Stack.Screen name="pending_sync" component={PendingSyncPage} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <NavigationContent />
      </NavigationContainer>
    </AuthProvider>
  );
}


