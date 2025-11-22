import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const LEAVE_LIST_API_URL = 'https://hr.tulyarthdigiweb.com/api/leave-list-api';
const LEAVE_DESTROY_API_URL = 'https://hr.tulyarthdigiweb.com/api/leave-destroy';
const LEAVE_STATUS_API_URL = 'https://hr.tulyarthdigiweb.com/api/leave-status-api';

// GET: fetch all employee leave applications
export const fetchEmployeeLeaveList = createAsyncThunk(
  'employeeLeaveList/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(LEAVE_LIST_API_URL, {
        headers: { Accept: 'application/json' },
      });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      return rejectWithValue({ status, data, message: error?.message });
    }
  }
);

// POST: delete leave application
export const deleteLeave = createAsyncThunk(
  'employeeLeaveList/deleteLeave',
  async (leaveData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Add all leave fields to FormData
      if (leaveData.l_id) formData.append('l_id', String(leaveData.l_id));
      if (leaveData.l_name) formData.append('l_name', leaveData.l_name);
      if (leaveData.l_emp_code) formData.append('l_emp_code', leaveData.l_emp_code);
      if (leaveData.l_company) formData.append('l_company', leaveData.l_company);
      if (leaveData.l_company_main) formData.append('l_company_main', leaveData.l_company_main);
      if (leaveData.l_contact_number) formData.append('l_contact_number', leaveData.l_contact_number);
      if (leaveData.l_designation) formData.append('l_designation', leaveData.l_designation);
      if (leaveData.l_from_date) formData.append('l_from_date', leaveData.l_from_date);
      if (leaveData.l_to_date) formData.append('l_to_date', leaveData.l_to_date);
      if (leaveData.l_total_days) formData.append('l_total_days', String(leaveData.l_total_days));
      if (leaveData.l_address_on_leave) formData.append('l_address_on_leave', leaveData.l_address_on_leave);
      if (leaveData.l_purpose) formData.append('l_purpose', leaveData.l_purpose);

      const response = await axios.post(LEAVE_DESTROY_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      return rejectWithValue({ status, data, message: error?.message });
    }
  }
);

// POST: update leave status (approve/reject/cancel)
export const updateLeaveStatus = createAsyncThunk(
  'employeeLeaveList/updateStatus',
  async ({ l_id, status }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      // Always send id
      if (l_id) formData.append('l_id', String(l_id));
      // Try multiple common field names/values to match backend
      // Canonical from UI: approved | rejected | cancelled
      const normalized = String(status || '').toLowerCase();
      // Map to action expected by backend
      const action =
        normalized === 'approved' || normalized === 'approve' ? 'approve' :
        normalized === 'rejected' || normalized === 'reject' ? 'reject' :
        normalized === 'cancelled' || normalized === 'canceled' || normalized === 'cancel' ? 'cancel' :
        normalized;
      // REQUIRED by backend per error: "The action field is required."
      if (action) formData.append('action', action);
      // Alternate spellings/value variants
      const variants = [
        normalized, // e.g., approved
        normalized.replace('cancelled', 'canceled'), // canceled
        normalized.replace('approved', 'approve').replace('rejected', 'reject').replace('cancelled', 'cancel'), // approve/reject/cancel
      ];
      // Sometimes backends expect numeric codes; try common mapping
      const numeric =
        normalized === 'approved' ? '1' :
        normalized === 'rejected' ? '2' :
        normalized === 'cancelled' ? '3' : '';
      // Send across multiple likely keys
      variants.forEach((v) => {
        if (v) formData.append('status', v);
      });
      if (numeric) formData.append('status_code', numeric);
      // Additional common parameter aliases
      variants.forEach((v) => {
        if (v) formData.append('l_status', v);
      });
      if (numeric) formData.append('l_status_code', numeric);
      variants.forEach((v) => {
        if (v) formData.append('leave_status', v);
      });

      const response = await axios.post(LEAVE_STATUS_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const statusCode = error?.response?.status;
      const data = error?.response?.data;
      return rejectWithValue({ status: statusCode, data, message: error?.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  items: [],
  raw: null,
  deleting: false,
  deleteError: null,
  deleteResult: null,
  updatingStatus: false,
  updateStatusError: null,
  updateStatusResult: null,
};

const employeeLeaveListSlice = createSlice({
  name: 'employeeLeaveList',
  initialState,
  reducers: {
    resetEmployeeLeaveList(state) {
      state.loading = false;
      state.error = null;
      state.items = [];
      state.raw = null;
    },
    resetDeleteState(state) {
      state.deleting = false;
      state.deleteError = null;
      state.deleteResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeLeaveList.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
        state.raw = null;
      })
      .addCase(fetchEmployeeLeaveList.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const list = Array.isArray(payload.data) ? payload.data : [];
        state.raw = payload;
        state.items = list;
      })
      .addCase(fetchEmployeeLeaveList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch leave list' };
      })
      .addCase(deleteLeave.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
        state.deleteResult = null;
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.deleting = false;
        state.deleteResult = action.payload;
      })
      .addCase(deleteLeave.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || { message: 'Failed to delete leave record' };
      })
      .addCase(updateLeaveStatus.pending, (state) => {
        state.updatingStatus = true;
        state.updateStatusError = null;
        state.updateStatusResult = null;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        state.updateStatusResult = action.payload;
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.updateStatusError = action.payload || { message: 'Failed to update leave status' };
      });
  },
});

export const { resetEmployeeLeaveList, resetDeleteState } = employeeLeaveListSlice.actions;
export default employeeLeaveListSlice.reducer;






