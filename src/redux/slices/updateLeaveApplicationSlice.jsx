import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const LEAVE_EDIT_API_URL = 'https://hr.tulyarthdigiweb.com/api/leave-edit-api';
const LEAVE_UPDATE_API_URL = 'https://hr.tulyarthdigiweb.com/api/leave-update-api';

// GET: fetch leave application data for editing
export const fetchLeaveForEdit = createAsyncThunk(
  'updateLeaveApplication/fetchLeaveForEdit',
  async (l_id, { rejectWithValue }) => {
    try {
      console.log('[LEAVE_EDIT][GET] API URL:', LEAVE_EDIT_API_URL);
      console.log('[LEAVE_EDIT][GET] l_id:', l_id);
      
      // Make GET request with l_id as query parameter
      const response = await axios.get(LEAVE_EDIT_API_URL, {
        params: {
          l_id: l_id,
        },
        headers: {
          Accept: 'application/json',
        },
      });

      console.log('[LEAVE_EDIT][GET] Response status:', response.status);
      console.log('[LEAVE_EDIT][GET] Response data:', response.data);
      
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[LEAVE_EDIT][GET] Error status:', status);
      console.log('[LEAVE_EDIT][GET] Error data:', data);
      console.log('[LEAVE_EDIT][GET] Error message:', error?.message);
      return rejectWithValue({ status, data, message: error?.message });
    }
  }
);

// POST: update leave application
export const updateLeaveApplication = createAsyncThunk(
  'updateLeaveApplication/updateLeaveApplication',
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append only non-empty values to avoid backend 500 on empty strings
      const entries = {
        l_id: payload?.l_id,
        l_name: payload?.l_name,
        l_contact_number: payload?.l_contact_number,
        l_designation: payload?.l_designation,
        l_applied_date: payload?.l_applied_date,
        l_emp_code: payload?.l_emp_code,
        l_company: payload?.l_company,
        l_posting_place: payload?.l_posting_place,
        l_purpose: payload?.l_purpose,
        l_from_date: payload?.l_from_date,
        l_to_date: payload?.l_to_date,
        l_total_days: payload?.l_total_days,
        l_address_on_leave: payload?.l_address_on_leave,
        l_related_contact_number: payload?.l_related_contact_number,
        l_balance_leave: payload?.l_balance_leave,
        l_team_leader_remark: payload?.l_team_leader_remark,
        l_task_assigned_to: payload?.l_task_assigned_to,
        l_company_main: payload?.l_company_main,
        l_leave_status: payload?.l_leave_status,
        l_status: payload?.l_status,
        created_at: payload?.created_at,
        updated_at: payload?.updated_at,
      };

      Object.entries(entries).forEach(([key, value]) => {
        if (value !== undefined && value !== null && `${value}` !== '') {
          formData.append(key, value);
        }
      });

      console.log('[LEAVE_UPDATE][POST] API URL:', LEAVE_UPDATE_API_URL);
      console.log('[LEAVE_UPDATE][POST] Payload (raw):', payload);
      console.log(
        '[LEAVE_UPDATE][POST] FormData keys:',
        Array.from(formData?.keys ? formData.keys() : []).join(', ')
      );

      const response = await axios.post(LEAVE_UPDATE_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      console.log('[LEAVE_UPDATE][POST] Response status:', response.status);
      console.log('[LEAVE_UPDATE][POST] Response data:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[LEAVE_UPDATE][POST] Error status:', status);
      console.log('[LEAVE_UPDATE][POST] Error data:', data);
      console.log('[LEAVE_UPDATE][POST] Error message:', error?.message);
      return rejectWithValue({ status, data, message: error?.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  leaveData: null,
  updating: false,
  updateError: null,
  updateResult: null,
};

const updateLeaveApplicationSlice = createSlice({
  name: 'updateLeaveApplication',
  initialState,
  reducers: {
    resetUpdateLeaveState(state) {
      state.loading = false;
      state.error = null;
      state.leaveData = null;
    },
    resetUpdateResultState(state) {
      state.updating = false;
      state.updateError = null;
      state.updateResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveForEdit.pending, (state) => {
        console.log('[LEAVE_EDIT][REDUX] Fetch pending');
        state.loading = true;
        state.error = null;
        state.leaveData = null;
      })
      .addCase(fetchLeaveForEdit.fulfilled, (state, action) => {
        console.log('[LEAVE_EDIT][REDUX] Fetch fulfilled, payload:', action.payload);
        state.loading = false;
        // Handle different response structures
        const payload = action.payload || {};
        state.leaveData = payload.data || payload;
      })
      .addCase(fetchLeaveForEdit.rejected, (state, action) => {
        console.log('[LEAVE_EDIT][REDUX] Fetch rejected, error:', action.payload);
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch leave data for editing' };
      })
      .addCase(updateLeaveApplication.pending, (state) => {
        console.log('[LEAVE_UPDATE][REDUX] Update pending');
        state.updating = true;
        state.updateError = null;
        state.updateResult = null;
      })
      .addCase(updateLeaveApplication.fulfilled, (state, action) => {
        console.log('[LEAVE_UPDATE][REDUX] Update fulfilled, payload:', action.payload);
        state.updating = false;
        state.updateResult = action.payload;
      })
      .addCase(updateLeaveApplication.rejected, (state, action) => {
        console.log('[LEAVE_UPDATE][REDUX] Update rejected, error:', action.payload);
        state.updating = false;
        state.updateError = action.payload || { message: 'Failed to update leave application' };
      });
  },
});

export const { resetUpdateLeaveState, resetUpdateResultState } = updateLeaveApplicationSlice.actions;
export default updateLeaveApplicationSlice.reducer;

