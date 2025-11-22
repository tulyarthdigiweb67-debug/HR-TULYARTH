import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const EMPLOYEE_VIEW_API_URL = 'https://hr.tulyarthdigiweb.com/api/employee-view-api';

// GET: fetch single employee details by id
export const fetchEmployeeDetailsById = createAsyncThunk(
  'employeeDetails/fetchById',
  async ({ employee_id }, { rejectWithValue }) => {
    try {
      const url = `${EMPLOYEE_VIEW_API_URL}?employee_id=${encodeURIComponent(employee_id)}`;
      console.log('[EMPLOYEE_DETAILS][GET] URL:', url);
      const response = await axios.get(url, { headers: { Accept: 'application/json' } });
      console.log('[EMPLOYEE_DETAILS][GET] Status:', response.status);
      console.log('[EMPLOYEE_DETAILS][GET] Data:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[EMPLOYEE_DETAILS][GET] Error status:', status);
      console.log('[EMPLOYEE_DETAILS][GET] Error data:', data);
      console.log('[EMPLOYEE_DETAILS][GET] Error message:', error.message);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  item: null,
  raw: null,
};

const employeeDetailsSlice = createSlice({
  name: 'employeeDetails',
  initialState,
  reducers: {
    resetEmployeeDetails(state) {
      state.loading = false;
      state.error = null;
      state.item = null;
      state.raw = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeDetailsById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.item = null;
        state.raw = null;
      })
      .addCase(fetchEmployeeDetailsById.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        // API may return { data: {...} } or { data: [...] }
        const data = Array.isArray(payload.data) ? payload.data[0] : payload.data || payload;
        state.raw = payload;
        state.item = data || null;
      })
      .addCase(fetchEmployeeDetailsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch employee details' };
      });
  },
});

export const { resetEmployeeDetails } = employeeDetailsSlice.actions;
export default employeeDetailsSlice.reducer;



