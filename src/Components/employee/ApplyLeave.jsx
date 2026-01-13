import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { storeLeaveApplication } from '../../redux/slices/leaveApplicationFormSlice';

// ------------------ Custom Dropdown ------------------
const CustomDropdown = ({ value, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find(o => o.value === value)?.label || placeholder;

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
      >
        <Text
          style={
            value ? styles.dropdownValueText : styles.dropdownPlaceholderText
          }
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <Icon name="arrow-drop-down" size={24} color="#E95420" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdownCard}>
            <FlatList
              data={options}
              keyExtractor={(item, idx) => `${item.label}-${idx}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setOpen(false);
                    onChange(item.value);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.dropdownSeparator} />
              )}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ------------------ Main Form ------------------
const ApplyLeave = ({ onBack, user = {} }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { storing, storeError, storeResult } = useSelector(state => state.leaveApplication || {});
  const [formData, setFormData] = useState({
    leaveAppliedDate: '',
    nameOfApplicant: user?.employee_full_name || user?.employee_first_name || '',
    employeeCode: user?.employee_code || user?.employee_id || '',
    companyName: '',
    contactNumber: user?.employee_phone || user?.phone || '',
    designation: user?.employee_role || user?.employee_designation || '',
    placeOfPosting: user?.employee_location || '',
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

  const companyOptions = [
    { label: 'Tulyarth', value: 'tulyarth' },
    { label: 'Taxabide', value: 'taxabide' },
    { label: 'Tulyarth Digiweb', value: 'tulyarth_digiweb' },
    { label: 'Tulyarth Services', value: 'tulyarth_services' },
    { label: 'Loanbazzi', value: 'loanbazzi' },
    { label: 'Sukham Micro Finance', value: 'sukham_micro_finance' },
  ];

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString('en-GB');
      setFormData({ ...formData, [showPicker.field]: formatted });
    }
    setShowPicker({ field: '', visible: false });
  };

  const handleSubmit = () => {
    if (!formData.nameOfApplicant) {
      Alert.alert('Validation Error', 'Please enter Name of Applicant');
      return;
    }
    if (!formData.addressOnLeave) {
      Alert.alert('Validation Error', 'Please enter Address When on Leave');
      return;
    }
    const toIsoDate = (d) => {
      // Convert 'dd/mm/yyyy' to 'yyyy-mm-dd'
      if (!d) return '';
      const parts = d.split('/');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
      }
      return d;
    };

    const companyOptions = [
      { label: 'Tulyarth', value: 'tulyarth' },
      { label: 'Taxabide', value: 'taxabide' },
      { label: 'Tulyarth Digiweb', value: 'tulyarth_digiweb' },
      { label: 'Tulyarth Services', value: 'tulyarth_services' },
      { label: 'Loanbazzi', value: 'loanbazzi' },
      { label: 'Sukham Micro Finance', value: 'sukham_micro_finance' },
    ];
    const companyLabel = companyOptions.find(o => o.value === formData.companyName)?.label || formData.companyName;

    const payload = {
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

    console.log('[LEAVE_FORM] Dispatching storeLeaveApplication with payload:', payload);
    dispatch(storeLeaveApplication(payload));
  };

  useEffect(() => {
    if (storeResult) {
      console.log('[LEAVE_FORM] Store result:', storeResult);
      Alert.alert('Success', 'Leave application submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (onBack) {
              onBack();
            }
          },
        },
      ]);
    }
    if (storeError) {
      console.log('[LEAVE_FORM] Store error:', storeError);
      Alert.alert('Error', storeError?.message || 'Failed to submit leave application');
    }
  }, [storeResult, storeError, onBack]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Leave Application Form</Text>
          <View style={styles.headerLine} />
        </View>

        {/* COMPANY CARD */}
        <View style={styles.companyCard}>
          <Text style={styles.companyName}>TULYARTH GROUP</Text>
          <Text style={styles.companyAddress}>
            Head Office - First Floor 1/4 Omkar Road, Behind G.P.O, Near Clock
            Tower, Dehradun (Uttarakhand) - 248001
          </Text>
          <Text style={styles.companyContact}>
            Ph: +911352657671, 9410593100 | info@tulyarth.com | www.tulyarth.com
          </Text>
        </View>

        {/* FORM FIELDS */}
        <View style={styles.formCard}>
          {[
            {
              label: 'Leave Applied Date *',
              field: 'leaveAppliedDate',
              type: 'date',
            },
            {
              label: 'Name of Applicant *',
              field: 'nameOfApplicant',
              type: 'text',
              placeholder: 'Enter full name',
            },
            {
              label: 'Employee Code',
              field: 'employeeCode',
              type: 'text',
              placeholder: 'Enter employee code',
            },
            { label: 'Company Name', field: 'companyName', type: 'dropdown' },
           {
              label: 'Contact Number',
              field: 'contactNumber',
              type: 'text',
              placeholder: 'Enter contact number',
              maxLength: 10,
            },
            {
              label: 'Designation (As per Present Job Profile)',
              field: 'designation',
              type: 'text',
              placeholder: 'Enter designation',
            },
            {
              label: 'Place of Posting',
              field: 'placeOfPosting',
              type: 'text',
              placeholder: 'Enter place of posting',
            },
            {
              label: 'Purpose of Leave',
              field: 'purposeOfLeave',
              type: 'text',
              placeholder: 'Enter purpose of leave',
            },
            { label: 'Leave Applied (From)', field: 'leaveFrom', type: 'date' },
            { label: 'Leave Applied (To)', field: 'leaveTo', type: 'date' },
            {
              label: 'Total Days of Leave',
              field: 'totalDaysOfLeave',
              type: 'text',
              placeholder: 'Enter total days',
            },
            {
              label: 'Address When on Leave *',
              field: 'addressOnLeave',
              type: 'text',
              placeholder: 'Enter address',
            },
            {
              label: 'Related Person Contact Number',
              field: 'relatedPersonContact',
              type: 'text',
              placeholder: "Enter related person's number",
            },
            {
              label: 'Balance Leave (Up to 31 March 2026)',
              field: 'balanceLeave',
              type: 'text',
              placeholder: 'Enter balance leave',
            },
            {
              label: 'Team Leader Remark',
              field: 'teamLeaderRemark',
              type: 'text',
              placeholder: 'Enter team leader remarks',
            },
            {
              label: 'In Absence Task / Work Assigned To',
              field: 'taskAssignedTo',
              type: 'text',
              placeholder: 'Enter assigned person name',
            },
          ].map((item, idx) => (
            <View style={styles.formField} key={idx}>
              <Text style={styles.label}>{item.label}</Text>

              {item.type === 'text' && (
                <TextInput
                  style={styles.input}
                  placeholder={item.placeholder}
                  placeholderTextColor="#B0B0B0"
                  value={formData[item.field]}
                  onChangeText={t =>
                    setFormData({ ...formData, [item.field]: t })
                  }
                  maxLength={item.maxLength || 100}
                  keyboardType={
                    item.field === 'contactNumber' ||
                    item.field === 'relatedPersonContact'
                      ? 'numeric'
                      : 'default'
                  }
                />
              )}

              {item.type === 'date' && (
                <TouchableOpacity
                  style={styles.dateInputContainer}
                  onPress={() =>
                    setShowPicker({ field: item.field, visible: true })
                  }
                >
                  <Text
                    style={
                      formData[item.field]
                        ? styles.dateText
                        : styles.placeholderText
                    }
                  >
                    {formData[item.field] || 'Select Date'}
                  </Text>
                  <Icon name="calendar-today" size={20} color="#E95420" />
                </TouchableOpacity>
              )}

              {item.type === 'dropdown' && (
                <CustomDropdown
                  value={formData.companyName}
                  onChange={value =>
                    setFormData({ ...formData, companyName: value })
                  }
                  placeholder="Select Company"
                  options={companyOptions}
                />
              )}
            </View>
          ))}
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={storing}>
          <Text style={styles.submitButtonText}>{storing ? 'Submitting...' : 'Submit Application'}</Text>
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

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 70,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E95420',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  headerLine: {
    width: 90,
    height: 3,
    backgroundColor: '#E95420',
    borderRadius: 20,
    marginTop: 6,
    alignSelf: 'center',
  },
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
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  companyAddress: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },
  companyContact: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECECEC',
    elevation: 3,
    marginBottom: 30,
  },
  formField: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: '#FFF',
    fontSize: 15,
    color: '#333',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },
  dateText: {
    color: '#333',
    fontSize: 15,
  },
  placeholderText: {
    color: '#AAA',
    fontSize: 15,
  },
  dropdownTrigger: {
    height: 46,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValueText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  dropdownPlaceholderText: {
    fontSize: 15,
    color: '#AAA',
    flex: 1,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '85%',
    maxHeight: 320,
    elevation: 10,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#EEE',
  },
  submitButton: {
    backgroundColor: '#E95420',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E95420',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});

export default ApplyLeave;

