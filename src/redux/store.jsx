import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import employeeListReducer from './slices/employeeListSlice';
import notificationReducer from './slices/notificationSlice';
import notificationListReducer from './slices/notificationListSlice';
import editNotificationReducer from './slices/editNotificationSlice';
import employeeDetailsReducer from './slices/employeeDetailsSlice';
import leaveApplicationReducer from './slices/leaveApplicationFormSlice';
import employeeLeaveListReducer from './slices/employeeLeaveListSlice';
import editEmployeeReducer from './slices/editEmployeeSlice';
import updateLeaveApplicationReducer from './slices/updateLeaveApplicationSlice';
import leaveApplicationViewReducer from './slices/leaveApplicationViewSlice';
import adminDashboardReducer from './slices/adminDashboardSlice';
import notificationCardReducer from './slices/notificationCardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    employeeList: employeeListReducer,
    notification: notificationReducer,
    notificationList: notificationListReducer,
    editNotification: editNotificationReducer,
    employeeDetails: employeeDetailsReducer,
    leaveApplication: leaveApplicationReducer,
    employeeLeaveList: employeeLeaveListReducer,
    editEmployee: editEmployeeReducer,
    updateLeaveApplication: updateLeaveApplicationReducer,
    leaveApplicationView: leaveApplicationViewReducer,
    adminDashboard: adminDashboardReducer,
    notificationCard: notificationCardReducer,
  },
});

export default store;


