import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createChildProfile, 
  getChildProfile, 
  getUserChildren, 
  updateChildProfile, 
  deleteChildProfile,
  updateToxicCategories,
  updateGroomingSettings,
  updateWhitelist,
  updateNotificationSettings,
  shareChildWithCoParent,
  removeChildSharing
} from '../../services/childService';

// Async thunk to fetch all children for a user
export const fetchChildren = createAsyncThunk(
  'children/fetchChildren',
  async (userId, { rejectWithValue }) => {
    try {
      const children = await getUserChildren(userId);
      return children;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch a single child profile
export const fetchChildProfile = createAsyncThunk(
  'children/fetchChildProfile',
  async (childId, { rejectWithValue }) => {
    try {
      const child = await getChildProfile(childId);
      return child;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to create a new child profile
export const addChild = createAsyncThunk(
  'children/addChild',
  async ({ userId, childData }, { rejectWithValue }) => {
    try {
      const newChild = await createChildProfile(userId, childData);
      return newChild;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update a child profile
export const updateChild = createAsyncThunk(
  'children/updateChild',
  async ({ childId, updateData }, { rejectWithValue }) => {
    try {
      await updateChildProfile(childId, updateData);
      return { id: childId, ...updateData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to delete a child profile
export const removeChild = createAsyncThunk(
  'children/removeChild',
  async ({ userId, childId }, { rejectWithValue }) => {
    try {
      await deleteChildProfile(userId, childId);
      return childId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update toxic categories
export const updateChildToxicCategories = createAsyncThunk(
  'children/updateToxicCategories',
  async ({ childId, categories }, { rejectWithValue }) => {
    try {
      await updateToxicCategories(childId, categories);
      return { childId, categories };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update grooming settings
export const updateChildGroomingSettings = createAsyncThunk(
  'children/updateGroomingSettings',
  async ({ childId, settings }, { rejectWithValue }) => {
    try {
      await updateGroomingSettings(childId, settings);
      return { childId, settings };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update whitelist words
export const updateChildWhitelist = createAsyncThunk(
  'children/updateWhitelist',
  async ({ childId, whitelist }, { rejectWithValue }) => {
    try {
      await updateWhitelist(childId, whitelist);
      return { childId, whitelist };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update notification settings
export const updateChildNotifications = createAsyncThunk(
  'children/updateNotifications',
  async ({ childId, threshold, enabled }, { rejectWithValue }) => {
    try {
      await updateNotificationSettings(childId, threshold, enabled);
      return { childId, threshold, enabled };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to share a child with a co-parent
export const shareChild = createAsyncThunk(
  'children/shareChild',
  async ({ childId, coParentId }, { rejectWithValue }) => {
    try {
      await shareChildWithCoParent(childId, coParentId);
      return { childId, coParentId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to remove sharing a child with a co-parent
export const unshareChild = createAsyncThunk(
  'children/unshareChild',
  async ({ childId, coParentId }, { rejectWithValue }) => {
    try {
      await removeChildSharing(childId, coParentId);
      return { childId, coParentId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  children: [],
  selectedChildId: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Create slice
const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    // Select a child profile
    selectChild: (state, action) => {
      state.selectedChildId = action.payload;
    },
    // Clear selected child
    clearSelectedChild: (state) => {
      state.selectedChildId = null;
    },
    // Clear all children data (e.g., on logout)
    clearChildrenData: (state) => {
      state.children = [];
      state.selectedChildId = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch children cases
      .addCase(fetchChildren.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.children = action.payload;
        // If we have children but none selected, select the first one
        if (action.payload.length > 0 && !state.selectedChildId) {
          state.selectedChildId = action.payload[0].id;
        }
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch single child profile cases
      .addCase(fetchChildProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChildProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update existing child or add if not exists
        const index = state.children.findIndex(child => child.id === action.payload.id);
        if (index !== -1) {
          state.children[index] = action.payload;
        } else {
          state.children.push(action.payload);
        }
      })
      .addCase(fetchChildProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add child cases
      .addCase(addChild.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addChild.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.children.push(action.payload);
        state.selectedChildId = action.payload.id;
      })
      .addCase(addChild.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update child cases
      .addCase(updateChild.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateChild.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.children.findIndex(child => child.id === action.payload.id);
        if (index !== -1) {
          state.children[index] = { ...state.children[index], ...action.payload };
        }
      })
      .addCase(updateChild.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Remove child cases
      .addCase(removeChild.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeChild.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.children = state.children.filter(child => child.id !== action.payload);
        // If the removed child was selected, select another one if available
        if (state.selectedChildId === action.payload) {
          state.selectedChildId = state.children.length > 0 ? state.children[0].id : null;
        }
      })
      .addCase(removeChild.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update toxic categories cases
      .addCase(updateChildToxicCategories.fulfilled, (state, action) => {
        const index = state.children.findIndex(child => child.id === action.payload.childId);
        if (index !== -1) {
          state.children[index].settings.toxicCategories = action.payload.categories;
        }
      })
      
      // Update grooming settings cases
      .addCase(updateChildGroomingSettings.fulfilled, (state, action) => {
        const index = state.children.findIndex(child => child.id === action.payload.childId);
        if (index !== -1) {
          state.children[index].settings.groomingDetection = action.payload.settings;
        }
      })
      
      // Update whitelist cases
      .addCase(updateChildWhitelist.fulfilled, (state, action) => {
        const index = state.children.findIndex(child => child.id === action.payload.childId);
        if (index !== -1) {
          state.children[index].settings.whitelist = action.payload.whitelist;
        }
      })
      
      // Update notification settings cases
      .addCase(updateChildNotifications.fulfilled, (state, action) => {
        const index = state.children.findIndex(child => child.id === action.payload.childId);
        if (index !== -1) {
          state.children[index].settings.notificationThreshold = action.payload.threshold;
          state.children[index].settings.notificationsEnabled = action.payload.enabled;
        }
      })
      
      // Share child with co-parent cases
      .addCase(shareChild.fulfilled, (state, action) => {
        const index = state.children.findIndex(child => child.id === action.payload.childId);
        if (index !== -1) {
          // Add co-parent ID if not already in the array
          if (!state.children[index].coParentIds) {
            state.children[index].coParentIds = [action.payload.coParentId];
          } else if (!state.children[index].coParentIds.includes(action.payload.coParentId)) {
            state.children[index].coParentIds.push(action.payload.coParentId);
          }
        }
      })
      
      // Unshare child with co-parent cases
      .addCase(unshareChild.fulfilled, (state, action) => {
        const index = state.children.findIndex(child => child.id === action.payload.childId);
        if (index !== -1 && state.children[index].coParentIds) {
          state.children[index].coParentIds = state.children[index].coParentIds.filter(
            id => id !== action.payload.coParentId
          );
        }
      });
  }
});

// Export actions and reducer
export const { selectChild, clearSelectedChild, clearChildrenData } = childrenSlice.actions;
export default childrenSlice.reducer;

// Selectors
export const selectAllChildren = state => state.children.children;
export const selectSelectedChildId = state => state.children.selectedChildId;
export const selectSelectedChild = state => {
  const childId = state.children.selectedChildId;
  return state.children.children.find(child => child.id === childId) || null;
};
export const selectChildById = (state, childId) => 
  state.children.children.find(child => child.id === childId) || null;
export const selectChildrenStatus = state => state.children.status;
export const selectChildrenError = state => state.children.error;
