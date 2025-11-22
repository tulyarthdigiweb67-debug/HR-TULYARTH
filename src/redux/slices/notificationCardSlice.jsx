import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const NOTIFICATION_SHOW_API_URL = 'https://hr.tulyarthdigiweb.com/api/notification-show-api';

export const fetchNotification = createAsyncThunk(
  'notificationCard/fetchNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      console.log('[NOTIFICATION_CARD] ===== FETCHING NOTIFICATION =====');
      console.log('[NOTIFICATION_CARD] API URL:', NOTIFICATION_SHOW_API_URL);
      console.log('[NOTIFICATION_CARD] Notification ID:', notificationId);
      
      // Build URL with query parameter if ID is provided
      const url = notificationId
        ? `${NOTIFICATION_SHOW_API_URL}?n_id=${encodeURIComponent(notificationId)}`
        : NOTIFICATION_SHOW_API_URL;
      
      console.log('[NOTIFICATION_CARD] Final URL:', url);
      
      const response = await axios.get(url, {
        headers: { Accept: 'application/json' },
      });
      
      console.log('[NOTIFICATION_CARD] ✅ Response status:', response.status);
      console.log('[NOTIFICATION_CARD] ✅ Response received:', {
        success: response.data?.success,
        message: response.data?.message,
        hasData: !!response.data?.data,
        notificationId: response.data?.data?.n_id,
        notificationSubject: response.data?.data?.n_subject,
      });
      
      // API returns { success, message, data: { n_id, n_subject, n_date, n_description, ... } }
      if (response.data && response.data.success && response.data.data) {
        console.log('[NOTIFICATION_CARD] ✅ Notification fetched successfully!');
        console.log('[NOTIFICATION_CARD] ✅ Notification details:', {
          id: response.data.data.n_id,
          subject: response.data.data.n_subject,
          date: response.data.data.n_date,
          description: response.data.data.n_description?.substring(0, 50) + '...',
        });
        return response.data;
      } else {
        console.log('[NOTIFICATION_CARD] ⚠️ API returned but data is missing or success is false');
        console.log('[NOTIFICATION_CARD] ⚠️ Response:', response.data);
        return rejectWithValue({ 
          message: response.data?.message || 'Failed to fetch notification',
          data: response.data 
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[NOTIFICATION_CARD] ❌ ERROR - Status:', status);
      console.log('[NOTIFICATION_CARD] ❌ ERROR - Data:', data);
      console.log('[NOTIFICATION_CARD] ❌ ERROR - Message:', error.message);
      console.log('[NOTIFICATION_CARD] ❌ ERROR - Full error:', error);
      return rejectWithValue({ 
        status, 
        data, 
        message: error.message || 'Failed to fetch notification' 
      });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  notification: null,
  success: false,
  message: null,
};

const notificationCardSlice = createSlice({
  name: 'notificationCard',
  initialState,
  reducers: {
    resetNotificationCard(state) {
      console.log('[NOTIFICATION_CARD] 🔄 Resetting notification card state');
      state.loading = false;
      state.error = null;
      state.notification = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotification.pending, (state) => {
        console.log('[NOTIFICATION_CARD] 🔄 State: PENDING - Setting loading to true');
        state.loading = true;
        state.error = null;
        console.log('[NOTIFICATION_CARD] 🔄 State after pending:', {
          loading: state.loading,
          hasNotification: !!state.notification,
        });
      })
      .addCase(fetchNotification.fulfilled, (state, action) => {
        console.log('[NOTIFICATION_CARD] ✅ State: FULFILLED');
        console.log('[NOTIFICATION_CARD] ✅ Action payload:', {
          success: action.payload?.success,
          message: action.payload?.message,
          hasData: !!action.payload?.data,
          notificationSubject: action.payload?.data?.n_subject,
        });
        
        state.loading = false;
        const payload = action.payload || {};
        state.notification = payload.data || null;
        state.success = payload.success || false;
        state.message = payload.message || null;
        
        console.log('[NOTIFICATION_CARD] ✅ State updated successfully:', {
          loading: state.loading,
          success: state.success,
          hasNotification: !!state.notification,
          notificationSubject: state.notification?.n_subject,
          notificationId: state.notification?.n_id,
        });
      })
      .addCase(fetchNotification.rejected, (state, action) => {
        console.log('[NOTIFICATION_CARD] ❌ State: REJECTED');
        console.log('[NOTIFICATION_CARD] ❌ Rejection payload:', action.payload);
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch notification' };
        state.notification = null;
        console.log('[NOTIFICATION_CARD] ❌ State after rejection:', {
          loading: state.loading,
          error: state.error,
          hasNotification: !!state.notification,
        });
      });
  },
});

export const { resetNotificationCard } = notificationCardSlice.actions;
export default notificationCardSlice.reducer;

