import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import childrenReducer from './slices/childrenSlice';
import alertsReducer from './slices/alertsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer,
    alerts: alertsReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['alerts/setAlerts/fulfilled', 'children/setChildren/fulfilled'],
        ignoredPaths: ['alerts.entities', 'children.entities'],
      },
    }),
});

export default store;
