import React, { useMemo, useState, useCallback } from 'react';
import {
  Alert,
  SafeAreaView,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import EmployeeDashboard from './EmployeeDashboard';
import EmployeeProfile from './EmployeeProfile';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

const cleanText = (value, fallback = '') => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return fallback;
};

const assembleProfile = (user = {}, employeeName = 'Employee') => {
  const primaryEmail =
    cleanText(user.employee_email) ||
    cleanText(user.email) ||
    `${employeeName?.split(' ')[0]?.toLowerCase() || 'employee'}@company.com`;

  const phone =
    cleanText(user.employee_phone) ||
    cleanText(user.phone) ||
    cleanText(user.mobile) ||
    '+91 00000 00000';

  const department = cleanText(user.employee_department, 'IT Department');
  const designation = cleanText(user.employee_role, 'Software Engineer');

  const presentAddress = cleanText(
    user.employee_present_address,
    '1/4 First Floor, Omkar Road, Behind GPO, Near Clock Tower, Dehradun, Uttrakhand'
  );
  const permanentAddress = cleanText(
    user.employee_permanent_address,
    '1/4 First Floor, Omkar Road, Behind GPO, Near Clock Tower, Dehradun, Uttrakhand'
  );

  const badgeId =
    cleanText(user.employee_code) ||
    cleanText(user.employee_id) ||
    cleanText(user.employee_number) ||
    'EMP-1224';

  const stats = [
    { label: 'Experience', value: cleanText(user.employee_experience, '3 yrs') },
    { label: 'Salary', value: cleanText(user.employee_salary, '₹10 LPA') },
    { label: 'Status', value: cleanText(user.employee_status, 'Active') },
  ];

  const buildField = (label, value, extra = {}) => ({
    label,
    value: cleanText(value, '—'),
    ...extra,
  });

  return {
    name: employeeName,
    designation,
    department,
    employeeCode: badgeId,
    email: primaryEmail,
    phone,
    location: cleanText(user.employee_location, 'Mumbai, India'),
    stats,
    sections: [
      {
        id: 'employee-info',
        title: 'Employee Information',
        icon: 'card-account-details-outline',
        fields: [
          buildField('UAN Number', user.employee_uan || '658'),
          buildField('Official Email', primaryEmail),
          buildField('Aadhaar Number', user.employee_aadhaar || '123412341234'),
          buildField('PAN Number', user.employee_pan || 'ASDF1234H'),
        ],
      },
      {
        id: 'present-address',
        title: 'Present Address',
        icon: 'map-marker-radius',
        fields: [
          buildField('Address 1', presentAddress, { fullWidth: true }),
          buildField('Address 2', user.employee_present_address_2 || 'Shamsher Garh'),
          buildField('City', user.employee_present_city || 'Dehradun'),
          buildField('State', user.employee_present_state || 'California'),
          buildField('Country', user.employee_present_country || 'India'),
          buildField('Postal Code', user.employee_present_pin || '248001'),
        ],
      },
      {
        id: 'permanent-address',
        title: 'Permanent Address',
        icon: 'home-map-marker',
        fields: [
          buildField('Address 1', permanentAddress, { fullWidth: true }),
          buildField('Address 2', user.employee_permanent_address_2 || '—'),
          buildField('City', user.employee_permanent_city || 'Dehradun'),
          buildField('State', user.employee_permanent_state || 'Uttrakhand'),
          buildField('Country', user.employee_permanent_country || 'India'),
          buildField('Postal Code', user.employee_permanent_pin || '248001'),
        ],
      },
      {
        id: 'professional',
        title: 'Professional Details',
        icon: 'briefcase-account',
        fields: [
          buildField('Experience', user.employee_experience || '3'),
          buildField('Location', user.employee_location || 'Mumbai'),
          buildField('Source of Hire', user.employee_hire_source || 'Job Portal'),
          buildField('Title', designation || 'PHP Dev'),
          buildField('Skills', user.employee_skills || 'PHP'),
          buildField('Salary', user.employee_salary || '10'),
          buildField('Department', department || 'IT'),
          buildField('Qualification', user.employee_qualification || 'BCA'),
          buildField('Additional Info', user.employee_additional_info || '1224', { fullWidth: true }),
        ],
      },
      {
        id: 'education',
        title: 'Education',
        icon: 'school-outline',
        fields: [
          buildField('School Name', user.employee_school_name || 'BCA'),
          buildField('Degree', user.employee_degree || 'BCA'),
          buildField('Field', user.employee_field || 'Computer Applications'),
          buildField('Date of Completion', user.employee_completion_date || ''),
          buildField('Additional Notes', user.employee_education_notes || '', { fullWidth: true }),
        ],
      },
      {
        id: 'work-experience',
        title: 'Work Experience',
        icon: 'office-building',
        fields: [
          buildField('Occupation', user.employee_occupation || 'Software Developer'),
          buildField('Company', user.employee_company || 'Tulyarth'),
          buildField('Role', user.employee_role || 'Employee'),
          buildField('Designation', user.employee_designation || 'Developer'),
          buildField('Duration', user.employee_duration || '3 Years'),
          buildField('Currently Working', user.employee_currently_working || 'Yes'),
          buildField('Summary', user.employee_summary || 'Working on HRMS platform & internal tooling.', {
            fullWidth: true,
          }),
        ],
      },
    ],
  };
};

