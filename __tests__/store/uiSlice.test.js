/**
 * Test for UI slice functionality
 */

// Mock expo-localization to avoid native module errors
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en', languageTag: 'en-US' }]),
  getCalendars: jest.fn(() => []),
  locale: 'en-US',
  timezone: 'America/New_York',
  isRTL: false,
}));

import uiReducer, {
  setLanguage,
  setTheme,
  selectLanguage,
  selectTheme
} from '../../src/store/slices/uiSlice';

// Define the initial state as it is in the slice
const initialState = {
  theme: 'light',
  language: 'en', // Matches the mocked value from expo-localization
  isLoading: false,
  childMenuVisible: false,
  currentScreen: null,
  currentTab: 'home',
  toastMessage: null,
  notificationCount: 0,
  isOnline: true,
  drawerOpen: false,
};

describe('UI Slice', () => {
  test('should return the initial state', () => {
    expect(uiReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('language settings', () => {
    test('should handle setting language', () => {
      const previousState = { ...initialState };
      
      // Change language to Spanish
      const nextState = uiReducer(previousState, setLanguage('es'));
      expect(nextState.language).toBe('es');
      
      // Change language to French
      const finalState = uiReducer(nextState, setLanguage('fr'));
      expect(finalState.language).toBe('fr');
    });
    
    test('should not change other state when setting language', () => {
      const previousState = {
        ...initialState,
        theme: 'dark'
      };
      
      const nextState = uiReducer(previousState, setLanguage('es'));
      
      // Language should change
      expect(nextState.language).toBe('es');
      
      // Other state should not change
      expect(nextState.theme).toBe('dark');
    });
    
    test('should select language correctly', () => {
      const state = {
        ui: {
          language: 'es'
        }
      };
      
      expect(selectLanguage(state)).toBe('es');
    });
  });

  describe('theme settings', () => {
    test('should handle setting theme', () => {
      const previousState = { ...initialState };
      
      // Change theme to dark
      const nextState = uiReducer(previousState, setTheme('dark'));
      expect(nextState.theme).toBe('dark');
      
      // Change theme to light
      const finalState = uiReducer(nextState, setTheme('light'));
      expect(finalState.theme).toBe('light');
    });
    
    test('should not change other state when setting theme', () => {
      const previousState = {
        ...initialState,
        language: 'es'
      };
      
      const nextState = uiReducer(previousState, setTheme('dark'));
      
      // Theme should change
      expect(nextState.theme).toBe('dark');
      
      // Other state should not change
      expect(nextState.language).toBe('es');
    });
    
    test('should select theme correctly', () => {
      const state = {
        ui: {
          theme: 'dark'
        }
      };
      
      expect(selectTheme(state)).toBe('dark');
    });
  });

  describe('combined actions', () => {
    test('should handle multiple actions in sequence', () => {
      let state = { ...initialState };
      
      // Set language
      state = uiReducer(state, setLanguage('es'));
      expect(state.language).toBe('es');
      
      // Set theme
      state = uiReducer(state, setTheme('dark'));
      expect(state.theme).toBe('dark');
      expect(state.language).toBe('es');
    });
  });
});
