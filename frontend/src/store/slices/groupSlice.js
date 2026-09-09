import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ===== Get user's groups =====
export const getGroups = createAsyncThunk(
  'groups/getGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/groups`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to load groups' });
    }
  }
);

// ===== Create group =====
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/groups`, data);
      toast.success('Group created successfully!');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
      return rejectWithValue(error.response?.data || { message: 'Failed to create group' });
    }
  }
);

// ===== Get group details =====
export const getGroupDetails = createAsyncThunk(
  'groups/getGroupDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/groups/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to load group details' });
    }
  }
);

// ===== ✅ ADD THIS - Delete group =====
export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/groups/${id}`);
      toast.success('Group deleted successfully!');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete group');
      return rejectWithValue(error.response?.data || { message: 'Failed to delete group' });
    }
  }
);

// ===== ✅ ADD THIS - Update group =====
export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/groups/${id}`, data);
      toast.success('Group updated successfully!');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update group');
      return rejectWithValue(error.response?.data || { message: 'Failed to update group' });
    }
  }
);

// ===== ✅ ADD THIS - Leave group =====
export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (id, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/groups/${id}/leave`);
      toast.success('You have left the group');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave group');
      return rejectWithValue(error.response?.data || { message: 'Failed to leave group' });
    }
  }
);

// ===== Initial State =====
const initialState = {
  groups: [],
  currentGroup: null,
  isLoading: false,
  error: null
};

// ===== Slice =====
const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== Get Groups =====
      .addCase(getGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload || [];
      })
      .addCase(getGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to load groups';
      })
      
      // ===== Create Group =====
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.groups = [action.payload, ...(state.groups || [])];
        }
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create group';
      })
      
      // ===== Get Group Details =====
      .addCase(getGroupDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGroupDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroup = action.payload;
      })
      .addCase(getGroupDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to load group details';
      })
      
      // ===== ✅ ADD THIS - Delete Group =====
      .addCase(deleteGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = (state.groups || []).filter(g => g._id !== action.payload);
        if (state.currentGroup?._id === action.payload) {
          state.currentGroup = null;
        }
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete group';
      })
      
      // ===== ✅ ADD THIS - Update Group =====
      .addCase(updateGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = (state.groups || []).findIndex(g => g._id === action.payload._id);
          if (index !== -1) {
            state.groups[index] = action.payload;
          }
          if (state.currentGroup?._id === action.payload._id) {
            state.currentGroup = action.payload;
          }
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update group';
      })
      
      // ===== ✅ ADD THIS - Leave Group =====
      .addCase(leaveGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = (state.groups || []).filter(g => g._id !== action.payload);
        if (state.currentGroup?._id === action.payload) {
          state.currentGroup = null;
        }
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to leave group';
      });
  }
});

export const { clearError, clearCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;