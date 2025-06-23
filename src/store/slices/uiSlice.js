import { createSlice } from '@reduxjs/toolkit';
import * as Localization from 'expo-localization';

// Initial state
const initialState = {
  theme: 'light', // 'light' | 'dark' | 'system'
  language: Localization.locale.split('-')[0] || 'en', // Default to device locale or fall back to English
  isLoading: false,
  childMenuVisible: false,
  currentScreen: null,
  currentTab: 'home',
  toastMessage: null,
  notificationCount: 0,
  isOnline: true,
  drawerOpen: false,
};

// Create slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Language actions
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    
    // Loading state actions
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Menu visibility
    setChildMenuVisible: (state, action) => {
      state.childMenuVisible = action.payload;
    },
    toggleChildMenu: (state) => {
      state.childMenuVisible = !state.childMenuVisible;
    },
    
    // Navigation tracking
    setCurrentScreen: (state, action) => {
      state.currentScreen = action.payload;
    },
    setCurrentTab: (state, action) => {
      state.currentTab = action.payload;
    },
    
    // Toast messages
    showToast: (state, action) => {
      state.toastMessage = action.payload;
    },
    clearToast: (state) => {
      state.toastMessage = null;
    },
    
    // Notification badge
    setNotificationCount: (state, action) => {
      state.notificationCount = action.payload;
    },
    incrementNotificationCount: (state) => {
      state.notificationCount += 1;
    },
    decrementNotificationCount: (state) => {
      state.notificationCount = Math.max(0, state.notificationCount - 1);
    },
    resetNotificationCount: (state) => {
      state.notificationCount = 0;
    },
    
    // Online status
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    // Drawer state
    setDrawerOpen: (state, action) => {
      state.drawerOpen = action.payload;
    },
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
    
    // Reset UI state
    resetUiState: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Preserve theme preference
        language: state.language // Preserve language preference
      };
    }
  }
});

// Export actions and reducer
export const {
  setTheme,
  toggleTheme,
  setLanguage,
  setLoading,
  setChildMenuVisible,
  toggleChildMenu,
  setCurrentScreen,
  setCurrentTab,
  showToast,
  clearToast,
  setNotificationCount,
  incrementNotificationCount,
  decrementNotificationCount,
  resetNotificationCount,
  setOnlineStatus,
  setDrawerOpen,
  toggleDrawer,
  resetUiState
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectTheme = state => state.ui.theme;
export const selectLanguage = state => state.ui.language;
export const selectIsLoading = state => state.ui.isLoading;
export const selectChildMenuVisible = state => state.ui.childMenuVisible;
export const selectCurrentScreen = state => state.ui.currentScreen;
export const selectCurrentTab = state => state.ui.currentTab;
export const selectToastMessage = state => state.ui.toastMessage;
export const selectNotificationCount = state => state.ui.notificationCount;
export const selectIsOnline = state => state.ui.isOnline;
export const selectDrawerOpen = state => state.ui.drawerOpen;
