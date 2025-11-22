import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeDetailsById, resetEmployeeDetails } from '../redux/slices/employeeDetailsSlice';

const { width } = Dimensions.get('window');

const defaultEmployee = {
  photo: require('../assests/images/avatar.jpg'),
  firstName: 'Amit',
  lastName: 'TL',
  phone: '1234567890',
  email: 'tl@gmail.com',
  uan: '—',
  officialEmail: '',
  aadhaar: '',
  pan: '',
  presentAddress: {
    address1: '—',
    address2: '—',
    city: '—',
    state: 'Select State',
    country: 'Select Country',
    postalCode: '—',
  },
  permanentAddress: {
    address1: '—',
    address2: '—',
    city: '—',
    state: 'Select State',
    country: 'Select Country',
    postalCode: '—',
  },
  experience: '3 Years',
  location: 'Bangalore',
  sourceOfHire: 'Referral',
  title: 'Team Lead',
  department: 'HR',
  skills: 'Communication, Leadership, HR Operations',
  salary: '₹60,000 / month',
  qualification: 'MBA (HR)',
  additionalInfo: 'Handles HR operations and recruitment',
  schoolName: 'Christ University',
  degree: 'MBA',
  fieldOfStudy: 'Human Resource Management',
  dateOfCompletion: '2018',
  notes: 'Top performer 2022',
  occupation: 'HR Manager',
  company: 'Tulyarth Pvt. Ltd.',
  summary: 'Managing HR functions and team development',
  duration: '2018 - Present',
  role: 'Team Lead',
  designation: 'HR Lead',
  currentlyWorkHere: 'Yes',
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

const EmployeeDetails = ({ employeeId, onBack }) => {
  const fallbackAvatar = require('../assests/images/avatar.jpg');
  const dispatch = useDispatch();
  const { loading, item, error } = useSelector((state) => state.employeeDetails || {});

  useEffect(() => {
    if (employeeId) {
      console.log('[EMPLOYEE_DETAILS][UI] Fetching employeeId:', employeeId);
      dispatch(fetchEmployeeDetailsById({ employee_id: employeeId }));
    }
    return () => {
      dispatch(resetEmployeeDetails());
    };
  }, [dispatch, employeeId]);

  const employee = useMemo(() => {
    if (!item) return defaultEmployee;
    const photo = item.employee_photo
      ? { uri: `https://hr.tulyarthdigiweb.com/uploads/${item.employee_photo}` }
      : fallbackAvatar;
    return {
      photo,
      firstName: item.employee_first_name || '—',
      lastName: item.employee_last_name || '—',
      phone: item.employee_phone || '—',
      email: item.employee_email || '—',
      uan: item.employee_uan_number || '—',
      officialEmail: item.employee_official_email || '—',
      aadhaar: item.employee_aadhaar_number || '—',
      pan: item.employee_pan_number || '—',
      presentAddress: {
        address1: item.employee_present_address1 || '—',
        address2: item.employee_present_address2 || '—',
        city: item.employee_present_city || '—',
        state: item.employee_present_state || '—',
        country: item.employee_present_country || '—',
        postalCode: item.employee_present_postal || '—',
      },
      permanentAddress: {
        address1: item.employee_permanent_address1 || '—',
        address2: item.employee_permanent_address2 || '—',
        city: item.employee_permanent_city || '—',
        state: item.employee_permanent_state || '—',
        country: item.employee_permanent_country || '—',
        postalCode: item.employee_permanent_postal || '—',
      },
      experience: item.employee_experience || '—',
      location: item.employee_location || '—',
      sourceOfHire: item.employee_source_of_hire || '—',
      title: item.employee_title || '—',
      department: item.employee_department || '—',
      skills: item.employee_skills || '—',
      salary: item.employee_current_salary || '—',
      qualification: item.employee_qualification || '—',
      additionalInfo: item.employee_additional_info || '—',
      schoolName: item.employee_school_name || '—',
      degree: item.employee_degree || '—',
      fieldOfStudy: item.employee_field || '—',
      dateOfCompletion: item.employee_completion_date || '—',
      notes: item.employee_notes || '—',
      occupation: item.employee_occupation || '—',
      company: item.employee_company || '—',
      summary: item.employee_summary || '—',
      duration: item.employee_duration || '—',
      designation: item.employee_designation || '—',
      role: item.employee_role || '—',
      currentlyWorkHere: item.employee_currently_working || '—',
    };
  }, [item]);

  const [photoSource, setPhotoSource] = useState(fallbackAvatar);

  useEffect(() => {
    setPhotoSource((employee && employee.photo) || fallbackAvatar);
  }, [employee, fallbackAvatar]);

  return (
    <View style={styles.mainContainer}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Details</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        {loading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#E95420" />
            <Text style={{ marginTop: 8, color: '#6B7280' }}>Loading details...</Text>
          </View>
        )}
        {!!error && (
          <View style={{ padding: 12, marginHorizontal: 16, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
            <Text style={{ color: '#991B1B' }}>Failed to load details</Text>
          </View>
        )}
        <View style={styles.card}>
        {/* 🟠 Header Gradient */}
        <View style={styles.headerBackground}>
          <LinearGradient
            colors={['#E95420', '#ffb380', '#FFE1CF']}
            style={styles.gradientLayer1}
          />
          <LinearGradient
            colors={['#FFD6C4', '#E95420']}
            style={styles.gradientLayer2}
          />

          {/* Avatar with orange background behind it */}
          <View style={styles.avatarOuter}>
            <LinearGradient
              colors={['#E95420', '#ffb380']}
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
            {employee.firstName} {employee.lastName}
          </Text>
          <View style={styles.titleBadge}>
            <Text style={styles.titleText}>{employee.title}</Text>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>{employee.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactText}>{employee.email}</Text>
            </View>
          </View>
        </View>

        {/* Sections */}
        <SectionTitle title="Employee Information" />
        <View style={styles.sectionBody}>
          <InfoRow label="UAN Number" value={employee.uan} />
          <InfoRow label="Official Email" value={employee.officialEmail} />
          <InfoRow label="Aadhaar Number" value={employee.aadhaar} />
          <InfoRow label="PAN Number" value={employee.pan} isLast />
        </View>

        <SectionTitle title="Present Address" />
        <View style={styles.sectionBody}>
          <InfoRow label="Address Line 1" value={employee.presentAddress.address1} />
          <InfoRow label="Address Line 2" value={employee.presentAddress.address2} />
          <InfoRow label="City" value={employee.presentAddress.city} />
          <InfoRow label="State" value={employee.presentAddress.state} />
          <InfoRow label="Country" value={employee.presentAddress.country} />
          <InfoRow label="Postal Code" value={employee.presentAddress.postalCode} isLast />
        </View>

        <SectionTitle title="Permanent Address" />
        <View style={styles.sectionBody}>
          <InfoRow label="Address Line 1" value={employee.permanentAddress.address1} />
          <InfoRow label="Address Line 2" value={employee.permanentAddress.address2} />
          <InfoRow label="City" value={employee.permanentAddress.city} />
          <InfoRow label="State" value={employee.permanentAddress.state} />
          <InfoRow label="Country" value={employee.permanentAddress.country} />
          <InfoRow label="Postal Code" value={employee.permanentAddress.postalCode} isLast />
        </View>

        <SectionTitle title="Professional Details" />
        <View style={styles.sectionBody}>
          <InfoRow label="Experience" value={employee.experience} />
          <InfoRow label="Location" value={employee.location} />
          <InfoRow label="Source of Hire" value={employee.sourceOfHire} />
          <InfoRow label="Department" value={employee.department} />
          <InfoRow label="Skills" value={employee.skills} />
          <InfoRow label="Salary" value={employee.salary} />
          <InfoRow label="Qualification" value={employee.qualification} />
          <InfoRow label="Additional Info" value={employee.additionalInfo} isLast />
        </View>

        <SectionTitle title="Education" />
        <View style={styles.sectionBody}>
          <InfoRow label="Institution" value={employee.schoolName} />
          <InfoRow label="Degree" value={employee.degree} />
          <InfoRow label="Field of Study" value={employee.fieldOfStudy} />
          <InfoRow label="Completion Date" value={employee.dateOfCompletion} />
          <InfoRow label="Additional Notes" value={employee.notes} isLast />
        </View>

        <SectionTitle title="Work Experience" />
        <View style={styles.sectionBody}>
          <InfoRow label="Occupation" value={employee.occupation} />
          <InfoRow label="Company" value={employee.company} />
          <InfoRow label="Summary" value={employee.summary} />
          <InfoRow label="Duration" value={employee.duration} />
          <InfoRow label="Designation" value={employee.designation} />
          <InfoRow label="Role" value={employee.role} />
          <InfoRow label="Currently Working" value={employee.currentlyWorkHere} isLast />
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

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
 
  titleText: { fontSize: 14, fontWeight: '600', color: '#E95420' },
  contactInfo: { width: '100%', gap: 8, marginBottom: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  contactIcon: { fontSize: 14 },
  contactText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  sectionHeader: {
    backgroundColor: '#E95420',
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
    borderColor: '#E95420',
    borderTopWidth: 0,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastInfoRow: { borderBottomWidth: 0 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', flex: 1 },
  value: { fontSize: 14, color: '#6B7280', flex: 1, textAlign: 'right', fontWeight: '500' },
});

export default EmployeeDetails;
