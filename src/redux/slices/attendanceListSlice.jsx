import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const ATTENDANCE_LIST_API_URL = 'https://hr.tulyarthdigiweb.com/api/employee-attendance-list';

export const fetchAttendanceList = createAsyncThunk(
  'attendanceList/fetchAttendanceList',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[ATTENDANCE_LIST] GET URL:', ATTENDANCE_LIST_API_URL);
      const response = await axios.get(ATTENDANCE_LIST_API_URL, {
        headers: { Accept: 'application/json' },
      });
      const apiRecords = Array.isArray(response?.data?.data) ? response.data.data : [];
      console.log('[ATTENDANCE_LIST] Status:', response.status);
      console.log('[ATTENDANCE_LIST] Records:', apiRecords.length);
      return {
        raw: response.data,
        list: apiRecords,
      };
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[ATTENDANCE_LIST] Error status:', status);
      console.log('[ATTENDANCE_LIST] Error data:', data);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  items: [],
  raw: null,
  lastFetchedAt: null,
};

const attendanceListSlice = createSlice({
  name: 'attendanceList',
  initialState,
  reducers: {
    resetAttendanceList(state) {
      state.loading = false;
      state.error = null;
      state.items = [];
      state.raw = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceList.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.items = Array.isArray(payload.list) ? payload.list : [];
        state.raw = payload.raw ?? null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchAttendanceList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch attendance list' };
      });
  },
});

export const { resetAttendanceList } = attendanceListSlice.actions;
export default attendanceListSlice.reducer;


