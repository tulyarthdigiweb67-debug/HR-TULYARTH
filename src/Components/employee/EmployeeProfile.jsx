import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const fallbackAvatar = require('../../assests/images/avatar.jpg');

const defaultProfile = {
  name: 'demo2 kumar',
  designation: 'PHP Developer',
  department: 'IT Department',
  employeeCode: 'EMP-1224',
  location: 'Dehradun, India',
  email: 'aman@gmail.com',
  phone: '1234567890',
  heroGradient: ['#F7B733', '#FC4A1A'],
  sections: [
    {
      id: 'employee-info',
      title: 'Employee Information',
      icon: 'card-account-details-outline',
      fields: [
        { label: 'UAN Number', value: '658' },
        { label: 'Official Email', value: 'aman@gmail.com' },
        { label: 'Aadhaar Number', value: '123412341234' },
        { label: 'PAN Number', value: 'ASDF1234H' },
      ],
    },
    {
      id: 'present-address',
      title: 'Present Address',
      icon: 'map-marker-radius',
      fields: [
        {
          label: 'Address 1',
          value: '1/4 First Floor, Omkar Road, Behind GPO, Near Clock Tower, Dehradun, Uttrakhand',
          fullWidth: true,
        },
        { label: 'Address 2', value: 'Shamsher Garh' },
        { label: 'City', value: 'Dehradun' },
        { label: 'State', value: 'California' },
        { label: 'Country', value: 'India' },
        { label: 'Postal Code', value: '248001' },
      ],
    },
    {
      id: 'permanent-address',
      title: 'Permanent Address',
      icon: 'home-map-marker',
      fields: [
        {
          label: 'Address 1',
          value: '1/4 First Floor, Omkar Road, Behind GPO, Near Clock Tower, Dehradun, Uttrakhand',
          fullWidth: true,
        },
        { label: 'Address 2', value: '—' },
        { label: 'City', value: 'Dehradun' },
        { label: 'State', value: '—' },
        { label: 'Country', value: 'India' },
        { label: 'Postal Code', value: '248001' },
      ],
    },
    {
      id: 'professional',
      title: 'Professional Details',
      icon: 'briefcase-account',
      fields: [
        { label: 'Experience', value: '3' },
        { label: 'Location', value: 'Mumbai' },
        { label: 'Source of Hire', value: 'Job Portal' },
        { label: 'Title', value: 'PHP Dev' },
        { label: 'Skills', value: 'PHP' },
        { label: 'Salary', value: '10' },
        { label: 'Department', value: 'IT' },
        { label: 'Qualification', value: 'BCA' },
        { label: 'Additional Info', value: '1224', fullWidth: true },
      ],
    },
    {
      id: 'education',
      title: 'Education',
      icon: 'school-outline',
      fields: [
        { label: 'School Name', value: 'BCA' },
        { label: 'Degree', value: 'BCA' },
        { label: 'Field', value: 'Computer Applications' },
        { label: 'Date of Completion', value: '—' },
        { label: 'Additional Notes', value: '—', fullWidth: true },
      ],
    },
    {
      id: 'work-experience',
      title: 'Work Experience',
      icon: 'office-building',
      fields: [
        { label: 'Occupation', value: 'Software Developer' },
        { label: 'Company', value: 'Tulyarth' },
        { label: 'Role', value: 'Employee' },
        { label: 'Designation', value: 'Developer' },
        { label: 'Duration', value: '3 Years' },
        { label: 'Currently Working', value: 'Yes' },
        {
          label: 'Summary',
          value: 'Working on HRMS platform & internal tooling.',
          fullWidth: true,
        },
      ],
    },
  ],
};

const ContactItem = ({ icon, label, value }) => (
  <View style={styles.contactColumn}>
    <View style={styles.contactIcon}>
      <Icon name={icon} size={20} color="#F97316" />
    </View>
    <Text style={styles.contactLabel}>{label}</Text>
    <Text style={styles.contactValue}>{value || '—'}</Text>
  </View>
);

const InfoRow = ({ label, value, isLast }) => (
  <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

const SectionCard = ({ section }) => (
  <View style={styles.formSection}>
    <View style={styles.formSectionHeader}>
      <View style={styles.formSectionBadge}>
        <Icon name={section.icon} size={18} color="#F97316" />
      </View>
      <Text style={styles.formSectionTitle}>{section.title}</Text>
    </View>
    <View style={styles.formSectionBody}>
      {section.fields.map((field, index) => (
        <InfoRow
          key={`${section.id}-${field.label}`}
          label={field.label}
          value={field.value}
          isLast={index === section.fields.length - 1}
        />
      ))}
    </View>
  </View>
);

export default function EmployeeProfile({ profile = defaultProfile, onBack }) {
  const gradientColors = profile.heroGradient || ['#F97316', '#FB923C'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={gradientColors} style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={onBack} activeOpacity={0.8} style={styles.backButton}>
              <Icon name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.heroTopTitle}>My Profile</Text>
            <View style={styles.heroTopSpacer} />
          </View>

          <View style={styles.profileRow}>
            <Image source={profile.avatar || fallbackAvatar} style={styles.heroAvatar} />
            <View style={styles.heroDetails}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileDesignation}>{profile.designation}</Text>
              <Text style={styles.profileDepartment}>{profile.department}</Text>
              <Text style={styles.profileLocation}>{profile.location}</Text>
            </View>
          </View>

          <View style={styles.contactCard}>
            <ContactItem icon="phone" label="Phone" value={profile.phone} />
            <View style={styles.contactDivider} />
            <ContactItem icon="email" label="Official Email" value={profile.email} />
          </View>
        </LinearGradient>

        {(profile.sections || defaultProfile.sections).map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  heroCard: {
    borderRadius: 26,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroTopTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  heroTopSpacer: {
    width: 40,
    height: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroAvatar: {
    width: 88,
    height: 88,
    borderRadius: 22,
    marginRight: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  heroDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  profileDesignation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  profileDepartment: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  profileLocation: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  contactColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contactLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contactValue: {
    marginTop: 4,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  contactDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 12,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 18,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFF4EC',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5D0',
  },
  formSectionBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFE0CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C2410C',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  formSectionBody: {
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  infoRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 20,
  },
});

