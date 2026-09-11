import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

//Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      localStorage.setItem('token', response.data.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Register 
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

//  Get Current User 
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${API_URL}/auth/me`);
      return response.data.data;
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue(error.response?.data);
    }
  }
);

//  Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    return null;
  }
);

// ADD THIS - Update User
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Update failed' });
    }
  }
);

//  ADD THIS - Update Settings 
export const updateSettings = createAsyncThunk(
  'auth/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/users/settings`, settingsData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Update settings failed' });
    }
  }
);

//  ADD THIS - Get Settings
export const getSettings = createAsyncThunk(
  'auth/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/settings`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Get settings failed' });
    }
  }
);

// Initial State 
const initialState = {
  user: null,
  wallet: null,
  settings: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  authChecked: false,
  error: null,
  isAuthenticated: false
};

//Slice 
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    //  ADD THIS - Update user locally
    setUser: (state, action) => {
      state.user = action.payload;
    },
    // ADD THIS - Update settings locally
    setSettings: (state, action) => {
      state.settings = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login 
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authChecked = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.wallet = action.payload.wallet;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })

      // Register 
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      })

      // Get Current User 
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authChecked = true;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.wallet = action.payload.wallet;
          state.settings = action.payload.user?.settings || null;
        }
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.authChecked = true;
        state.isAuthenticated = false;
        state.user = null;
        state.wallet = null;
        state.settings = null;
        state.token = null;
      })

      // Logout 
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.wallet = null;
        state.settings = null;
        state.token = null;
        state.error = null;
      })

      // ADD THIS - Update User 
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.settings = action.payload?.settings || state.settings;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Update failed';
      })

      //  ADD THIS - Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        if (state.user) {
          state.user.settings = action.payload;
        }
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Update settings failed';
      })

      // ADD THIS - Get Settings 
      .addCase(getSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        if (state.user) {
          state.user.settings = action.payload;
        }
      })
      .addCase(getSettings.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

export const { clearError, setUser, setSettings } = authSlice.actions;
export default authSlice.reducer;