const mapActionKeyToScreen = (actionKey) => {
  switch (actionKey) {
    case 'profile':
    case 'profile-view':
      return 'profile';
    case 'dashboard':
      return 'dashboard';
    default:
      return null;
  }
};

export default function EmployeeWorkspace({
  employeeName = 'Employee',
  notificationsCount = 0,
  user = {},
  onRequestSignOut,
}) {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const profile = useMemo(() => assembleProfile(user, employeeName), [user, employeeName]);

  const safeAlert = useCallback((message) => {
    Alert.alert('Coming Soon', message);
  }, []);

  const handleAction = useCallback(
    (actionKey) => {
      const nextScreen = mapActionKeyToScreen(actionKey);
      if (nextScreen) {
        setActiveScreen(nextScreen);
        if (nextScreen === 'dashboard') {
          setSidebarOpen(false);
        }
        return;
      }

      switch (actionKey) {
        case 'attendance-mark':
          safeAlert('Attendance marking will be available shortly.');
          break;
        case 'attendance-view':
          safeAlert('Your attendance history is on the way.');
          break;
        case 'leave-add':
          safeAlert('Leave application flow will open soon.');
          break;
        case 'leave-list':
          safeAlert('Leave history will be ready shortly.');
          break;
        case 'notifications-list':
        case 'announcements':
          safeAlert('Notification center is being prepared.');
          break;
        default:
          safeAlert('This feature is under construction.');
          break;
      }
    },
    [safeAlert]
  );

  const handleSidebarMenuPress = useCallback(
    (item) => {
      setSidebarOpen(false);
      const key = item?.id || item?.title;
      switch (key) {
        case 'dashboard':
        case 'Dashboard':
          handleAction('dashboard');
          break;
        case 'profile':
        case 'My Profile':
          handleAction('profile-view');
          break;
        case 'attendance-add':
        case 'Add Attendance':
          handleAction('attendance-mark');
          break;
        case 'attendance-my':
        case 'My Attendance':
          handleAction('attendance-view');
          break;
        case 'leave-apply':
        case 'Apply Leave':
          handleAction('leave-add');
          break;
        case 'leave-view':
        case 'View Leave':
          handleAction('leave-list');
          break;
        case 'notification-list':
        case 'Notification List':
          handleAction('notifications-list');
          break;
        default:
          break;
      }
    },
    [handleAction]
  );

  const renderProfileScreen = () => (
    <SafeAreaView style={styles.profileScreen}>
      <Navbar
        onMenuPress={() => setSidebarOpen(true)}
        onOptionsPress={onRequestSignOut}
      />
      <View style={styles.profileContent}>
        <EmployeeProfile profile={profile} onBack={() => setActiveScreen('dashboard')} />
      </View>
      {sidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.sidebarOverlay}
          onPress={() => setSidebarOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sidebarContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <Sidebar
              isOpen
              variant="employee"
              onMenuPress={handleSidebarMenuPress}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );

  if (activeScreen === 'profile') {
    return renderProfileScreen();
  }

  return (
    <EmployeeDashboard
      employeeName={employeeName}
      notificationsCount={notificationsCount}
      onCardAction={handleAction}
      onAnnouncementsPress={() => handleAction('notifications-list')}
      onRequestSignOut={onRequestSignOut}
    />
  );
}

const styles = StyleSheet.create({
  profileScreen: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  profileContent: {
    flex: 1,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
  },
  sidebarContainer: {
    width: 280,
    height: '100%',
  },
});

