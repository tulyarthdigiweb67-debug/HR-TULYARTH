import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  Platform,
  BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmployeeDashboard from './EmployeeDashboard';
import EmployeeAttendance from './EmployeeAttendance';
import ApplyLeave from './ApplyLeave';
import ViewLeave from './ViewLeave';
import NotificationList from './NotificationListEmp';
import NotificationCard from '../NotificationCard';
import MyAttendance from '../MyAttendance';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

const fallbackAvatar = require('../../assests/images/avatar.jpg');
const { width } = Dimensions.get('window');

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
    { label: 'Experience', value: cleanText(user.employee_experience, '3 yrs'), icon: 'briefcase' },
    { label: 'Salary', value: cleanText(user.employee_salary, '₹10 LPA'), icon: 'currency-inr' },
    { label: 'Status', value: cleanText(user.employee_status, 'Active'), icon: 'check-circle' },
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
        color: '#F59E0B',
        bgColor: '#FEF3C7',
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
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        fields: [
          buildField('Address Line 1', presentAddress, { fullWidth: true }),
          buildField('Address Line 2', user.employee_present_address_2 || user.employee_present_address2 || '—'),
          buildField('City', user.employee_present_city || '—'),
          buildField('State', user.employee_present_state || '—'),
          buildField('Country', user.employee_present_country || '—'),
          buildField('Postal Code', user.employee_present_pin || user.employee_present_postal || '—'),
        ],
      },
      {
        id: 'permanent-address',
        title: 'Permanent Address',
        icon: 'home-map-marker',
        color: '#10B981',
        bgColor: '#D1FAE5',
        fields: [
          buildField('Address Line 1', permanentAddress, { fullWidth: true }),
          buildField('Address Line 2', user.employee_permanent_address_2 || user.employee_permanent_address2 || '—'),
          buildField('City', user.employee_permanent_city || '—'),
          buildField('State', user.employee_permanent_state || '—'),
          buildField('Country', user.employee_permanent_country || '—'),
          buildField('Postal Code', user.employee_permanent_pin || user.employee_permanent_postal || '—'),
        ],
      },
      {
        id: 'professional',
        title: 'Professional Details',
        icon: 'briefcase-account',
        color: '#8B5CF6',
        bgColor: '#EDE9FE',
        fields: [
          buildField('Experience', user.employee_experience || '—'),
          buildField('Location', user.employee_location || '—'),
          buildField('Source of Hire', user.employee_hire_source || user.employee_source_of_hire || '—'),
          buildField('Department', department || '—'),
          buildField('Skills', user.employee_skills || '—'),
          buildField('Salary', user.employee_salary || user.employee_current_salary || '—'),
          buildField('Qualification', user.employee_qualification || '—'),
          buildField('Additional Info', user.employee_additional_info || '—'),
        ],
      },
      {
        id: 'education',
        title: 'Education',
        icon: 'school-outline',
        color: '#EC4899',
        bgColor: '#FCE7F3',
        fields: [
          buildField('Institution', user.employee_school_name || '—'),
          buildField('Degree', user.employee_degree || '—'),
          buildField('Field of Study', user.employee_field || user.employee_field_of_study || '—'),
          buildField('Completion Date', user.employee_completion_date || '—'),
          buildField('Additional Notes', user.employee_education_notes || user.employee_notes || '—'),
        ],
      },
      {
        id: 'work-experience',
        title: 'Work Experience',
        icon: 'office-building',
        color: '#06B6D4',
        bgColor: '#CFFAFE',
        fields: [
          buildField('Occupation', user.employee_occupation || '—'),
          buildField('Company', user.employee_company || '—'),
          buildField('Summary', user.employee_summary || '—'),
          buildField('Duration', user.employee_duration || '—'),
          buildField('Designation', user.employee_designation || '—'),
          buildField('Role', user.employee_role || '—'),
          buildField('Currently Working', user.employee_currently_working || user.employee_currentlyWorkHere || '—'),
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
    case 'attendance-mark':
      return 'attendance';
    case 'attendance-view':
      return 'myAttendance';
    case 'leave-add':
      return 'applyLeave';
    case 'leave-list':
      return 'viewLeave';
    case 'notifications-list':
    case 'announcements':
      return 'notifications';
    default:
      return null;
  }
};

const SectionTitle = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const InfoRow = ({ label, value, isLast }) => (
  <View style={[styles.infoRow, isLast && styles.lastInfoRow]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '—'}</Text>
  </View>
);

