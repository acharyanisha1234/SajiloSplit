import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get user's groups
export const getGroups = createAsyncThunk(
  'groups/getGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/groups`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create group
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/groups`, data);
      toast.success('Group created successfully!');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
      return rejectWithValue(error.response.data);
    }
  }
);

// Get group details
export const getGroupDetails = createAsyncThunk(
  'groups/getGroupDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/groups/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  groups: [],
  currentGroup: null,
  isLoading: false,
  error: null
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGroups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(getGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to load groups';
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
      })
      .addCase(getGroupDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGroupDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroup = action.payload;
      })
      .addCase(getGroupDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to load group details';
      });
  }
});

export const { clearError } = groupSlice.actions;
export default groupSlice.reducer;