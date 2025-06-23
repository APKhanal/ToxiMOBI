// Mock react-native components and APIs that might cause issues in tests
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock the Linking API
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
}));

// Mock react-native comprehensively to prevent native module errors
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      OS: 'ios',
      Version: '14.0',
      select: jest.fn((obj) => obj.ios || obj.default || obj.android || obj.web || obj.native),
    },
    NativeModules: {
      ...RN.NativeModules,
      PlatformConstants: { isTesting: true },
      AccessibilityInfo: {
        isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
        isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
        isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
        isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
        isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
        isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
        addEventListener: jest.fn(() => ({ remove: jest.fn() })),
        setAccessibilityFocus: jest.fn(),
        announceForAccessibility: jest.fn(),
        prefersReducedMotion: jest.fn(() => false),
      },
    },
    AccessibilityInfo: {
      isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
      isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
      isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
      isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
      isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      setAccessibilityFocus: jest.fn(),
      announceForAccessibility: jest.fn(),
      prefersReducedMotion: jest.fn(() => false),
    },
  };
});

// Mock specific react-native sub-modules to ensure no native access
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  PlatformConstants: { isTesting: true },
}));

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: jest.fn(() => null),
  getEnforcing: jest.fn(() => null),
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default || obj.android || obj.web || obj.native),
}));

jest.mock('react-native/Libraries/Utilities/NativePlatformConstantsIOS', () => ({
  isTesting: true,
}));

jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
  isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
  isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
  isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
  isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  setAccessibilityFocus: jest.fn(),
  announceForAccessibility: jest.fn(),
  prefersReducedMotion: jest.fn(() => false),
}));

// Mock Expo modules to avoid native module errors
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en', languageTag: 'en-US' }]),
  getCalendars: jest.fn(() => []),
  locale: 'en-US',
  timezone: 'America/New_York',
  isRTL: false,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: jest.fn(() => null),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
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

// Mock the i18n index.js file directly to avoid issues with 'i18n-js'
jest.mock('./ToxiGuard/src/i18n/index.js', () => {
  let currentLocale = 'en'; // Start with English as default
  const translations = {
    en: {
      'common.apply': 'Apply',
      'common.cancel': 'Cancel',
      'languages.en': 'English',
      'languages.es': 'Spanish'
    },
    es: {
      'common.apply': 'Aplicar',
      'common.cancel': 'Cancelar',
      'languages.en': 'Inglés',
      'languages.es': 'Español'
    }
  };
  const mockI18n = {
    t: jest.fn((key) => translations[currentLocale][key] || 'mocked translation'),
    get locale() {
      return currentLocale;
    },
    set locale(value) {
      currentLocale = value;
    },
    defaultLocale: 'en',
    enableFallback: true,
    translations: translations
  };
  return {
    ...mockI18n,
    initializeLanguage: jest.fn(() => Promise.resolve(currentLocale)),
    setLanguage: jest.fn((locale) => {
      currentLocale = locale;
      return Promise.resolve(true);
    }),
    getCurrentLanguage: jest.fn(() => currentLocale),
    getSupportedLanguages: jest.fn(() => [
      { code: 'en', name: translations[currentLocale]['languages.en'] },
      { code: 'es', name: translations[currentLocale]['languages.es'] }
    ])
  };
});
