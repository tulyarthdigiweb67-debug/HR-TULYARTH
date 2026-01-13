import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const ATTENDANCE_SUMMARY_API_URL = 'https://hr.tulyarthdigiweb.com/api/attendance-summary';

// =============================================
// GET: Attendance Summary
// =============================================
export const fetchAttendanceSummary = createAsyncThunk(
  'attendanceSummary/fetchAttendanceSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[ATTENDANCE_SUMMARY] GET URL:', ATTENDANCE_SUMMARY_API_URL);
      console.log('[ATTENDANCE_SUMMARY] Params:', params);

      const response = await axios.get(ATTENDANCE_SUMMARY_API_URL, {
        params,
        headers: { Accept: 'application/json' },
      });

      console.log('[ATTENDANCE_SUMMARY] Response Status:', response.status);
      console.log('[ATTENDANCE_SUMMARY] Response Data:', response.data);

      return {
        success: response?.data?.success ?? false,
        date: response?.data?.date ?? null,
        totalEmployees: response?.data?.totalEmployees ?? 0,
        presentEmployees: Array.isArray(response?.data?.presentEmployees) 
          ? response.data.presentEmployees 
          : [],
        absentEmployees: Array.isArray(response?.data?.absentEmployees) 
          ? response.data.absentEmployees 
          : [],
        raw: response.data,
      };
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[ATTENDANCE_SUMMARY] Error Status:', status);
      console.log('[ATTENDANCE_SUMMARY] Error Data:', data);
      console.log('[ATTENDANCE_SUMMARY] Error Message:', error.message);
      
      return rejectWithValue({ 
        status, 
        data, 
        message: error?.response?.data?.message || error.message || 'Failed to fetch attendance summary' 
      });
    }
  }
);

// =============================================
// INITIAL STATE
// =============================================
const initialState = {
  loading: false,
  error: null,
  success: false,
  date: null,
  totalEmployees: 0,
  presentEmployees: [],
  absentEmployees: [],
  raw: null,
  lastFetchedAt: null,
};

// =============================================
// SLICE
// =============================================
const attendanceSummarySlice = createSlice({
  name: 'attendanceSummary',
  initialState,
  reducers: {
    resetAttendanceSummary(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.date = null;
      state.totalEmployees = 0;
      state.presentEmployees = [];
      state.absentEmployees = [];
      state.raw = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceSummary.pending, (state) => {
        console.log('[ATTENDANCE_SUMMARY] State: Loading started');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
        console.log('[ATTENDANCE_SUMMARY] State: Success', action.payload);
        state.loading = false;
        const payload = action.payload || {};
        state.success = payload.success ?? false;
        state.date = payload.date ?? null;
        state.totalEmployees = payload.totalEmployees ?? 0;
        state.presentEmployees = Array.isArray(payload.presentEmployees) 
          ? payload.presentEmployees 
          : [];
        state.absentEmployees = Array.isArray(payload.absentEmployees) 
          ? payload.absentEmployees 
          : [];
        state.raw = payload.raw ?? null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchAttendanceSummary.rejected, (state, action) => {
        console.log('[ATTENDANCE_SUMMARY] State: Error', action.payload);
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch attendance summary' };
      });
  },
});

export const { resetAttendanceSummary } = attendanceSummarySlice.actions;
export default attendanceSummarySlice.reducer;



