import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaveForEdit, resetUpdateLeaveState, updateLeaveApplication } from '../redux/slices/updateLeaveApplicationSlice';

const companyOptions = [
  { label: 'Tulyarth', value: 'tulyarth' },
  { label: 'Taxabide', value: 'taxabide' },
  { label: 'Tulyarth Digiweb', value: 'tulyarth_digiweb' },
  { label: 'Tulyarth Services', value: 'tulyarth_services' },
  { label: 'Loanbazzi', value: 'loanbazzi' },
  { label: 'Sukham Micro Finance', value: 'sukham_micro_finance' },
];

const findCompanyValueByLabel = (label) => {
  const found = companyOptions.find((o) => o.label?.toLowerCase() === (label || '').toLowerCase());
  return found ? found.value : '';
};

const toUiDate = (iso) => {
  if (!iso) return '';
  // expects yyyy-mm-dd -> dd/mm/yyyy
  const parts = String(iso).split('-');
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  }
  return iso;
};

const toIsoDate = (d) => {
  if (!d) return '';
  const parts = String(d).includes('/') ? String(d).split('/') : String(d).split('-');
  if (parts.length === 3) {
    // dd/mm/yyyy -> yyyy-mm-dd
    const [dd, mm, yyyy] = parts[0].length === 4 ? [parts[2], parts[1], parts[0]] : parts;
    return `${yyyy}-${`${mm}`.padStart(2, '0')}-${`${dd}`.padStart(2, '0')}`;
  }
  return d;
};

