/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useCallback } from 'react';
import AppControlFlow from './src/AppControlFlow';
import { HotUpdater } from "@hot-updater/react-native";
import SplashScreen from './src/components/SplashScreen';
import DatabaseInitializer from './src/components/DatabaseInitializer';

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const handleInitialized = useCallback(() => {
    setIsInitialized(true);
  }, []);
  
  // Conditional rendering based on initialization state
  return isInitialized ? <AppControlFlow /> : <DatabaseInitializer onInitialized={handleInitialized} />;
};

// Hot updater configuration
const HOT_UPDATER_CONFIG = {
  source: "https://rgcehrbqtrgmwyxdkfsk.supabase.co/functions/v1/update-server",
  requestHeaders: {},
  reloadOnForceUpdate: true,
  fallbackComponent: SplashScreen,
};

// Wrap with HotUpdater and memoize for performance
export default HotUpdater.wrap(HOT_UPDATER_CONFIG)(React.memo(App));







