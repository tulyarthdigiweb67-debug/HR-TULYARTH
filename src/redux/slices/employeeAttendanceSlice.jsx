import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const EMPLOYEE_CHECK_IN_API_URL = 'https://hr.tulyarthdigiweb.com/api/check-in';
const EMPLOYEE_CHECK_OUT_API_URL = 'https://hr.tulyarthdigiweb.com/api/check-out';
const ATTENDANCE_DASHBOARD_API_URL = 'https://hr.tulyarthdigiweb.com/api/attendance-dashboard';

// =============================================
// POST: Employee Check-In
// Backend expects: employee_id, selected_time
// =============================================
export const postEmployeeCheckIn = createAsyncThunk(
  'employeeAttendance/postEmployeeCheckIn',
  async ({ employeeId, selectedTime }, { rejectWithValue }) => {
    try {
      console.log('[EMPLOYEE_CHECK_IN] POST URL:', EMPLOYEE_CHECK_IN_API_URL);
      console.log('[EMPLOYEE_CHECK_IN] Sending =>', { employeeId, selectedTime });

      const formData = new FormData();
      formData.append('employee_id', String(employeeId));  // MUST MATCH BACKEND
      formData.append('selected_time', selectedTime);      // MUST MATCH BACKEND

      const response = await axios.post(EMPLOYEE_CHECK_IN_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      console.log('[EMPLOYEE_CHECK_IN] Response:', response.data);
      return response.data;

    } catch (error) {
      console.log('[EMPLOYEE_CHECK_IN] ERROR =>', error?.response?.data);

      return rejectWithValue({
        status: error?.response?.status || 500,
        message: error?.response?.data?.message || 'Something went wrong',
        errorData: error?.response?.data || null,
      });
    }
  }
);

// =============================================
// POST: Employee Check-Out
// Backend expects: employee_id, selected_time
// =============================================
export const postEmployeeCheckOut = createAsyncThunk(
  'employeeAttendance/postEmployeeCheckOut',
  async ({ employeeId, selectedTime }, { rejectWithValue }) => {
    try {
      console.log('[EMPLOYEE_CHECK_OUT] POST URL:', EMPLOYEE_CHECK_OUT_API_URL);
      console.log('[EMPLOYEE_CHECK_OUT] Sending =>', { employeeId, selectedTime });

      const formData = new FormData();
      formData.append('employee_id', String(employeeId));  // MUST MATCH BACKEND
      formData.append('selected_time', selectedTime);      // MUST MATCH BACKEND

      const response = await axios.post(EMPLOYEE_CHECK_OUT_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      console.log('[EMPLOYEE_CHECK_OUT] Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('[EMPLOYEE_CHECK_OUT] ERROR =>', error?.response?.data);

      return rejectWithValue({
        status: error?.response?.status || 500,
        message: error?.response?.data?.message || 'Something went wrong',
        errorData: error?.response?.data || null,
      });
    }
  }
);

// =============================================
// POST: Attendance Dashboard (per employee)
// NOTE: Backend documentation not provided; we are sending employee_id
//       as multipart/form-data similar to check-in/out.
// =============================================
export const postAttendanceDashboard = createAsyncThunk(
  'employeeAttendance/postAttendanceDashboard',
  async ({ employeeId }, { rejectWithValue }) => {
    try {
      console.log('[ATTENDANCE_DASHBOARD] POST URL:', ATTENDANCE_DASHBOARD_API_URL);
      console.log('[ATTENDANCE_DASHBOARD] Sending =>', { employeeId });

      const formData = new FormData();
      formData.append('employee_id', String(employeeId));

      const response = await axios.post(ATTENDANCE_DASHBOARD_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      console.log('[ATTENDANCE_DASHBOARD] Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('[ATTENDANCE_DASHBOARD] ERROR =>', error?.response?.data);
      return rejectWithValue({
        status: error?.response?.status || 500,
        message: error?.response?.data?.message || 'Failed to fetch attendance dashboard',
        errorData: error?.response?.data || null,
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
  lastCheckInResponse: null,
  lastCheckOutResponse: null,
  dashboardLoading: false,
  dashboardError: null,
  dashboardData: null,
};

// =============================================
// SLICE
// =============================================
const employeeAttendanceSlice = createSlice({
  name: 'employeeAttendance',
  initialState,
  reducers: {
    resetEmployeeAttendanceState(state) {
      state.loading = false;
      state.error = null;
      state.lastCheckInResponse = null;
      state.lastCheckOutResponse = null;
       state.dashboardLoading = false;
       state.dashboardError = null;
       state.dashboardData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postEmployeeCheckIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(postEmployeeCheckIn.fulfilled, (state, action) => {
        state.loading = false;
        state.lastCheckInResponse = action.payload;
      })

      .addCase(postEmployeeCheckIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to check in' };
      })

      // Check-Out
      .addCase(postEmployeeCheckOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postEmployeeCheckOut.fulfilled, (state, action) => {
        state.loading = false;
        state.lastCheckOutResponse = action.payload;
      })
      .addCase(postEmployeeCheckOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to check out' };
      })
      // Attendance Dashboard
      .addCase(postAttendanceDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(postAttendanceDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardData = action.payload ?? null;
      })
      .addCase(postAttendanceDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload || { message: 'Failed to fetch attendance dashboard' };
      });
  },
});

export const { resetEmployeeAttendanceState } = employeeAttendanceSlice.actions;
export default employeeAttendanceSlice.reducer;
