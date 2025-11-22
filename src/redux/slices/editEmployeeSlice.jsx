import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const EMPLOYEE_EDIT_API_URL = 'https://hr.tulyarthdigiweb.com/api/employee-edit-api';
const EMPLOYEE_UPDATE_API_URL = 'https://hr.tulyarthdigiweb.com/api/employee-update-api';

// GET: fetch employee edit data by id (if provided)
export const fetchEditEmployee = createAsyncThunk(
  'editEmployee/fetch',
  async ({ employee_id } = {}, { rejectWithValue }) => {
    try {
      const url = employee_id
        ? `${EMPLOYEE_EDIT_API_URL}?employee_id=${encodeURIComponent(employee_id)}`
        : EMPLOYEE_EDIT_API_URL;
      console.log('[EDIT_EMPLOYEE][GET] URL:', url);
      const response = await axios.get(url, { headers: { Accept: 'application/json' } });
      console.log('[EDIT_EMPLOYEE][GET] Status:', response.status);
      console.log('[EDIT_EMPLOYEE][GET] Data:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[EDIT_EMPLOYEE][GET] Error status:', status);
      console.log('[EDIT_EMPLOYEE][GET] Error data:', data);
      console.log('[EDIT_EMPLOYEE][GET] Error message:', error.message);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

// POST: update employee data
export const updateEmployee = createAsyncThunk(
  'editEmployee/update',
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Required fields
      formData.append('employee_id', payload?.employee_id || '');
      formData.append('employee_email', payload?.employee_email || '');
      formData.append('employee_first_name', payload?.employee_first_name || '');
      formData.append('employee_last_name', payload?.employee_last_name || '');
      formData.append('employee_password', payload?.employee_password || '');
      formData.append('employee_phone', payload?.employee_phone || '');

      // IDs and documents
      formData.append('employee_uan_number', payload?.employee_uan_number || '');
      formData.append('employee_official_email', payload?.employee_official_email || '');
      formData.append('employee_aadhaar_number', payload?.employee_aadhaar_number || '');
      formData.append('employee_pan_number', payload?.employee_pan_number || '');

      // Photo handling
      if (payload?.employee_photo?.uri) {
        const photo = {
          uri: payload.employee_photo.uri,
          name: payload.employee_photo.name || 'photo.jpg',
          type: payload.employee_photo.type || 'image/jpeg',
        };
        formData.append('employee_photo', photo);
      } else {
        formData.append('employee_photo', '');
      }

      // Present address
      formData.append('employee_present_address1', payload?.employee_present_address1 || '');
      formData.append('employee_present_address2', payload?.employee_present_address2 || '');
      formData.append('employee_present_city', payload?.employee_present_city || '');
      formData.append('employee_present_country', payload?.employee_present_country || '');
      formData.append('employee_present_state', payload?.employee_present_state || '');
      formData.append('employee_present_postal', payload?.employee_present_postal || '');

      // Permanent address
      formData.append('employee_permanent_address1', payload?.employee_permanent_address1 || '');
      formData.append('employee_permanent_address2', payload?.employee_permanent_address2 || '');
      formData.append('employee_permanent_city', payload?.employee_permanent_city || '');
      formData.append('employee_permanent_country', payload?.employee_permanent_country || '');
      formData.append('employee_permanent_state', payload?.employee_permanent_state || '');
      formData.append('employee_permanent_postal', payload?.employee_permanent_postal || '');

      // Professional details
      formData.append('employee_experience', payload?.employee_experience || '');
      formData.append('employee_location', payload?.employee_location || '');
      formData.append('employee_source_of_hire', payload?.employee_source_of_hire || '');
      formData.append('employee_title', payload?.employee_title || '');
      formData.append('employee_skills', payload?.employee_skills || '');
      formData.append('employee_current_salary', payload?.employee_current_salary || '');
      formData.append('employee_qualification', payload?.employee_qualification || '');
      formData.append('employee_department', payload?.employee_department || '');
      formData.append('employee_additional_info', payload?.employee_additional_info || '');

      // Note: employee_offer_lett is not included as the database column doesn't exist
      // The offer letter field is not supported in the update API

      // Education
      formData.append('employee_school_name', payload?.employee_school_name || '');
      formData.append('employee_degree', payload?.employee_degree || '');
      formData.append('employee_field', payload?.employee_field || '');
      formData.append('employee_completion_date', payload?.employee_completion_date || '');
      formData.append('employee_notes', payload?.employee_notes || '');

      // Experience
      formData.append('employee_occupation', payload?.employee_occupation || '');
      formData.append('employee_company', payload?.employee_company || '');
      formData.append('employee_summary', payload?.employee_summary || '');
      formData.append('employee_duration', payload?.employee_duration || '');
      formData.append('employee_currently_working', payload?.employee_currently_working || '');
      formData.append('employee_role', payload?.employee_role || '');
      formData.append('employee_designation', payload?.employee_designation || '');

      console.log('[UPDATE_EMPLOYEE] URL:', EMPLOYEE_UPDATE_API_URL);
      console.log('[UPDATE_EMPLOYEE] Sending keys:', Array.from(formData.keys ? formData.keys() : []).join(', '));

      const response = await axios.post(EMPLOYEE_UPDATE_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      console.log('[UPDATE_EMPLOYEE] Status:', response.status);
      console.log('[UPDATE_EMPLOYEE] Response data:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[UPDATE_EMPLOYEE] Error status:', status);
      console.log('[UPDATE_EMPLOYEE] Error data:', data);
      console.log('[UPDATE_EMPLOYEE] Error message:', error.message);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  item: null,
  raw: null,
  updating: false,
  updateError: null,
  updateResult: null,
};

const editEmployeeSlice = createSlice({
  name: 'editEmployee',
  initialState,
  reducers: {
    resetEditEmployee(state) {
      state.loading = false;
      state.error = null;
      state.item = null;
      state.raw = null;
    },
    resetUpdateState(state) {
      state.updating = false;
      state.updateError = null;
      state.updateResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEditEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.item = null;
        state.raw = null;
      })
      .addCase(fetchEditEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        // Expecting payload like { success, message, data: {...} or [] }
        const data = Array.isArray(payload.data) ? payload.data[0] : payload.data || payload;
        state.raw = payload;
        state.item = data || null;
      })
      .addCase(fetchEditEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch employee edit data' };
      })
      .addCase(updateEmployee.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateResult = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.updating = false;
        state.updateResult = action.payload;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || { message: 'Failed to update employee' };
      });
  },
});

export const { resetEditEmployee, resetUpdateState } = editEmployeeSlice.actions;
export default editEmployeeSlice.reducer;






