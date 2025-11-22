import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const NOTIFICATION_EDIT_API_URL = 'https://hr.tulyarthdigiweb.com/api/notification-edit-api';
const NOTIFICATION_UPDATE_API_URL = 'https://hr.tulyarthdigiweb.com/api/notification-update-api';

// GET: fetch a single notification by id
export const fetchNotificationById = createAsyncThunk(
  'editNotification/fetchById',
  async ({ n_id }, { rejectWithValue }) => {
    try {
      const url = `${NOTIFICATION_EDIT_API_URL}?n_id=${encodeURIComponent(n_id)}`;
      console.log('[EDIT_NOTIFICATION][GET] URL:', url);
      const response = await axios.get(url, { headers: { Accept: 'application/json' } });
      console.log('[EDIT_NOTIFICATION][GET] Status:', response.status);
      console.log('[EDIT_NOTIFICATION][GET] Data:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[EDIT_NOTIFICATION][GET] Error status:', status);
      console.log('[EDIT_NOTIFICATION][GET] Error data:', data);
      console.log('[EDIT_NOTIFICATION][GET] Error message:', error.message);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

// POST: update notification
export const updateNotification = createAsyncThunk(
  'editNotification/update',
  async ({ n_id, n_subject, n_date, n_description }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('n_id', String(n_id ?? ''));
      formData.append('n_subject', n_subject ?? '');
      formData.append('n_date', n_date ?? '');
      formData.append('n_description', n_description ?? '');

      console.log('[EDIT_NOTIFICATION][POST] URL:', NOTIFICATION_UPDATE_API_URL);
      console.log('[EDIT_NOTIFICATION][POST] Payload:', { n_id, n_subject, n_date, n_description });
      const response = await axios.post(NOTIFICATION_UPDATE_API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
      });
      console.log('[EDIT_NOTIFICATION][POST] Status:', response.status);
      console.log('[EDIT_NOTIFICATION][POST] Data:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[EDIT_NOTIFICATION][POST] Error status:', status);
      console.log('[EDIT_NOTIFICATION][POST] Error data:', data);
      console.log('[EDIT_NOTIFICATION][POST] Error message:', error.message);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  item: null,
  updating: false,
  updateError: null,
  updateResult: null,
};

const editNotificationSlice = createSlice({
  name: 'editNotification',
  initialState,
  reducers: {
    resetEditState(state) {
      state.loading = false;
      state.error = null;
      state.item = null;
      state.updating = false;
      state.updateError = null;
      state.updateResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.item = null;
      })
      .addCase(fetchNotificationById.fulfilled, (state, action) => {
        state.loading = false;
        // API expected shape: { success, message, data: { ... } } or data: [...]
        const payload = action.payload || {};
        const data = Array.isArray(payload.data) ? payload.data[0] : payload.data;
        state.item = data || null;
      })
      .addCase(fetchNotificationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch notification' };
      })
      .addCase(updateNotification.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateResult = null;
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.updating = false;
        state.updateResult = action.payload;
      })
      .addCase(updateNotification.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || { message: 'Failed to update notification' };
      });
  },
});

export const { resetEditState } = editNotificationSlice.actions;
export default editNotificationSlice.reducer;



