import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const EMPLOYEE_LIST_API_URL = 'https://hr.tulyarthdigiweb.com/api/employee-list-api?';
const EMPLOYEE_DESTROY_API_URL = 'https://hr.tulyarthdigiweb.com/api/employee-destroy-api';

export const fetchEmployeeList = createAsyncThunk(
  'employeeList/fetchEmployeeList',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[EMPLOYEE_LIST] GET URL:', EMPLOYEE_LIST_API_URL);
      const response = await axios.get(EMPLOYEE_LIST_API_URL, {
        headers: { Accept: 'application/json' },
      });
      console.log('[EMPLOYEE_LIST] Status:', response.status);
      console.log('[EMPLOYEE_LIST] Payload keys:', Object.keys(response?.data || {}));
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[EMPLOYEE_LIST] Error status:', status);
      console.log('[EMPLOYEE_LIST] Error data:', data);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employeeList/deleteEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      console.log('[EMPLOYEE_DELETE] POST URL:', EMPLOYEE_DESTROY_API_URL);
      console.log('[EMPLOYEE_DELETE] Payload:', employeeData);
      
      const formData = new FormData();
      
      // Add employee_id first (required field)
      if (employeeData.employee_id) {
        formData.append('employee_id', String(employeeData.employee_id));
      }
      
      // Add all required fields to FormData
      if (employeeData.employee_email) formData.append('employee_email', employeeData.employee_email);
      if (employeeData.employee_first_name) formData.append('employee_first_name', employeeData.employee_first_name);
      if (employeeData.employee_last_name) formData.append('employee_last_name', employeeData.employee_last_name);
      if (employeeData.employee_password) formData.append('employee_password', employeeData.employee_password);
      if (employeeData.employee_phone) formData.append('employee_phone', employeeData.employee_phone);
      if (employeeData.employee_uan_number) formData.append('employee_uan_number', employeeData.employee_uan_number);
      if (employeeData.employee_official_email) formData.append('employee_official_email', employeeData.employee_official_email);
      if (employeeData.employee_aadhaar_number) formData.append('employee_aadhaar_number', employeeData.employee_aadhaar_number);
      if (employeeData.employee_pan_number) formData.append('employee_pan_number', employeeData.employee_pan_number);
      // Photo handling - send as string if it's a filename, or as file object if it has uri
      if (employeeData.employee_photo) {
        if (employeeData.employee_photo.uri) {
          // It's a file object
          formData.append('employee_photo', employeeData.employee_photo);
        } else {
          // It's a filename string
          formData.append('employee_photo', String(employeeData.employee_photo));
        }
      } else {
        formData.append('employee_photo', '');
      }
      if (employeeData.employee_present_address1) formData.append('employee_present_address1', employeeData.employee_present_address1);
      if (employeeData.employee_present_address2) formData.append('employee_present_address2', employeeData.employee_present_address2);
      if (employeeData.employee_present_city) formData.append('employee_present_city', employeeData.employee_present_city);
      if (employeeData.employee_present_country) formData.append('employee_present_country', employeeData.employee_present_country);
      if (employeeData.employee_present_state) formData.append('employee_present_state', employeeData.employee_present_state);
      if (employeeData.employee_present_postal) formData.append('employee_present_postal', employeeData.employee_present_postal);
      if (employeeData.employee_permanent_address1) formData.append('employee_permanent_address1', employeeData.employee_permanent_address1);
      if (employeeData.employee_permanent_address2) formData.append('employee_permanent_address2', employeeData.employee_permanent_address2);
      if (employeeData.employee_permanent_city) formData.append('employee_permanent_city', employeeData.employee_permanent_city);
      if (employeeData.employee_permanent_country) formData.append('employee_permanent_country', employeeData.employee_permanent_country);
      if (employeeData.employee_permanent_state) formData.append('employee_permanent_state', employeeData.employee_permanent_state);
      if (employeeData.employee_permanent_postal) formData.append('employee_permanent_postal', employeeData.employee_permanent_postal);
      if (employeeData.employee_experience) formData.append('employee_experience', employeeData.employee_experience);
      if (employeeData.employee_location) formData.append('employee_location', employeeData.employee_location);
      if (employeeData.employee_source_of_hire) formData.append('employee_source_of_hire', employeeData.employee_source_of_hire);
      if (employeeData.employee_title) formData.append('employee_title', employeeData.employee_title);
      if (employeeData.employee_skills) formData.append('employee_skills', employeeData.employee_skills);
      if (employeeData.employee_current_salary) formData.append('employee_current_salary', employeeData.employee_current_salary);
      if (employeeData.employee_qualification) formData.append('employee_qualification', employeeData.employee_qualification);
      if (employeeData.employee_department) formData.append('employee_department', employeeData.employee_department);
      if (employeeData.employee_additional_info) formData.append('employee_additional_info', employeeData.employee_additional_info);
      // Handle offer letter - API response might use employee_offer_letter but API expects employee_offer_lett
      const offerLetter = employeeData.employee_offer_lett || employeeData.employee_offer_letter;
      if (offerLetter) formData.append('employee_offer_lett', offerLetter);
      if (employeeData.employee_school_name) formData.append('employee_school_name', employeeData.employee_school_name);
      if (employeeData.employee_degree) formData.append('employee_degree', employeeData.employee_degree);
      if (employeeData.employee_field) formData.append('employee_field', employeeData.employee_field);
      if (employeeData.employee_completion_date) formData.append('employee_completion_date', employeeData.employee_completion_date);
      if (employeeData.employee_notes) formData.append('employee_notes', employeeData.employee_notes);
      if (employeeData.employee_occupation) formData.append('employee_occupation', employeeData.employee_occupation);
      if (employeeData.employee_company) formData.append('employee_company', employeeData.employee_company);
      if (employeeData.employee_summary) formData.append('employee_summary', employeeData.employee_summary);
      if (employeeData.employee_duration) formData.append('employee_duration', employeeData.employee_duration);
      if (employeeData.employee_currently_working) formData.append('employee_currently_working', employeeData.employee_currently_working);
      if (employeeData.employee_role) formData.append('employee_role', employeeData.employee_role);
      if (employeeData.employee_designation) formData.append('employee_designation', employeeData.employee_designation);

      const response = await axios.post(EMPLOYEE_DESTROY_API_URL, formData, {
        headers: { 
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[EMPLOYEE_DELETE] Status:', response.status);
      console.log('[EMPLOYEE_DELETE] Response:', response.data);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[EMPLOYEE_DELETE] Error status:', status);
      console.log('[EMPLOYEE_DELETE] Error data:', data);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  items: [],
  raw: null,
  pagination: null,
  deleteLoading: false,
  deleteError: null,
};

const employeeListSlice = createSlice({
  name: 'employeeList',
  initialState,
  reducers: {
    resetEmployeeList(state) {
      state.loading = false;
      state.error = null;
      state.items = [];
      state.raw = null;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeList.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.raw = payload;
        state.items = Array.isArray(payload.data) ? payload.data : [];
        state.pagination = payload.pagination || null;
      })
      .addCase(fetchEmployeeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch employee list' };
      })
      .addCase(deleteEmployee.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || { message: 'Failed to delete employee' };
      });
  },
});

export const { resetEmployeeList } = employeeListSlice.actions;
export default employeeListSlice.reducer;





