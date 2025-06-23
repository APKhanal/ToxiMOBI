import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PaperProvider } from 'react-native-paper';

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

// Mock react-native-safe-area-context to avoid native module issues
jest.mock('react-native-safe-area-context', () => {
  const mockComponent = jest.fn(() => null);
  return {
    SafeAreaView: mockComponent,
    SafeAreaProvider: mockComponent,
    SafeAreaConsumer: mockComponent,
    useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  };
});

// Mock @expo/vector-icons to avoid native module issues
jest.mock('@expo/vector-icons', () => {
  const mockComponent = jest.fn(() => null);
  return {
    MaterialCommunityIcons: mockComponent,
    AntDesign: mockComponent,
    createIconSet: jest.fn(() => mockComponent),
  };
});

// Mock expo-localization to avoid native module issues
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
  locale: 'en-US',
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

// Mock Firebase modules to avoid native module issues
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

// Mock @react-native-async-storage/async-storage to avoid native module issues
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: jest.fn(() => Promise.resolve(null)),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve(null)),
    clear: jest.fn(() => Promise.resolve(null)),
  },
}));

import LanguageScreen from '../../src/screens/settings/LanguageScreen';
import ThemeScreen from '../../src/screens/settings/ThemeScreen';
import i18n from '../../src/i18n';
import { lightTheme, darkTheme } from '../../src/theme';
import rootReducer from '../../src/store';
import { setLanguage } from '../../src/store/slices/uiSlice';
import { LANGUAGES } from '../../src/i18n/constants';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    preloadedState: {
      ui: {
        language: 'en',
        themeMode: 'light',
        isAppReady: true,
        ...initialState,
      },
    },
  });
};

// Mock navigation
const mockNavigation = {
  goBack: jest.fn(),
};

describe('Language Selection Feature', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Set language to English before each test
    i18n.changeLanguage('en');
  });

  test('renders language options correctly', () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <PaperProvider theme={lightTheme}>
          <LanguageScreen navigation={mockNavigation} />
        </PaperProvider>
      </Provider>
    );

    // Verify that language options are displayed
    LANGUAGES.forEach(language => {
      expect(getByText(language.name)).toBeTruthy();
      expect(getByText(language.nativeName)).toBeTruthy();
    });
  });

  test('changes language selection when an option is pressed', () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <PaperProvider theme={lightTheme}>
          <LanguageScreen navigation={mockNavigation} />
        </PaperProvider>
      </Provider>
    );

    // Click on Spanish language option
    fireEvent.press(getByText('Spanish'));
    // Click apply button
    fireEvent.press(getByText('Apply'));

    // Verify that navigation.goBack was called
    expect(mockNavigation.goBack).toHaveBeenCalled();
    
    // Get the dispatched actions
    const actions = store.getState().ui.language;
    
    // Verify language was changed in the Redux store
    expect(actions).toBe('es');
  });

  test('cancels language change when cancel button is pressed', () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <PaperProvider theme={lightTheme}>
          <LanguageScreen navigation={mockNavigation} />
        </PaperProvider>
      </Provider>
    );

    // Click on Spanish language option
    fireEvent.press(getByText('Spanish'));
    // Click cancel button
    fireEvent.press(getByText('Cancel'));

    // Verify that navigation.goBack was called
    expect(mockNavigation.goBack).toHaveBeenCalled();
    
    // Verify language wasn't changed in the Redux store
    expect(store.getState().ui.language).toBe('en');
  });
});

describe('Theme Selection Feature', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders theme options correctly', () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <PaperProvider theme={lightTheme}>
          <ThemeScreen navigation={mockNavigation} />
        </PaperProvider>
      </Provider>
    );

    // Verify that theme options are displayed
    expect(getByText(i18n.t('settings.lightTheme'))).toBeTruthy();
    expect(getByText(i18n.t('settings.darkTheme'))).toBeTruthy();
    expect(getByText(i18n.t('settings.systemTheme'))).toBeTruthy();
  });

  test('changes theme selection when an option is pressed', () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <PaperProvider theme={lightTheme}>
          <ThemeScreen navigation={mockNavigation} />
        </PaperProvider>
      </Provider>
    );

    // Click on Dark Theme option
    fireEvent.press(getByText(i18n.t('settings.darkTheme')));
    // Click apply button
    fireEvent.press(getByText(i18n.t('common.apply')));

    // Verify that navigation.goBack was called
    expect(mockNavigation.goBack).toHaveBeenCalled();
    
    // Verify theme was changed in the Redux store
    expect(store.getState().ui.themeMode).toBe('dark');
  });

  test('cancels theme change when cancel button is pressed', () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <PaperProvider theme={lightTheme}>
          <ThemeScreen navigation={mockNavigation} />
        </PaperProvider>
      </Provider>
    );

    // Click on Dark Theme option
    fireEvent.press(getByText(i18n.t('settings.darkTheme')));
    // Click cancel button
    fireEvent.press(getByText(i18n.t('common.cancel')));

    // Verify that navigation.goBack was called
    expect(mockNavigation.goBack).toHaveBeenCalled();
    
    // Verify theme wasn't changed in the Redux store
    expect(store.getState().ui.themeMode).toBe('light');
  });
});

describe('i18n Translations', () => {
  test('changes language correctly', () => {
    // Set language to English initially
    i18n.changeLanguage('en');
    
    // Verify English translations
    expect(i18n.t('common.apply')).toBe('Apply');
    expect(i18n.t('settings.language')).toBe('Language');
    
    // Change language to Spanish
    i18n.changeLanguage('es');
    
    // Verify Spanish translations
    expect(i18n.t('common.apply')).toBe('Aplicar');
    expect(i18n.t('settings.language')).toBe('Idioma');
  });
});

describe('Theme Selection with Redux Integration', () => {
  test('applies theme correctly through Redux', () => {
    const store = createTestStore();
    
    // Verify initial theme is light
    expect(store.getState().ui.themeMode).toBe('light');
    
    // Dispatch action to change theme to dark
    store.dispatch({ type: 'ui/setTheme', payload: 'dark' });
    
    // Verify theme was changed to dark
    expect(store.getState().ui.themeMode).toBe('dark');
    
    // Dispatch action to change theme to system
    store.dispatch({ type: 'ui/setTheme', payload: 'system' });
    
    // Verify theme was changed to system
    expect(store.getState().ui.themeMode).toBe('system');
  });
});

describe('Language Selection with Redux Integration', () => {
  test('applies language correctly through Redux', () => {
    const store = createTestStore();
    
    // Verify initial language is English
    expect(store.getState().ui.language).toBe('en');
    
    // Dispatch action to change language to Spanish
    store.dispatch(setLanguage('es'));
    
    // Verify language was changed to Spanish
    expect(store.getState().ui.language).toBe('es');
    
    // Dispatch action to change language to French
    store.dispatch(setLanguage('fr'));
    
    // Verify language was changed to French
    expect(store.getState().ui.language).toBe('fr');
  });
});