const UpdateLeaveApplication = ({ record, onSuccess }) => {
  const dispatch = useDispatch();
  const { loading, error, leaveData, updating, updateError, updateResult } = useSelector((state) => state.updateLeaveApplication || {});

  const [formData, setFormData] = useState({
    leaveAppliedDate: '',
    nameOfApplicant: '',
    employeeCode: '',
    companyName: '',
    contactNumber: '',
    designation: '',
    placeOfPosting: '',
    purposeOfLeave: '',
    leaveFrom: '',
    leaveTo: '',
    totalDaysOfLeave: '',
    addressOnLeave: '',
    relatedPersonContact: '',
    balanceLeave: '',
    teamLeaderRemark: '',
    taskAssignedTo: '',
  });

  const [showPicker, setShowPicker] = useState({ field: '', visible: false });
  const [date, setDate] = useState(new Date());

  // Fetch leave data from API when component mounts or record changes
  useEffect(() => {
    if (record?.l_id) {
      console.log('[UPDATE_LEAVE_APP] Fetching leave data for l_id:', record.l_id);
      dispatch(fetchLeaveForEdit(record.l_id));
    } else {
      console.log('[UPDATE_LEAVE_APP] No l_id found in record:', record);
    }
    
    // Reset state when component unmounts
    return () => {
      dispatch(resetUpdateLeaveState());
    };
  }, [record?.l_id, dispatch]);

  // Update form data when API data is fetched
  useEffect(() => {
    if (leaveData) {
      console.log('[UPDATE_LEAVE_APP] Received leave data from API:', leaveData);
      // Handle different response structures - could be leaveData directly or leaveData.data
      const data = leaveData.data || leaveData;
      setFormData({
        leaveAppliedDate: toUiDate(data?.l_applied_date),
        nameOfApplicant: data?.l_name || '',
        employeeCode: data?.l_emp_code || '',
        companyName: findCompanyValueByLabel(data?.l_company || data?.l_company_main || ''),
        contactNumber: data?.l_contact_number || '',
        designation: data?.l_designation || '',
        placeOfPosting: data?.l_posting_place || '',
        purposeOfLeave: data?.l_purpose || '',
        leaveFrom: toUiDate(data?.l_from_date),
        leaveTo: toUiDate(data?.l_to_date),
        totalDaysOfLeave: data?.l_total_days || '',
        addressOnLeave: data?.l_address_on_leave || '',
        relatedPersonContact: data?.l_related_contact_number || '',
        balanceLeave: data?.l_balance_leave || '',
        teamLeaderRemark: data?.l_team_leader_remark || '',
        taskAssignedTo: data?.l_task_assigned_to || '',
      });
    } else if (record && !loading && !leaveData) {
      // Fallback to record prop if API data is not available
      console.log('[UPDATE_LEAVE_APP] Using record prop as fallback:', record);
      setFormData({
        leaveAppliedDate: toUiDate(record?.l_applied_date),
        nameOfApplicant: record?.l_name || '',
        employeeCode: record?.l_emp_code || '',
        companyName: findCompanyValueByLabel(record?.l_company || record?.l_company_main || ''),
        contactNumber: record?.l_contact_number || '',
        designation: record?.l_designation || '',
        placeOfPosting: record?.l_posting_place || '',
        purposeOfLeave: record?.l_purpose || '',
        leaveFrom: toUiDate(record?.l_from_date),
        leaveTo: toUiDate(record?.l_to_date),
        totalDaysOfLeave: record?.l_total_days || '',
        addressOnLeave: record?.l_address_on_leave || '',
        relatedPersonContact: record?.l_related_contact_number || '',
        balanceLeave: record?.l_balance_leave || '',
        teamLeaderRemark: record?.l_team_leader_remark || '',
        taskAssignedTo: record?.l_task_assigned_to || '',
      });
    }
  }, [leaveData, record, loading]);

  const companyLabel = useMemo(() => {
    const apiCompany = leaveData?.data?.l_company || leaveData?.l_company || leaveData?.data?.l_company_main || leaveData?.l_company_main;
    return companyOptions.find((o) => o.value === formData.companyName)?.label || apiCompany || record?.l_company || record?.l_company_main || '';
  }, [formData.companyName, leaveData, record]);

  const handleSubmit = () => {
    if (!formData.nameOfApplicant) {
      Alert.alert('Validation Error', 'Please enter Name of Applicant');
      return;
    }
    if (!formData.addressOnLeave) {
      Alert.alert('Validation Error', 'Please enter Address When on Leave');
      return;
    }

    // Use l_id from API data or record prop
    const leaveId = leaveData?.data?.l_id || leaveData?.l_id || record?.l_id;
    console.log('[UPDATE_LEAVE_APP] Submitting with l_id:', leaveId);
    console.log('[UPDATE_LEAVE_APP] Form data:', formData);
    
    const payload = {
      l_id: leaveId,
      l_name: formData.nameOfApplicant,
      l_contact_number: formData.contactNumber,
      l_designation: formData.designation,
      l_applied_date: toIsoDate(formData.leaveAppliedDate),
      l_emp_code: formData.employeeCode,
      l_company: companyLabel,
      l_posting_place: formData.placeOfPosting,
      l_purpose: formData.purposeOfLeave,
      l_from_date: toIsoDate(formData.leaveFrom),
      l_to_date: toIsoDate(formData.leaveTo),
      l_total_days: formData.totalDaysOfLeave,
      l_address_on_leave: formData.addressOnLeave,
      l_related_contact_number: formData.relatedPersonContact,
      l_balance_leave: formData.balanceLeave,
      l_team_leader_remark: formData.teamLeaderRemark,
      l_task_assigned_to: formData.taskAssignedTo,
      l_company_main: companyLabel,
    };

    console.log('[UPDATE_LEAVE_APP] Payload to send:', payload);
    
    dispatch(updateLeaveApplication(payload)).unwrap()
      .then((result) => {
        console.log('[UPDATE_LEAVE_APP] Update successful, result:', result);
        Alert.alert('Success', 'Application updated successfully', [
          { text: 'OK', onPress: () => {
            onSuccess && onSuccess();
          }},
        ]);
      })
      .catch((err) => {
        console.log('[UPDATE_LEAVE_APP] Update error:', err);
        Alert.alert('Error', err?.message || 'Failed to update application');
      });
  };

  const renderText = (label, field, placeholder, keyboard) => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#B0B0B0"
        value={formData[field]}
        onChangeText={(t) => setFormData({ ...formData, [field]: t })}
        keyboardType={keyboard || 'default'}
      />
    </View>
  );

  const renderDate = (label, field) => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dateInputContainer}
        onPress={() => setShowPicker({ field, visible: true })}
      >
        <Text style={formData[field] ? styles.dateText : styles.placeholderText}>
          {formData[field] || 'Select Date'}
        </Text>
        <Icon name="calendar-today" size={20} color="#E95420" />
      </TouchableOpacity>
    </View>
  );

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString('en-GB');
      setFormData({ ...formData, [showPicker.field]: formatted });
    }
    setShowPicker({ field: '', visible: false });
  };

  // Show error if API fetch failed
  useEffect(() => {
    if (error) {
      console.log('[UPDATE_LEAVE_APP] Error fetching leave data:', error);
      Alert.alert('Error', error?.message || 'Failed to load leave data. Using available data.');
    }
  }, [error]);

  // Handle update result (backup handler via useEffect)
  useEffect(() => {
    if (updateResult) {
      console.log('[UPDATE_LEAVE_APP] Update result received:', updateResult);
    }
  }, [updateResult]);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leave data...</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.mainTitle}>Update your Application</Text>
          <View style={styles.headerLine} />
        </View>

        <View style={styles.companyCard}>
          <Text style={styles.companyName}>TULYARTH GROUP</Text>
          <Text style={styles.companyAddress}>
            Head Office - First Floor 1/4 Omkar Road, Behind G.P.O, Near Clock Tower, Dehradun (Uttarakhand) - 248001
          </Text>
          <Text style={styles.companyContact}>Ph: +911352657671, 9410593100 | info@tulyarth.com | www.tulyarth.com</Text>
        </View>

        <View style={styles.formCard}>
          {renderDate('Leave Applied Date *', 'leaveAppliedDate')}
          {renderText('Name of Applicant *', 'nameOfApplicant', 'Enter full name')}
          {renderText('Employee Code', 'employeeCode', 'Enter employee code')}

          {/* Company dropdown simplified as read-only label for update */}
          <View style={styles.formField}>
            <Text style={styles.label}>Company field Name</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.dateText}>{companyLabel || 'Select Company'}</Text>
            </View>
          </View>

          {renderText('Contact Number', 'contactNumber', 'Enter contact number', 'numeric')}
          {renderText('Designation (As Per Present Job Profile)', 'designation', 'Enter designation')}
          {renderText('Place of Posting', 'placeOfPosting', 'Enter place of posting')}
          {renderText('Purpose of Leave', 'purposeOfLeave', 'Enter purpose of leave')}
          {renderDate('Leave Applied (From)', 'leaveFrom')}
          {renderDate('Leave Applied (To)', 'leaveTo')}
          {renderText('Total Days of Leave', 'totalDaysOfLeave', 'Enter total days', 'numeric')}
          {renderText('Address When on Leave *', 'addressOnLeave', 'Enter address')}
          {renderText('Related Person Contact Number', 'relatedPersonContact', "Enter related person's contact number", 'numeric')}
          {renderText('Balance Leave (Up to 31 March 2026)', 'balanceLeave', 'Enter balance leave', 'numeric')}
          {renderText('Team Leader Remark', 'teamLeaderRemark', 'Enter team leader remarks')}
          {renderText('In Absence Task / Work Assigned To', 'taskAssignedTo', 'Enter assigned person name')}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={updating}>
          <Text style={styles.submitButtonText}>{updating ? 'Updating...' : 'Update'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {showPicker.visible && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { padding: 18, paddingBottom: 70 },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#E95420', letterSpacing: 0.6 },
  headerLine: { width: 90, height: 3, backgroundColor: '#E95420', borderRadius: 20, marginTop: 6 },
  companyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#E95420',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 22,
  },
  companyName: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center' },
  companyAddress: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 5, lineHeight: 18 },
  companyContact: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 4 },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#ECECEC', elevation: 3, marginBottom: 30 },
  formField: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 14, height: 46, backgroundColor: '#FFF', fontSize: 15, color: '#333' },
  dateInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 14, height: 46, justifyContent: 'space-between', backgroundColor: '#FFF' },
  dateText: { color: '#333', fontSize: 15 },
  placeholderText: { color: '#AAA', fontSize: 15 },
  readonlyBox: { height: 46, borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#F9FAFB' },
  submitButton: { backgroundColor: '#E95420', height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#E95420', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },
  submitButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.6 },
  loadingContainer: { padding: 20, alignItems: 'center', backgroundColor: '#FFF3E0', margin: 10, borderRadius: 8 },
  loadingText: { fontSize: 16, color: '#E95420', fontWeight: '600' },
});

export default UpdateLeaveApplication;






