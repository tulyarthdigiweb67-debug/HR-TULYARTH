import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const EMPLOYEE_ATTENDANCE_VIEW_API_URL = 'https://hr.tulyarthdigiweb.com/api/attendance-view';

export const fetchEmployeeAttendanceView = createAsyncThunk(
  'employeeAttendanceView/fetchEmployeeAttendanceView',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] GET URL:', EMPLOYEE_ATTENDANCE_VIEW_API_URL);
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Params:', params);
      
      const response = await axios.get(EMPLOYEE_ATTENDANCE_VIEW_API_URL, {
        headers: { Accept: 'application/json' },
        params: params,
      });
      
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Status:', response.status);
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Full Response:', JSON.stringify(response.data, null, 2));
      
      // API returns: { success: true, data: { "2025-11-15": [...], "2025-11-14": [...] } }
      // Convert date-keyed object to array format
      let apiRecords = [];
      const dataObj = response?.data?.data;
      
      if (dataObj && typeof dataObj === 'object' && !Array.isArray(dataObj)) {
        // Convert object with date keys to array
        Object.keys(dataObj).forEach((dateKey) => {
          const records = dataObj[dateKey];
          if (Array.isArray(records)) {
            records.forEach((record) => {
              // Parse date from key (format: "2025-11-15")
              const dateParts = dateKey.split('-');
              const year = parseInt(dateParts[0], 10);
              const month = parseInt(dateParts[1], 10); // 1-12
              const day = parseInt(dateParts[2], 10);
              
              apiRecords.push({
                date: dateKey,
                day: day,
                month: month,
                year: year,
                timeIn: record.a_time_in || null,
                timeOut: record.a_time_out || null,
                status: record.a_status || 'a', // p=present, a=absent, h=holiday
                createdAt: record.created_at,
                // Keep original data too
                ...record,
              });
            });
          }
        });
        
        // Sort by date (newest first)
        apiRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('[EMPLOYEE_ATTENDANCE_VIEW] Converted date-keyed object to array');
      } else if (Array.isArray(response?.data?.data)) {
        apiRecords = response.data.data;
        console.log('[EMPLOYEE_ATTENDANCE_VIEW] Using response.data.data array');
      }
      
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Records Count:', apiRecords.length);
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Parsed Records:', apiRecords);
      
      return {
        raw: response.data,
        list: apiRecords,
      };
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Error status:', status);
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Error data:', data);
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Error message:', error.message);
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

const employeeAttendanceViewSlice = createSlice({
  name: 'employeeAttendanceView',
  initialState,
  reducers: {
    resetEmployeeAttendanceView(state) {
      state.loading = false;
      state.error = null;
      state.items = [];
      state.raw = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeAttendanceView.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('[EMPLOYEE_ATTENDANCE_VIEW] State: Loading...');
      })
      .addCase(fetchEmployeeAttendanceView.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.items = Array.isArray(payload.list) ? payload.list : [];
        state.raw = payload.raw ?? null;
        state.lastFetchedAt = Date.now();
        console.log('[EMPLOYEE_ATTENDANCE_VIEW] State: Fulfilled, Items:', state.items.length);
      })
      .addCase(fetchEmployeeAttendanceView.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch employee attendance view' };
        console.log('[EMPLOYEE_ATTENDANCE_VIEW] State: Rejected, Error:', state.error);
      });
  },
});

export const { resetEmployeeAttendanceView } = employeeAttendanceViewSlice.actions;
export default employeeAttendanceViewSlice.reducer;


