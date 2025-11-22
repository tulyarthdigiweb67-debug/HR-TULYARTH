import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const LEAVE_VIEW_API_URL = 'https://hr.tulyarthdigiweb.com/api/leave-view-api';

// GET: fetch single leave application details by l_id
export const fetchLeaveApplicationView = createAsyncThunk(
  'leaveApplicationView/fetchById',
  async ({ l_id }, { rejectWithValue }) => {
    try {
      const url = `${LEAVE_VIEW_API_URL}?l_id=${encodeURIComponent(l_id)}`;
      console.log('[LEAVE_VIEW][GET] URL:', url);
      console.log('[LEAVE_VIEW][GET] l_id:', l_id);
      const response = await axios.get(url, {
        headers: { Accept: 'application/json' },
      });
      console.log('[LEAVE_VIEW][GET] Status:', response.status);
      console.log('[LEAVE_VIEW][GET] Data:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[LEAVE_VIEW][GET] Error status:', status);
      console.log('[LEAVE_VIEW][GET] Error data:', data);
      console.log('[LEAVE_VIEW][GET] Error message:', error?.message);
      return rejectWithValue({ status, data, message: error?.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  item: null,
  raw: null,
};

const leaveApplicationViewSlice = createSlice({
  name: 'leaveApplicationView',
  initialState,
  reducers: {
    resetLeaveApplicationView(state) {
      state.loading = false;
      state.error = null;
      state.item = null;
      state.raw = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveApplicationView.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.item = null;
        state.raw = null;
      })
      .addCase(fetchLeaveApplicationView.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        // API may return { data: {...} } or { data: [...] }
        const data = Array.isArray(payload.data) ? payload.data[0] : payload.data || payload;
        state.raw = payload;
        state.item = data || null;
        console.log('[LEAVE_VIEW][FULFILLED] Item set:', state.item);
      })
      .addCase(fetchLeaveApplicationView.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch leave application details' };
        console.log('[LEAVE_VIEW][REJECTED] Error:', state.error);
      });
  },
});

export const { resetLeaveApplicationView } = leaveApplicationViewSlice.actions;
export default leaveApplicationViewSlice.reducer;






