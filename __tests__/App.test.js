/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

// Mock the necessary modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(() => ({})),
}));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
}));
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
}));
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
}));
jest.mock('firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  isSupported: jest.fn(() => Promise.resolve(false)),
}));

// Mock react-native-paper to avoid native module issues
jest.mock('react-native-paper', () => {
  const mockComponent = jest.fn(() => null);
  return {
    Provider: mockComponent,
    PaperProvider: mockComponent,
    DefaultTheme: { colors: { primary: '#3498db' } },
    DarkTheme: { colors: { primary: '#1e88e5' } },
    configureFonts: jest.fn(() => ({
      regular: { fontFamily: 'Roboto-Regular' },
      medium: { fontFamily: 'Roboto-Medium' },
      light: { fontFamily: 'Roboto-Light' },
      thin: { fontFamily: 'Roboto-Thin' },
    })),
    Button: mockComponent,
    Text: mockComponent,
    TextInput: mockComponent,
    Appbar: mockComponent,
    Card: mockComponent,
    IconButton: mockComponent,
    Divider: mockComponent,
    List: {
      Item: mockComponent,
      Icon: mockComponent,
      Accordion: mockComponent,
    },
    Switch: mockComponent,
    FAB: mockComponent,
    Chip: mockComponent,
    Avatar: mockComponent,
    ProgressBar: mockComponent,
    Dialog: mockComponent,
    Portal: mockComponent,
    Modal: mockComponent,
    ActivityIndicator: mockComponent,
    Snackbar: mockComponent,
    Menu: mockComponent,
    Searchbar: mockComponent,
    BottomNavigation: mockComponent,
    Banner: mockComponent,
    Checkbox: mockComponent,
    RadioButton: mockComponent,
    ToggleButton: mockComponent,
    DataTable: mockComponent,
    HelperText: mockComponent,
    Caption: mockComponent,
    Subheading: mockComponent,
    Headline: mockComponent,
    Title: mockComponent,
    Paragraph: mockComponent,
    Surface: mockComponent,
    TouchableRipple: mockComponent,
    AnimatedFAB: mockComponent,
    SegmentedButtons: mockComponent,
  };
});

// Mock expo-status-bar to avoid native module issues
jest.mock('expo-status-bar', () => {
  const mockComponent = jest.fn(() => null);
  return {
    StatusBar: mockComponent,
  };
});

// Mock expo-file-system to avoid native module issues
jest.mock('expo-file-system', () => ({
  downloadAsync: jest.fn(() => Promise.resolve({ uri: 'mocked-uri' })),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  readAsStringAsync: jest.fn(() => Promise.resolve('mocked-content')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  documentDirectory: 'mocked-directory/',
  cacheDirectory: 'mocked-cache-directory/',
}));

// Mock expo-print to avoid native module issues
jest.mock('expo-print', () => ({
  print: jest.fn(() => Promise.resolve()),
  printToFileAsync: jest.fn(() => Promise.resolve({ uri: 'mocked-pdf-uri' })),
}));

// Mock expo-sharing to avoid native module issues
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock @react-native-async-storage/async-storage to avoid native module issues
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: jest.fn(() => Promise.resolve(null)),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve(null)),
    clear: jest.fn(() => Promise.resolve(null)),
  },
}));

// Mock react-native to avoid native module issues
jest.mock('react-native', () => {
  const mockComponent = jest.fn(() => null);
  return {
    StyleSheet: {
      create: jest.fn(() => ({})),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn(() => ({})),
    },
    View: mockComponent,
    Text: mockComponent,
    TouchableOpacity: mockComponent,
    FlatList: mockComponent,
    LogBox: {
      ignoreLogs: jest.fn(),
      ignoreAllLogs: jest.fn(),
    },
  };
});

it('renders correctly', () => {
  renderer.create(<App />);
});
