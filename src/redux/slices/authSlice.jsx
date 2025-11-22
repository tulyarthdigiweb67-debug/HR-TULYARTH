import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { detectRoleFromPayload } from '../../utils/roleUtils';

// API expects these keys for login; backend will return the user's role
const LOGIN_KEYS = { emailKey: 'employee_email', passwordKey: 'employee_password' };
const LOGIN_API_URL = 'https://hr.tulyarthdigiweb.com/api/employee-login-api';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append(LOGIN_KEYS.emailKey, email);
      formData.append(LOGIN_KEYS.passwordKey, password);

      console.log('[LOGIN] API URL:', LOGIN_API_URL);
      console.log('[LOGIN] Using keys:', LOGIN_KEYS);

      const response = await axios.post(LOGIN_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      const data = response.data;
      const roleFromServer = detectRoleFromPayload(data);
      console.log('[LOGIN] Response status:', response.status);
      console.log('[LOGIN] Detected role:', roleFromServer);

      return { data, role: roleFromServer || null };
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.log('[LOGIN] Error status:', status);
      console.log('[LOGIN] Error data:', data);
      return rejectWithValue({ status, data, message: error.message });
    }
  }
);

const initialState = {
  user: null,
  role: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut(state) {
      state.user = null;
      state.role = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data ?? null;
        const detectedRole =
          action.payload?.role ||
          detectRoleFromPayload(action.payload?.data) ||
          null;
        state.role = detectedRole;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? { message: 'Login failed' };
      });
  },
});

export const { signOut } = authSlice.actions;
export default authSlice.reducer;


