import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get wallet
export const getWallet = createAsyncThunk(
  'wallet/getWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/wallet`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add money
export const addMoney = createAsyncThunk(
  'wallet/addMoney',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/wallet/add-money`, data);
      toast.success('Money added successfully!');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add money');
      return rejectWithValue(error.response.data);
    }
  }
);

// Send money
export const sendMoney = createAsyncThunk(
  'wallet/sendMoney',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/wallet/send`, data);
      toast.success('Money sent successfully!');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send money');
      return rejectWithValue(error.response.data);
    }
  }
);

// Get transactions
export const getTransactions = createAsyncThunk(
  'wallet/getTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/wallet/transactions`, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  wallet: null,
  transactions: [],
  isLoading: false,
  error: null,
  pagination: null
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateWallet: (state, action) => {
      state.wallet = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWallet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload;
      })
      .addCase(getWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to load wallet';
      })
      .addCase(addMoney.fulfilled, (state, action) => {
        state.wallet = action.payload.wallet;
      })
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to load transactions';
      });
  }
});

export const { clearError, updateWallet } = walletSlice.actions;
export default walletSlice.reducer;