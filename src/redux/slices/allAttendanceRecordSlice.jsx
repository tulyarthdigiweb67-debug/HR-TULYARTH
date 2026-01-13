import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const ALL_ATTENDANCE_API_URL = 'https://hr.tulyarthdigiweb.com/api/attendance-filter';

export const fetchAllAttendanceRecords = createAsyncThunk(
  'allAttendanceRecords/fetchAllAttendanceRecords',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[ALL_ATTENDANCE_RECORDS] GET URL:', ALL_ATTENDANCE_API_URL);
      console.log('[ALL_ATTENDANCE_RECORDS] Params:', params);

      const response = await axios.get(ALL_ATTENDANCE_API_URL, {
        params,
        headers: { Accept: 'application/json' },
      });

      const apiRecords = Array.isArray(response?.data?.data) ? response.data.data : [];
      console.log('[ALL_ATTENDANCE_RECORDS] Status:', response.status);
      console.log('[ALL_ATTENDANCE_RECORDS] Records:', apiRecords.length);

      return {
        raw: response.data,
        list: apiRecords,
        status: response?.data?.status ?? null,
      };
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[ALL_ATTENDANCE_RECORDS] Error status:', status);
      console.log('[ALL_ATTENDANCE_RECORDS] Error data:', data);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  items: [],
  raw: null,
  status: null,
  lastFetchedAt: null,
};

const allAttendanceRecordSlice = createSlice({
  name: 'allAttendanceRecords',
  initialState,
  reducers: {
    resetAllAttendanceRecords(state) {
      state.loading = false;
      state.error = null;
      state.items = [];
      state.raw = null;
      state.status = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAttendanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.items = Array.isArray(payload.list) ? payload.list : [];
        state.raw = payload.raw ?? null;
        state.status = payload.status ?? null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchAllAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch attendance records' };
      });
  },
});

export const { resetAllAttendanceRecords } = allAttendanceRecordSlice.actions;
export default allAttendanceRecordSlice.reducer;








