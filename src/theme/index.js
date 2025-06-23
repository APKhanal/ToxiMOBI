import { configureFonts, DefaultTheme, DarkTheme } from 'react-native-paper';
import { Platform } from 'react-native';

// Font configuration
const fontConfig = {
  web: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  android: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  }
};

// Colors that are shared between themes
export const colors = {
  primary: '#FF5722', // Orange color for ToxiGuard brand
  accent: '#03A9F4',  // Blue accent
  error: '#F44336',   // Red for errors
  warning: '#FFC107', // Amber for warnings
  success: '#4CAF50', // Green for success
  info: '#2196F3',    // Blue for info
  
  // Alert severity colors
  low: '#4CAF50',     // Green
  medium: '#FFC107',  // Amber
  high: '#F44336',    // Red
  
  // Alert type colors
  toxic: '#E53935',   // Red variant
  grooming: '#8E24AA', // Purple

  // Category colors
  profanity: '#FF9800',      // Orange
  harassment: '#E53935',     // Red variant
  hateSpeech: '#D32F2F',     // Darker red
  threatOfViolence: '#C62828', // Darkest red
  sexualContent: '#AD1457',  // Pink
  personalInfo: '#0288D1',   // Blue
};

const sharedColors = colors;

// Light theme configuration
export const lightTheme = {
  ...DefaultTheme,
  dark: false,
  mode: 'exact',
  fonts: configureFonts(fontConfig),
  roundness: 10,
  colors: {
    ...DefaultTheme.colors,
    ...sharedColors,
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    disabled: '#9E9E9E',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: sharedColors.primary,
    card: '#FFFFFF',
    border: '#E0E0E0',
    // Additional custom colors for light theme
    cardBackground: '#FFFFFF',
    divider: '#E0E0E0',
    headerBackground: '#FFFFFF',
    statusBar: '#E0E0E0',
    tabBar: '#FFFFFF',
    tabBarInactive: '#9E9E9E',
    alertCardBackground: '#FFFFFF',
    chartBackground: '#FFFFFF',
    settingsItemBackground: '#FFFFFF',
    // Input fields
    inputBackground: '#F5F5F5',
    inputBorder: '#E0E0E0',
    // Gradient colors
    gradientStart: '#FF5722',
    gradientEnd: '#FF8A65',
  },
  animation: {
    scale: 1.0,
  },
};

// Dark theme configuration
export const darkTheme = {
  ...DarkTheme,
  dark: true,
  mode: 'exact',
  fonts: configureFonts(fontConfig),
  roundness: 10,
  colors: {
    ...DarkTheme.colors,
    ...sharedColors,
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    disabled: '#757575',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    notification: sharedColors.primary,
    card: '#1E1E1E',
    border: '#333333',
    // Additional custom colors for dark theme
    cardBackground: '#1E1E1E',
    divider: '#333333',
    headerBackground: '#1E1E1E',
    statusBar: '#000000',
    tabBar: '#1E1E1E',
    tabBarInactive: '#757575',
    alertCardBackground: '#262626',
    chartBackground: '#262626',
    settingsItemBackground: '#262626',
    // Input fields
    inputBackground: '#262626',
    inputBorder: '#333333',
    // Gradient colors
    gradientStart: '#FF5722',
    gradientEnd: '#FF8A65',
  },
  animation: {
    scale: 1.0,
  },
};

// Function to get the current theme based on mode
export const getTheme = (mode) => {
  switch (mode) {
    case 'dark':
      return darkTheme;
    case 'light':
      return lightTheme;
    case 'system':
      // In a real app, this would detect system preference
      // For now, default to light
      return lightTheme;
    default:
      return lightTheme;
  }
};

// Export spacing constants for consistent layout
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// Export typography presets
export const typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.15,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 14,
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 12,
    letterSpacing: 0.4,
  },
  button: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.75,
    textTransform: 'uppercase',
  },
};

// Export shadow styles
export const shadows = {
  small: typeof jest !== 'undefined' ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  } : Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
  }),
  medium: typeof jest !== 'undefined' ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  } : Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    android: {
      elevation: 5,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  }),
  large: typeof jest !== 'undefined' ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  } : Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
  }),
};

export default {
  lightTheme,
  darkTheme,
  getTheme,
  spacing,
  typography,
  shadows,
};
