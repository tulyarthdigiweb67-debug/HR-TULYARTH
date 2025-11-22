import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const LEAVE_STORE_API_URL = 'https://hr.tulyarthdigiweb.com/api/leave-store-api';

export const storeLeaveApplication = createAsyncThunk(
  'leaveApplication/storeLeaveApplication',
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append only non-empty values to avoid backend 500 on empty strings
      const entries = {
        l_name: payload?.l_name,
        l_contact_number: payload?.l_contact_number,
        l_designation: payload?.l_designation,
        l_id: payload?.l_id,
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

      console.log('[LEAVE_STORE] API URL:', LEAVE_STORE_API_URL);
      console.log('[LEAVE_STORE] Payload (raw):', payload);
      console.log(
        '[LEAVE_STORE] FormData keys:',
        Array.from(formData?.keys ? formData.keys() : []).join(', ')
      );

      const response = await axios.post(LEAVE_STORE_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      console.log('[LEAVE_STORE] Response status:', response.status);
      console.log('[LEAVE_STORE] Response data:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[LEAVE_STORE] Error status:', status);
      console.log('[LEAVE_STORE] Error data:', data);
      console.log('[LEAVE_STORE] Error message:', error?.message);
      return rejectWithValue({ status, data, message: error?.message });
    }
  }
);

const initialState = {
  storing: false,
  storeError: null,
  storeResult: null,
};

const leaveApplicationFormSlice = createSlice({
  name: 'leaveApplication',
  initialState,
  reducers: {
    resetLeaveStoreState(state) {
      state.storing = false;
      state.storeError = null;
      state.storeResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(storeLeaveApplication.pending, (state) => {
        state.storing = true;
        state.storeError = null;
        state.storeResult = null;
      })
      .addCase(storeLeaveApplication.fulfilled, (state, action) => {
        state.storing = false;
        state.storeResult = action.payload;
      })
      .addCase(storeLeaveApplication.rejected, (state, action) => {
        state.storing = false;
        state.storeError = action.payload || { message: 'Leave store failed' };
      });
  },
});

export const { resetLeaveStoreState } = leaveApplicationFormSlice.actions;
export default leaveApplicationFormSlice.reducer;


