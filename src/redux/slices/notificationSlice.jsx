import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const NOTIFICATION_STORE_API_URL = 'https://hr.tulyarthdigiweb.com/api/notifications-store-api';

export const storeNotification = createAsyncThunk(
  'notification/storeNotification',
  async ({ n_subject, n_description }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('n_subject', n_subject || '');
      formData.append('n_description', n_description || '');

      console.log('[NOTIFICATION_STORE] API URL:', NOTIFICATION_STORE_API_URL);
      console.log('[NOTIFICATION_STORE] n_subject:', n_subject);
      console.log('[NOTIFICATION_STORE] n_description:', n_description);
      console.log('[NOTIFICATION_STORE] FormData keys:', Array.from(formData.keys ? formData.keys() : []).join(', '));

      const response = await axios.post(NOTIFICATION_STORE_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      console.log('[NOTIFICATION_STORE] Response status:', response.status);
      console.log('[NOTIFICATION_STORE] Response data:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[NOTIFICATION_STORE] Error status:', status);
      console.log('[NOTIFICATION_STORE] Error data:', data);
      console.log('[NOTIFICATION_STORE] Error message:', error.message);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  storing: false,
  storeError: null,
  storeResult: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    resetStoreState(state) {
      state.storing = false;
      state.storeError = null;
      state.storeResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(storeNotification.pending, (state) => {
        state.storing = true;
        state.storeError = null;
        state.storeResult = null;
      })
      .addCase(storeNotification.fulfilled, (state, action) => {
        state.storing = false;
        state.storeResult = action.payload;
      })
      .addCase(storeNotification.rejected, (state, action) => {
        state.storing = false;
        state.storeError = action.payload || { message: 'Store notification failed' };
      });
  },
});

export const { resetStoreState } = notificationSlice.actions;
export default notificationSlice.reducer;



