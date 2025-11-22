import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  BackHandler,
} from 'react-native';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AdminDashboard from './AdminDashboard';
import AddEmployee from './AddEmployee';
import EmployeeList from './EmployeeList';
import EmployeeAttendance from './EmployeeAttendance';
import EmployeeAttendanceView from './EmployeeAttendanceView';
import AttendanceList from './AttendanceList';
import MyAttendance from './MyAttendance';
import AddNotification from './NotificationAdd';
import EmployeeDetails from './EmployeeDetails';
import LeaveApplicationForm from './LeaveApplicationForm';
import UpdateLeaveApplication from './UpdateLeaveApplication';
import LeaveApplicationView from './LeaveApplicationView';
import EditEmployee from './EditEmployee';
import EmployeeLeaveList from './EmployeeLeaveList';
import NotificationList from './NotificationList';
import EditNotification from './EditNotification';
import { useSelector } from 'react-redux';
import ProfileScreen from './ProfileScreen';
import NotificationCard from './NotificationCard';
import AllAttendenceRecords from './AllAttendenceRecords';
import EmployeeAttendancePresentAbesent from './EmployeeAttendancePresentAbesent';
import EmployeeAttendanceMark from './EmployeeAttendanceMark';

export default function DashboardScreen({ onSignOut }) {
  const { items: employeeItems } = useSelector((state) => state.employeeList || { items: [] });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [screenParams, setScreenParams] = useState(null);
  const [viewedEmployeeId, setViewedEmployeeId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [editingLeaveRecord, setEditingLeaveRecord] = useState(null);
  const [viewingLeaveRecord, setViewingLeaveRecord] = useState(null);
  const [viewingAttendanceEmployee, setViewingAttendanceEmployee] = useState(null);

  const handleNavigate = (screen, params = null) => {
    setScreenParams(params ?? null);
    setCurrentScreen(screen);
  };

  const handleMenuPress = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOptionsPress = () => {
    handleNavigate('profile');
    setSidebarOpen(false);
  };

  const handleSidebarMenuPress = (item) => {
    console.log('Menu item pressed:', item.title);
    setSidebarOpen(false);
    
    // Navigate to different screens based on menu item
    switch (item.title) {
      case 'Dashboard':
        handleNavigate('dashboard');
        break;
      case 'Add Employee':
        handleNavigate('addEmployee');
        break;
      case 'Employee List':
        handleNavigate('employeeList');
        break;
      case 'Add Notification':
        handleNavigate('addNotification');
        break;
      case 'Notification List':
        handleNavigate('notificationList');
        break;
      case 'Add Attendance':
        handleNavigate('attendance');
        break;
      case 'Attendance List':
        handleNavigate('attendanceList');
        break;
      case 'Leave Application':
        handleNavigate('leaveApplication');
        break;
      case 'Employee Leave List':
        handleNavigate('employeeLeaveList');
        break;
      case 'My Attendance':
        handleNavigate('myAttendance');
        break;
      default:
        handleNavigate('dashboard');
    }
  };

  const handleOverlayPress = () => {
    setSidebarOpen(false);
  };

  // Add handler for viewing employee details (map API -> details shape)
  const handleViewEmployee = (employeeId) => {
    setViewedEmployeeId(String(employeeId));
    handleNavigate('employeeDetails');
  };

  // Open update leave application screen
  const handleEditLeave = (record) => {
    setEditingLeaveRecord(record);
    handleNavigate('editLeaveApplication');
  };

  const handleBackFromEditLeave = () => {
    setEditingLeaveRecord(null);
    handleNavigate('employeeLeaveList');
  };

  const handleViewLeave = (record) => {
    setViewingLeaveRecord(record);
    handleNavigate('leaveApplicationView');
  };

  const handleBackFromViewLeave = () => {
    setViewingLeaveRecord(null);
    handleNavigate('employeeLeaveList');
  };

  // Handle back from employee details
  const handleBackFromDetails = () => {
    setViewedEmployeeId(null);
    handleNavigate('employeeList');
  };

  // Add handler for editing employee
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    handleNavigate('editEmployee');
  };

  // Handle back from edit screen
  const handleBackFromEdit = () => {
    setEditingEmployee(null);
    handleNavigate('employeeList');
  };

  // Add handler for editing notification
  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    handleNavigate('editNotification');
  };

  const handleViewNotification = (notification) => {
    setViewingNotification(notification);
    handleNavigate('notificationCard', { notification, source: currentScreen });
  };

  // Handle back from edit notification screen
  const handleBackFromEditNotification = () => {
    setEditingNotification(null);
    handleNavigate('notificationList');
  };

  const handleBackFromNotificationCard = () => {
    const originScreen = screenParams?.source || 'notificationList';
    setViewingNotification(null);
    if (originScreen === 'dashboard') {
      handleNavigate('dashboard');
    } else {
      handleNavigate('notificationList');
    }
  };

  // Handle viewing employee attendance
  const handleViewAttendance = (employee) => {
    setViewingAttendanceEmployee(employee);
    handleNavigate('employeeAttendanceView');
  };

  // Handle back from employee attendance view
  const handleBackFromAttendanceView = () => {
    setViewingAttendanceEmployee(null);
    handleNavigate('attendanceList');
  };

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen !== 'dashboard') {
        // If not on dashboard, navigate to dashboard
        setScreenParams(null);
        setCurrentScreen('dashboard');
        setSidebarOpen(false);
        return true; // Prevent default behavior (app closing)
      }
      // If on dashboard, let default behavior happen (app can close)
      return false;
    });

    return () => backHandler.remove();
  }, [currentScreen]);

  // Render current screen based on state
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'addEmployee':
        return <AddEmployee />;
      case 'employeeList':
        return <EmployeeList onView={handleViewEmployee} onEdit={handleEditEmployee} />;
      case 'addNotification':
        return <AddNotification />;
      case 'notificationList':
        return <NotificationList onEdit={handleEditNotification} onView={handleViewNotification} />;
      case 'editNotification':
        return <EditNotification notification={editingNotification} onBack={handleBackFromEditNotification} />;
      case 'attendance':
        return <EmployeeAttendance />;
      case 'attendanceList':
        return <AttendanceList onViewAttendance={handleViewAttendance} />;
      case 'allAttendanceRecords':
        return <AllAttendenceRecords />;
      case 'attendancePresentAbsent':
        return (
          <EmployeeAttendancePresentAbesent
            onBack={() => handleNavigate('dashboard')}
          />
        );
      case 'employeeAttendanceMark':
        return (
          <EmployeeAttendanceMark
            onBack={() => handleNavigate('dashboard')}
          />
        );
      case 'employeeAttendance':
        return <EmployeeAttendance employee={viewingAttendanceEmployee} onBack={handleBackFromAttendanceView} />;
      case 'employeeAttendanceView':
        return <EmployeeAttendanceView employee={viewingAttendanceEmployee} onBack={handleBackFromAttendanceView} />;
      case 'myAttendance':
        return <MyAttendance />;
      case 'leaveApplication':
        return <LeaveApplicationForm onSuccess={() => handleNavigate('employeeLeaveList')} />;
      case 'employeeLeaveList':
        return <EmployeeLeaveList onEdit={handleEditLeave} onView={handleViewLeave} />;
      case 'editLeaveApplication':
        return (
          <UpdateLeaveApplication
            record={editingLeaveRecord}
            onSuccess={handleBackFromEditLeave}
          />
        );
      case 'leaveApplicationView':
        return <LeaveApplicationView record={viewingLeaveRecord} onBack={handleBackFromViewLeave} />;
      case 'employeeDetails':
        return <EmployeeDetails employeeId={viewedEmployeeId} onBack={handleBackFromDetails} />;
      case 'editEmployee':
        return <EditEmployee employee={editingEmployee} onBack={handleBackFromEdit} />;
      case 'profile':
        return (
          <ProfileScreen
            onBack={() => handleNavigate('dashboard')}
            onSignOut={onSignOut}
            onSwitchToHr={() => onSignOut?.('hr')}
          />
        );
      case 'notificationCard':
        return (
          <NotificationCard
            notification={screenParams?.notification || viewingNotification}
            onBack={handleBackFromNotificationCard}
          />
        );
      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Navbar */}
      <Navbar 
        onMenuPress={handleMenuPress}
        onOptionsPress={handleOptionsPress}
      />

      <View style={styles.mainContainer}>
        {/* Current Screen */}
        {renderCurrentScreen()}
        
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <TouchableOpacity 
            style={styles.sidebarOverlay}
            activeOpacity={1}
            onPress={handleOverlayPress}
          >
            <TouchableOpacity 
              style={styles.sidebarContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Sidebar 
                isOpen={sidebarOpen}
                onMenuPress={handleSidebarMenuPress}
                employee={currentScreen === 'employeeAttendance' || currentScreen === 'employeeAttendanceView' ? viewingAttendanceEmployee : null}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  mainContainer: {
    flex: 1,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  sidebarContainer: {
    width: 280,
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
});
