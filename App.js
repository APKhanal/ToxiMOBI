import React, { useEffect, useState, useCallback } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { store } from './ToxiGuard/src/store';
import AppNavigator from './ToxiGuard/src/navigation';
import { lightTheme, darkTheme, getTheme } from './ToxiGuard/src/theme';
import { initializeLanguage } from './ToxiGuard/src/i18n';
import { registerForPushNotifications } from './ToxiGuard/src/services/notificationService';
import * as SplashScreen from 'expo-splash-screen';
import { selectTheme } from './ToxiGuard/src/store/slices/uiSlice';
import { useSelector } from 'react-redux';

// Ignore specific warnings if needed
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted from react-native core',
]);

// Keep the splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

// Main theme provider component that reads from Redux
const ThemedApp = () => {
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);
  
  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
    </>
  );
};

import { Platform } from 'react-native';

// Mock or disable problematic Expo dev tools for iOS to avoid withDevTools error
if (Platform.OS === 'ios') {
  // This is a workaround for the withDevTools error related to useOptionalKeepAwake
  console.log('Running on iOS, applying workaround for Expo dev tools');
  // Mock expo-keep-awake to prevent useOptionalKeepAwake error
  jest.mock('expo-keep-awake', () => ({
    useKeepAwake: () => {},
    activateKeepAwake: () => {},
    deactivateKeepAwake: () => {},
  }));
}

// Main App component
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Initialize app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize language from storage or device settings
        await initializeLanguage();
        
        // Wait for fonts to load
        // If using custom fonts, load them here with expo-font
        
        // Any other initialization logic
        
        // Artificial delay for development purposes
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Error initializing app:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);
  
  // Initialize push notifications after app is ready
  useEffect(() => {
    if (appIsReady) {
      // Register for push notifications
      // This is done after initial render to avoid slowing down app startup
      const setupNotifications = async () => {
        try {
          await registerForPushNotifications();
        } catch (error) {
          console.log('Error setting up push notifications:', error);
        }
      };
      
      setupNotifications();
    }
  }, [appIsReady]);
  
  // Handle when the app is ready to be shown
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide the splash screen
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ReduxProvider store={store}>
      <ThemedApp onLayout={onLayoutRootView} />
    </ReduxProvider>
  );
}
