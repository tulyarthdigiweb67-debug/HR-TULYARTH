import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const ADD_EMPLOYEE_API_URL = 'https://hr.tulyarthdigiweb.com/api/add-employee-api';

export const addEmployee = createAsyncThunk(
  'employee/addEmployee',
  async (payload, { rejectWithValue }) => {
    try {
      const { personalInfo, addressDetails, professionalDetails, education, experience } = payload || {};

      const formData = new FormData();

      // Required basics
      formData.append('employee_email', personalInfo?.email || '');
      formData.append('employee_first_name', personalInfo?.firstName || '');
      formData.append('employee_last_name', personalInfo?.lastName || '');
      formData.append('employee_password', personalInfo?.password || '');
      formData.append('employee_phone', personalInfo?.phone || '');

      // IDs and document/photo
      formData.append('employee_uan_number', personalInfo?.uanNumber || '');
      formData.append('employee_official_email', personalInfo?.officialEmail || '');
      formData.append('employee_aadhaar_number', personalInfo?.aadhaarNumber || '');
      formData.append('employee_pan_number', personalInfo?.panNumber || '');

      if (personalInfo?.photo?.uri) {
        const photo = {
          uri: personalInfo.photo.uri,
          name: personalInfo.photo.fileName || 'photo.jpg',
          type: personalInfo.photo.type || 'image/jpeg',
        };
        formData.append('employee_photo', photo);
      } else {
        formData.append('employee_photo', '');
      }

      // Present address
      formData.append('employee_present_address1', addressDetails?.presentAddress?.addressLine1 || '');
      formData.append('employee_present_address2', addressDetails?.presentAddress?.addressLine2 || '');
      formData.append('employee_present_city', addressDetails?.presentAddress?.city || '');
      formData.append('employee_present_country', addressDetails?.presentAddress?.country || '');
      formData.append('employee_present_state', addressDetails?.presentAddress?.state || '');
      formData.append('employee_present_postal', addressDetails?.presentAddress?.postalCode || '');

      // Permanent address
      formData.append('employee_permanent_address1', addressDetails?.permanentAddress?.addressLine1 || '');
      formData.append('employee_permanent_address2', addressDetails?.permanentAddress?.addressLine2 || '');
      formData.append('employee_permanent_city', addressDetails?.permanentAddress?.city || '');
      formData.append('employee_permanent_country', addressDetails?.permanentAddress?.country || '');
      formData.append('employee_permanent_state', addressDetails?.permanentAddress?.state || '');
      formData.append('employee_permanent_postal', addressDetails?.permanentAddress?.postalCode || '');

      // Professional details
      formData.append('employee_experience', professionalDetails?.experience || '');
      formData.append('employee_location', professionalDetails?.location || '');
      formData.append('employee_source_of_hire', professionalDetails?.sourceOfHire || '');
      formData.append('employee_title', professionalDetails?.title || '');
      formData.append('employee_skills', professionalDetails?.skillSet || '');
      formData.append('employee_current_salary', professionalDetails?.currentSalary || '');
      formData.append('employee_qualification', professionalDetails?.highestQualification || '');
      formData.append('employee_department', professionalDetails?.department || '');
      formData.append('employee_additional_info', professionalDetails?.additionalInfo || '');

      if (professionalDetails?.offerLetter?.uri) {
        const doc = {
          uri: professionalDetails.offerLetter.uri,
          name: professionalDetails.offerLetter.name || 'offer_letter.pdf',
          type: professionalDetails.offerLetter.type || 'application/pdf',
        };
        formData.append('employee_offer_lett', doc);
      } else {
        formData.append('employee_offer_lett', '');
      }

      // Education
      formData.append('employee_school_name', education?.schoolName || '');
      formData.append('employee_degree', education?.degree || '');
      formData.append('employee_field', education?.fieldOfStudy || '');
      formData.append('employee_completion_date', education?.dateOfCompletion || '');
      formData.append('employee_notes', education?.additionalNotes || '');

      // Experience
      formData.append('employee_occupation', experience?.occupation || '');
      formData.append('employee_company', experience?.company || '');
      formData.append('employee_summary', experience?.summary || '');
      formData.append('employee_duration', experience?.duration || '');
      formData.append('employee_currently_working', experience?.currentlyWorkHere || '');
      formData.append('employee_role', experience?.role || '');
      formData.append('employee_designation', experience?.designation || '');

      console.log('[ADD_EMPLOYEE] URL:', ADD_EMPLOYEE_API_URL);
      console.log('[ADD_EMPLOYEE] Sending keys:', Array.from(formData.keys ? formData.keys() : []).join(', '));

      const response = await axios.post(ADD_EMPLOYEE_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      console.log('[ADD_EMPLOYEE] Status:', response.status);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[ADD_EMPLOYEE] Error status:', status);
      console.log('[ADD_EMPLOYEE] Error data:', data);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  adding: false,
  addError: null,
  addResult: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    resetAddState(state) {
      state.adding = false;
      state.addError = null;
      state.addResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addEmployee.pending, (state) => {
        state.adding = true;
        state.addError = null;
        state.addResult = null;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.adding = false;
        state.addResult = action.payload;
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.adding = false;
        state.addError = action.payload || { message: 'Add employee failed' };
      });
  },
});

export const { resetAddState } = employeeSlice.actions;
export default employeeSlice.reducer;



