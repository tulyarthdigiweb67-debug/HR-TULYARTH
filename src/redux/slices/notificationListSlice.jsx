import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const NOTIFICATION_LIST_API_URL = 'https://hr.tulyarthdigiweb.com/api/notification-list-api';
const NOTIFICATION_DESTROY_API_URL = 'https://hr.tulyarthdigiweb.com/api/notification-destroy-api';

export const fetchNotificationList = createAsyncThunk(
  'notificationList/fetchNotificationList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(NOTIFICATION_LIST_API_URL, {
        headers: { Accept: 'application/json' },
      });
      // Expecting { success, message, data: [...] }
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notificationList/deleteNotification',
  async ({ n_id, n_subject, n_date, n_description }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('n_id', String(n_id ?? ''));
      formData.append('n_subject', n_subject ?? '');
      formData.append('n_date', n_date ?? '');
      formData.append('n_description', n_description ?? '');

      const response = await axios.post(NOTIFICATION_DESTROY_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  items: [],
  meta: null,
  deleting: false,
  deleteError: null,
  deleteResult: null,
};

const notificationListSlice = createSlice({
  name: 'notificationList',
  initialState,
  reducers: {
    resetNotificationList(state) {
      state.loading = false;
      state.error = null;
      state.items = [];
      state.meta = null;
    },
    resetDeleteState(state) {
      state.deleting = false;
      state.deleteError = null;
      state.deleteResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationList.fulfilled, (state, action) => {
        state.loading = false;
        // API returns { success, message, data }
        const payload = action.payload || {};
        const list = Array.isArray(payload.data) ? payload.data : [];
        state.items = list;
        state.meta = { success: payload.success, message: payload.message };
      })
      .addCase(fetchNotificationList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch notifications' };
      })
      .addCase(deleteNotification.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
        state.deleteResult = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.deleting = false;
        state.deleteResult = action.payload;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || { message: 'Failed to delete notification' };
      });
  },
});

export const { resetNotificationList, resetDeleteState } = notificationListSlice.actions;
export default notificationListSlice.reducer;