const ProfileView = ({ profile, onBack }) => {
  const [photoSource, setPhotoSource] = useState(profile.avatar || fallbackAvatar);
  const nameParts = profile.name ? profile.name.split(' ') : ['Employee'];
  const firstName = nameParts[0] || 'Employee';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Map profile sections to EmployeeDetails format
  const employeeInfo = profile.sections?.find(s => s.id === 'employee-info');
  const presentAddr = profile.sections?.find(s => s.id === 'present-address');
  const permanentAddr = profile.sections?.find(s => s.id === 'permanent-address');
  const professional = profile.sections?.find(s => s.id === 'professional');
  const education = profile.sections?.find(s => s.id === 'education');
  const workExp = profile.sections?.find(s => s.id === 'work-experience');

  return (
    <View style={styles.mainContainer}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* Header Gradient */}
          <View style={styles.headerBackground}>
            <LinearGradient
              colors={['#462556', '#6a3a7c', '#8B5A9F']}
              style={styles.gradientLayer1}
            />
            <LinearGradient
              colors={['#6a3a7c', '#462556']}
              style={styles.gradientLayer2}
            />

            {/* Avatar with purple background behind it */}
            <View style={styles.avatarOuter}>
              <LinearGradient
                colors={['#462556', '#6a3a7c']}
                style={styles.avatarBg}
              >
                <View style={styles.avatarWrapper}>
                  <Image
                    source={photoSource}
                    style={styles.avatar}
                    onError={() => setPhotoSource(fallbackAvatar)}
                  />
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {firstName} {lastName}
            </Text>
            <View style={styles.titleBadge}>
              <Text style={styles.titleText}>{profile.designation || profile.title || 'Employee'}</Text>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactText}>{profile.phone || '—'}</Text>
              </View>
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>✉️</Text>
                <Text style={styles.contactText}>{profile.email || '—'}</Text>
              </View>
            </View>
          </View>

          {/* Sections */}
          {employeeInfo && (
            <>
              <SectionTitle title="Employee Information" />
              <View style={styles.sectionBody}>
                {employeeInfo.fields.map((field, idx) => (
                  <InfoRow
                    key={idx}
                    label={field.label}
                    value={field.value}
                    isLast={idx === employeeInfo.fields.length - 1}
                  />
                ))}
              </View>
            </>
          )}

          {presentAddr && (
            <>
              <SectionTitle title="Present Address" />
              <View style={styles.sectionBody}>
                {presentAddr.fields.map((field, idx) => (
                  <InfoRow
                    key={idx}
                    label={field.label}
                    value={field.value}
                    isLast={idx === presentAddr.fields.length - 1}
                  />
                ))}
              </View>
            </>
          )}

          {permanentAddr && (
            <>
              <SectionTitle title="Permanent Address" />
              <View style={styles.sectionBody}>
                {permanentAddr.fields.map((field, idx) => (
                  <InfoRow
                    key={idx}
                    label={field.label}
                    value={field.value}
                    isLast={idx === permanentAddr.fields.length - 1}
                  />
                ))}
              </View>
            </>
          )}

          {professional && (
            <>
              <SectionTitle title="Professional Details" />
              <View style={styles.sectionBody}>
                {professional.fields.map((field, idx) => (
                  <InfoRow
                    key={idx}
                    label={field.label}
                    value={field.value}
                    isLast={idx === professional.fields.length - 1}
                  />
                ))}
              </View>
            </>
          )}

          {education && (
            <>
              <SectionTitle title="Education" />
              <View style={styles.sectionBody}>
                {education.fields.map((field, idx) => (
                  <InfoRow
                    key={idx}
                    label={field.label}
                    value={field.value}
                    isLast={idx === education.fields.length - 1}
                  />
                ))}
              </View>
            </>
          )}

          {workExp && (
            <>
              <SectionTitle title="Work Experience" />
              <View style={styles.sectionBody}>
                {workExp.fields.map((field, idx) => (
                  <InfoRow
                    key={idx}
                    label={field.label}
                    value={field.value}
                    isLast={idx === workExp.fields.length - 1}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default function EmployeeProfile({
  employeeName = 'Employee',
  notificationsCount = 0,
  user = {},
  onRequestSignOut,
  profile: externalProfile,
  onBack: externalOnBack,
}) {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shouldAutoOpenNotification, setShouldAutoOpenNotification] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);

  const profile = useMemo(() => {
    if (externalProfile) {
      return externalProfile;
    }
    return assembleProfile(user, employeeName);
  }, [user, employeeName, externalProfile]);

  const safeAlert = useCallback((message) => {
    Alert.alert('Coming Soon', message);
  }, []);

  const handleAction = useCallback(
    (actionKey) => {
      const nextScreen = mapActionKeyToScreen(actionKey);
      if (nextScreen) {
        // Only auto-open the latest notification when coming from the
        // announcement banner, not from the sidebar "Notification List".
        if (actionKey === 'announcements') {
          setShouldAutoOpenNotification(true);
        } else {
          setShouldAutoOpenNotification(false);
        }
        setActiveScreen(nextScreen);
        if (nextScreen === 'dashboard') {
          setSidebarOpen(false);
        }
        return;
      }

      switch (actionKey) {
        case 'leave-list':
          safeAlert('Leave history will be ready shortly.');
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

  const handleBack = useCallback(() => {
    setViewingNotification(null);
    setShouldAutoOpenNotification(false);
    if (externalOnBack) {
      externalOnBack();
    } else {
      setActiveScreen('dashboard');
    }
  }, [externalOnBack]);

  useEffect(() => {
    if (activeScreen !== 'notifications' && shouldAutoOpenNotification) {
      setShouldAutoOpenNotification(false);
    }
  }, [activeScreen, shouldAutoOpenNotification]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeScreen !== 'dashboard') {
        handleBack();
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [activeScreen, handleBack]);

  if (externalProfile && !employeeName && !user) {
    return <ProfileView profile={externalProfile} onBack={handleBack} />;
  }

  if (activeScreen === 'profile') {
    return (
      <SafeAreaView style={styles.profileScreen}>
        <Navbar
          onMenuPress={() => setSidebarOpen(true)}
          onOptionsPress={onRequestSignOut}
        />
        <View style={styles.profileContent}>
          <ProfileView profile={profile} onBack={handleBack} />
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
  }

  if (activeScreen === 'attendance') {
    return (
      <SafeAreaView style={styles.profileScreen}>
        <Navbar
          onMenuPress={() => setSidebarOpen(true)}
          onOptionsPress={onRequestSignOut}
        />
        <View style={styles.profileContent}>
          <EmployeeAttendance employee={user} onBack={handleBack} />
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
  }

  if (activeScreen === 'myAttendance') {
    return (
      <SafeAreaView style={styles.profileScreen}>
        <Navbar
          onMenuPress={() => setSidebarOpen(true)}
          onOptionsPress={onRequestSignOut}
        />
        <View style={styles.profileContent}>
          <MyAttendance />
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
  }

  if (activeScreen === 'viewLeave') {
    return (
      <SafeAreaView style={styles.profileScreen}>
        <Navbar
          onMenuPress={() => setSidebarOpen(true)}
          onOptionsPress={onRequestSignOut}
        />
        <View style={styles.profileContent}>
          <ViewLeave user={user} onBack={handleBack} />
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
  }

  if (activeScreen === 'applyLeave') {
    return (
      <SafeAreaView style={styles.profileScreen}>
        <Navbar
          onMenuPress={() => setSidebarOpen(true)}
          onOptionsPress={onRequestSignOut}
        />
        <View style={styles.profileContent}>
          <ApplyLeave user={user} onBack={handleBack} />
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
  }

  if (activeScreen === 'notificationCard') {
    return (
      <SafeAreaView style={styles.profileScreen}>
        <Navbar
          onMenuPress={() => setSidebarOpen(true)}
          onOptionsPress={onRequestSignOut}
        />
        <View style={styles.profileContent}>
          <NotificationCard
            notification={viewingNotification}
            notificationId={viewingNotification?.n_id}
            onBack={() => {
              setViewingNotification(null);
              setActiveScreen('dashboard');
            }}
          />
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
  }

  if (activeScreen === 'notifications') {
    return (
      <SafeAreaView style={styles.profileScreen}>
        <Navbar
          onMenuPress={() => setSidebarOpen(true)}
          onOptionsPress={onRequestSignOut}
        />
        <View style={styles.profileContent}>
          <NotificationList
            onBack={() => {
              setShouldAutoOpenNotification(false);
              handleBack();
            }}
            autoOpenLatest={shouldAutoOpenNotification}
          />
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
  }

  return (
    <EmployeeDashboard
      employeeName={employeeName}
      notificationsCount={notificationsCount}
      onCardAction={handleAction}
      onAnnouncementsPress={(latestNotification) => {
        if (latestNotification) {
          setViewingNotification(latestNotification);
          setActiveScreen('notificationCard');
          return;
        }
        handleAction('notifications-list');
      }}
      onRequestSignOut={onRequestSignOut}
    />
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  container: { backgroundColor: '#FAFAFA', paddingVertical: 24, alignItems: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'relative',
    width: '100%',
    height: 180,
    overflow: 'visible',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientLayer1: {
    position: 'absolute',
    width: width,
    height: 180,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    transform: [{ scaleX: 1.5 }],
  },
  gradientLayer2: {
    position: 'absolute',
    width: width * 0.9,
    height: 150,
    top: 20,
    opacity: 0.8,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    transform: [{ scaleX: 1.3 }],
  },
  avatarOuter: {
    position: 'absolute',
    bottom: -60,
    borderRadius: 75,
    padding: 6,
    elevation: 8,
  },
  avatarBg: {
    borderRadius: 75,
    padding: 5,
  },
  avatarWrapper: {
    backgroundColor: '#fff',
    borderRadius: 70,
    padding: 4,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 16,
  },
  name: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  titleBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  titleText: { fontSize: 14, fontWeight: '600', color: '#462556' },
  contactInfo: { width: '100%', gap: 8, marginBottom: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  contactIcon: { fontSize: 14 },
  contactText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  sectionHeader: {
    backgroundColor: '#462556',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' },
  sectionBody: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#462556',
    borderTopWidth: 0,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  infoRow: {
    flexDirection: 'column',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastInfoRow: { borderBottomWidth: 0 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  value: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  profileScreen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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