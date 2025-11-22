import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const NOTIFICATION_LATEST_API_URL = 'https://hr.tulyarthdigiweb.com/api/notification-latest-api';

export const fetchLatestNotification = createAsyncThunk(
  'adminDashboard/fetchLatestNotification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(NOTIFICATION_LATEST_API_URL, {
        headers: { Accept: 'application/json' },
      });
      
      // API returns { success, message, data: { n_id, n_subject, n_date, n_description, ... } }
      if (response.data && response.data.success && response.data.data) {
        return response.data;
      } else {
        return rejectWithValue({ 
          message: response.data?.message || 'Failed to fetch latest notification',
          data: response.data 
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      return rejectWithValue({ 
        status, 
        data, 
        message: error.message || 'Failed to fetch latest notification' 
      });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  latestNotification: null,
  success: false,
  message: null,
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    resetLatestNotification(state) {
      state.loading = false;
      state.error = null;
      state.latestNotification = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestNotification.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.latestNotification = payload.data || null;
        state.success = payload.success || false;
        state.message = payload.message || null;
      })
      .addCase(fetchLatestNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch latest notification' };
        state.latestNotification = null;
      });
  },
});

export const { resetLatestNotification } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;

