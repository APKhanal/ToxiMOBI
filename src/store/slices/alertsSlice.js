import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getLatestChildAlert, 
  getChildAlerts, 
  getAlertById, 
  markAlertAsRead, 
  markAlertAsFalsePositive,
  addAlertNote,
  getChildAlertStats,
  exportAlertAsPdf,
  downloadAudioClip
} from '../../services/alertService';

// Async thunk to fetch latest alert for a child
export const fetchLatestAlert = createAsyncThunk(
  'alerts/fetchLatestAlert',
  async (childId, { rejectWithValue }) => {
    try {
      const alert = await getLatestChildAlert(childId);
      return alert;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch alerts for a child with pagination
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async ({ childId, lastDoc = null, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const { alerts, lastDoc: newLastDoc } = await getChildAlerts(childId, lastDoc, pageSize);
      return { alerts, lastDoc: newLastDoc, childId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch a single alert by ID
export const fetchAlertById = createAsyncThunk(
  'alerts/fetchAlertById',
  async (alertId, { rejectWithValue }) => {
    try {
      const alert = await getAlertById(alertId);
      return alert;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to mark an alert as read
export const markAsRead = createAsyncThunk(
  'alerts/markAsRead',
  async (alertId, { rejectWithValue }) => {
    try {
      await markAlertAsRead(alertId);
      return alertId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to mark an alert as false positive
export const markAsFalsePositive = createAsyncThunk(
  'alerts/markAsFalsePositive',
  async (alertId, { rejectWithValue }) => {
    try {
      await markAlertAsFalsePositive(alertId);
      return alertId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to add a note to an alert
export const addNote = createAsyncThunk(
  'alerts/addNote',
  async ({ alertId, note }, { rejectWithValue }) => {
    try {
      const newNote = await addAlertNote(alertId, note);
      return { alertId, note: newNote };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch alert statistics for a child
export const fetchAlertStats = createAsyncThunk(
  'alerts/fetchAlertStats',
  async ({ childId, timeRange = 30 }, { rejectWithValue }) => {
    try {
      const stats = await getChildAlertStats(childId, timeRange);
      return { childId, stats };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to export alert as PDF
export const exportAlertPdf = createAsyncThunk(
  'alerts/exportAlertPdf',
  async (alertId, { rejectWithValue }) => {
    try {
      const result = await exportAlertAsPdf(alertId);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to download audio clip
export const downloadAlert = createAsyncThunk(
  'alerts/downloadAlert',
  async (alert, { rejectWithValue }) => {
    try {
      const result = await downloadAudioClip(alert);
      return { alertId: alert.id, uri: result.uri };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  alerts: {}, // Keyed by childId, each value is an array of alerts
  lastDocs: {}, // Keyed by childId, stores the last doc for pagination
  selectedAlertId: null,
  downloadedClips: {}, // Keyed by alertId, stores local file paths
  stats: {}, // Keyed by childId, stores statistics
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Create slice
const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    // Select an alert
    selectAlert: (state, action) => {
      state.selectedAlertId = action.payload;
    },
    // Clear selected alert
    clearSelectedAlert: (state) => {
      state.selectedAlertId = null;
    },
    // Clear all alerts data (e.g., on logout)
    clearAlertsData: (state) => {
      state.alerts = {};
      state.lastDocs = {};
      state.selectedAlertId = null;
      state.downloadedClips = {};
      state.stats = {};
      state.status = 'idle';
      state.error = null;
    },
    // Handle new alert from push notification
    receiveNewAlert: (state, action) => {
      const { alert } = action.payload;
      if (alert && alert.childId) {
        const childId = alert.childId;
        if (!state.alerts[childId]) {
          state.alerts[childId] = [];
        }
        // Check if this alert already exists
        const existingIndex = state.alerts[childId].findIndex(a => a.id === alert.id);
        if (existingIndex === -1) {
          // Add to the beginning since it's the newest
          state.alerts[childId].unshift(alert);
        } else {
          // Update existing alert
          state.alerts[childId][existingIndex] = alert;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch latest alert cases
      .addCase(fetchLatestAlert.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLatestAlert.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          const childId = action.payload.childId;
          if (!state.alerts[childId]) {
            state.alerts[childId] = [];
          }
          // Check if this alert already exists
          const existingIndex = state.alerts[childId].findIndex(alert => alert.id === action.payload.id);
          if (existingIndex === -1) {
            // Add to the beginning since it's the latest
            state.alerts[childId].unshift(action.payload);
          } else {
            // Update existing alert
            state.alerts[childId][existingIndex] = action.payload;
          }
        }
      })
      .addCase(fetchLatestAlert.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch alerts cases
      .addCase(fetchAlerts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { alerts, lastDoc, childId } = action.payload;
        
        if (!state.alerts[childId]) {
          state.alerts[childId] = [];
        }
        
        // If we're loading the first page, replace the data
        if (!action.meta.arg.lastDoc) {
          state.alerts[childId] = alerts;
        } else {
          // Otherwise, append to existing data
          // Filter out duplicates
          const newAlerts = alerts.filter(
            newAlert => !state.alerts[childId].some(alert => alert.id === newAlert.id)
          );
          state.alerts[childId] = [...state.alerts[childId], ...newAlerts];
        }
        
        // Update lastDoc for pagination
        state.lastDocs[childId] = lastDoc;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch single alert cases
      .addCase(fetchAlertById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAlertById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          const childId = action.payload.childId;
          if (!state.alerts[childId]) {
            state.alerts[childId] = [];
          }
          
          // Update existing alert or add new one
          const existingIndex = state.alerts[childId].findIndex(alert => alert.id === action.payload.id);
          if (existingIndex !== -1) {
            state.alerts[childId][existingIndex] = action.payload;
          } else {
            state.alerts[childId].push(action.payload);
          }
        }
      })
      .addCase(fetchAlertById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Mark as read cases
      .addCase(markAsRead.fulfilled, (state, action) => {
        // Find the alert in all children's alerts
        Object.keys(state.alerts).forEach(childId => {
          const alertIndex = state.alerts[childId].findIndex(alert => alert.id === action.payload);
          if (alertIndex !== -1) {
            state.alerts[childId][alertIndex].read = true;
            state.alerts[childId][alertIndex].readAt = new Date();
          }
        });
      })
      
      // Mark as false positive cases
      .addCase(markAsFalsePositive.fulfilled, (state, action) => {
        // Find the alert in all children's alerts
        Object.keys(state.alerts).forEach(childId => {
          const alertIndex = state.alerts[childId].findIndex(alert => alert.id === action.payload);
          if (alertIndex !== -1) {
            state.alerts[childId][alertIndex].falsePositive = true;
            state.alerts[childId][alertIndex].updatedAt = new Date();
          }
        });
      })
      
      // Add note cases
      .addCase(addNote.fulfilled, (state, action) => {
        // Find the alert in all children's alerts
        Object.keys(state.alerts).forEach(childId => {
          const alertIndex = state.alerts[childId].findIndex(alert => alert.id === action.payload.alertId);
          if (alertIndex !== -1) {
            if (!state.alerts[childId][alertIndex].notes) {
              state.alerts[childId][alertIndex].notes = [];
            }
            state.alerts[childId][alertIndex].notes.push(action.payload.note);
            state.alerts[childId][alertIndex].updatedAt = new Date();
          }
        });
      })
      
      // Fetch alert stats cases
      .addCase(fetchAlertStats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAlertStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats[action.payload.childId] = action.payload.stats;
      })
      .addCase(fetchAlertStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Download clip cases
      .addCase(downloadAlert.fulfilled, (state, action) => {
        state.downloadedClips[action.payload.alertId] = action.payload.uri;
      });
  }
});

// Export actions and reducer
export const { 
  selectAlert, 
  clearSelectedAlert, 
  clearAlertsData,
  receiveNewAlert 
} = alertsSlice.actions;
export default alertsSlice.reducer;

// Selectors
export const selectAlertsByChildId = (state, childId) => state.alerts.alerts[childId] || [];
export const selectSelectedAlertId = state => state.alerts.selectedAlertId;
export const selectSelectedAlert = state => {
  const alertId = state.alerts.selectedAlertId;
  if (!alertId) return null;
  
  // Search through all children's alerts
  for (const childId in state.alerts.alerts) {
    const foundAlert = state.alerts.alerts[childId].find(alert => alert.id === alertId);
    if (foundAlert) return foundAlert;
  }
  
  return null;
};
export const selectAlertById = (state, alertId) => {
  // Search through all children's alerts
  for (const childId in state.alerts.alerts) {
    const foundAlert = state.alerts.alerts[childId].find(alert => alert.id === alertId);
    if (foundAlert) return foundAlert;
  }
  
  return null;
};
export const selectAlertStats = (state, childId) => state.alerts.stats[childId] || null;
export const selectLastDoc = (state, childId) => state.alerts.lastDocs[childId] || null;
export const selectAlertsStatus = state => state.alerts.status;
export const selectAlertsError = state => state.alerts.error;
export const selectDownloadedClip = (state, alertId) => state.alerts.downloadedClips[alertId] || null;
