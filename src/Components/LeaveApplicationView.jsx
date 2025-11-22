import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaveApplicationView, resetLeaveApplicationView } from '../redux/slices/leaveApplicationViewSlice';

// Attractive view-only screen for a single leave application
export default function LeaveApplicationView({ record, onBack }) {
  const dispatch = useDispatch();
  const { loading, error, item, raw } = useSelector((state) => state.leaveApplicationView || {});

  // Fetch leave data from API when component mounts or record changes
  useEffect(() => {
    if (record?.l_id) {
      console.log('[LEAVE_APPLICATION_VIEW] Fetching leave data for l_id:', record.l_id);
      dispatch(fetchLeaveApplicationView({ l_id: record.l_id }));
    } else {
      console.log('[LEAVE_APPLICATION_VIEW] No l_id found in record:', record);
    }
    
    // Reset state when component unmounts
    return () => {
      dispatch(resetLeaveApplicationView());
    };
  }, [record?.l_id, dispatch]);

  // Use API data if available, otherwise fallback to record prop
  const displayRecord = item || record;

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('approved')) return { bg: '#DEF7EC', text: '#03543F' };
    if (s.includes('pending')) return { bg: '#FEF3C7', text: '#92400E' };
    if (s.includes('rejected')) return { bg: '#FEE2E2', text: '#991B1B' };
    return { bg: '#F3F4F6', text: '#4B5563' };
  };

  const statusStyle = getStatusStyle(displayRecord?.l_status);

  const InfoCard = ({ icon, label, value, fullWidth }) => (
    <View style={[styles.infoCard, fullWidth && styles.infoCardFull]}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={20} color="#E95420" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{String(value ?? '—')}</Text>
      </View>
    </View>
  );

  const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // Show loading indicator while fetching
  if (loading && !displayRecord) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack} 
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#E95420" />
            <Text style={styles.backText}>Leave Application</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E95420" />
          <Text style={styles.loadingText}>Loading leave application...</Text>
        </View>
      </View>
    );
  }

  // Show error message if API call failed
  if (error && !displayRecord) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack} 
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#E95420" />
            <Text style={styles.backText}>Leave Application</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>
            {error?.message || 'Failed to load leave application'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => record?.l_id && dispatch(fetchLeaveApplicationView({ l_id: record.l_id }))}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack} 
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#E95420" />
          <Text style={styles.backText}>Leave Application</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Header Banner */}
        <View style={styles.companyBanner}>
          <View style={styles.companyLogoCircle}>
            <Text style={styles.companyInitials}>TG</Text>
          </View>
          <Text style={styles.companyName}>TULYARTH GROUP</Text>
          <View style={styles.divider} />
          <Text style={styles.companyAddress}>
            First Floor, 14 Old Connaught Road, Behind GPO{'\n'}
            Near Clock Tower, Dehradun (Uttarakhand) 248001
          </Text>
          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <Icon name="phone" size={14} color="#E95420" />
              <Text style={styles.contactText}>0135-2657767</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="email" size={14} color="#E95420" />
              <Text style={styles.contactText}>info@tulyarth.com</Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <Text style={styles.formTitle}>Leave Application Form</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {displayRecord?.l_status || 'Pending'}
            </Text>
          </View>
        </View>

        {/* Employee Information Section */}
        <View style={styles.section}>
          <SectionHeader title="EMPLOYEE INFORMATION" />
          <View style={styles.cardGrid}>
            <InfoCard icon="person" label="Name" value={displayRecord?.l_name} />
            <InfoCard icon="badge" label="Employee Code" value={displayRecord?.l_emp_code} />
            <InfoCard icon="work" label="Designation" value={displayRecord?.l_designation} />
            <InfoCard icon="business" label="Company" value={displayRecord?.l_company ?? displayRecord?.l_company_main} />
            <InfoCard icon="location-on" label="Posting Place" value={displayRecord?.l_posting_place} />
            <InfoCard icon="phone" label="Contact" value={displayRecord?.l_contact_number} />
          </View>
        </View>

        {/* Leave Details Section */}
        <View style={styles.section}>
          <SectionHeader title="LEAVE DETAILS" />
          
          {/* Highlighted Leave Summary */}
          <View style={styles.leaveSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{displayRecord?.l_total_days || '0'}</Text>
              <Text style={styles.summaryLabel}>Total Days</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryDate}>{displayRecord?.l_from_date}</Text>
              <Text style={styles.summaryLabel}>From Date</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryDate}>{displayRecord?.l_to_date}</Text>
              <Text style={styles.summaryLabel}>To Date</Text>
            </View>
          </View>

          <View style={styles.cardGrid}>
            <InfoCard icon="event" label="Applied Date" value={displayRecord?.l_applied_date} />
            <InfoCard icon="assessment" label="Balance Leave" value={displayRecord?.l_balance_leave} />
          </View>

          <View style={styles.purposeCard}>
            <View style={styles.purposeHeader}>
              <Icon name="description" size={18} color="#E95420" />
              <Text style={styles.purposeLabel}>Purpose / Reason for Leave</Text>
            </View>
            <Text style={styles.purposeText}>{displayRecord?.l_purpose || '—'}</Text>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <SectionHeader title="CONTACT INFORMATION" />
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Icon name="home" size={18} color="#E95420" />
              <Text style={styles.addressLabel}>Address While on Leave</Text>
            </View>
            <Text style={styles.addressText}>{displayRecord?.l_address_on_leave || '—'}</Text>
          </View>
          <InfoCard 
            icon="phone-in-talk" 
            label="Emergency Contact" 
            value={displayRecord?.l_related_contact_number} 
            fullWidth 
          />
        </View>

        {/* Work Delegation Section */}
        <View style={styles.section}>
          <SectionHeader title="WORK DELEGATION" />
          <View style={styles.cardGrid}>
            <InfoCard 
              icon="people" 
              label="Task Assigned To" 
              value={displayRecord?.l_task_assigned_to} 
              fullWidth 
            />
          </View>
          <View style={styles.remarkCard}>
            <View style={styles.remarkHeader}>
              <Icon name="chat-bubble" size={18} color="#E95420" />
              <Text style={styles.remarkLabel}>Team Leader Remark</Text>
            </View>
            <Text style={styles.remarkText}>{displayRecord?.l_team_leader_remark || '—'}</Text>
          </View>
        </View>

        {/* Signatures Section */}
        <View style={styles.section}>
          <SectionHeader title="APPROVALS & SIGNATURES" />
          <View style={styles.signatureContainer}>
            {['Applicant', 'Team Leader', 'Sanctioning Authority'].map((role, index) => (
              <View key={index} style={styles.signatureBox}>
                <View style={styles.signaturePlaceholder}>
                  <Icon name="edit" size={28} color="#D1D5DB" />
                </View>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Signature of{'\n'}{role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>This is an official document of Tulyarth Group</Text>
          <Text style={styles.footerDate}>Generated on {new Date().toLocaleDateString('en-IN')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE8DC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: '#E95420',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  companyBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE8DC',
    elevation: 2,
    shadowColor: '#E95420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  companyLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E95420',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#E95420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  companyInitials: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  companyName: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  divider: {
    height: 2,
    width: 60,
    backgroundColor: '#E95420',
    alignSelf: 'center',
    marginVertical: 12,
    borderRadius: 1,
  },
  companyAddress: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionLine: {
    width: 4,
    height: 16,
    backgroundColor: '#E95420',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  cardGrid: {
    gap: 10,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE8DC',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoCardFull: {
    width: '100%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE8DC',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  leaveSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFE8DC',
    elevation: 2,
    shadowColor: '#E95420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#E95420',
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E95420',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#FFE8DC',
  },
  purposeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFE8DC',
  },
  purposeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  purposeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  purposeText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE8DC',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  addressText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  remarkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFE8DC',
  },
  remarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  remarkLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  remarkText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  signatureContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 20,
    borderWidth: 1,
    borderColor: '#FFE8DC',
  },
  signatureBox: {
    alignItems: 'center',
  },
  signaturePlaceholder: {
    width: '100%',
    height: 90,
    backgroundColor: '#FFF5F0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFE8DC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  signatureLine: {
    width: '80%',
    height: 2,
    backgroundColor: '#1F2937',
    marginBottom: 8,
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footerDate: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#E95420',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});