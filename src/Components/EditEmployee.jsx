import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEditEmployee, updateEmployee } from '../redux/slices/editEmployeeSlice';

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        activeOpacity={0.8}
        onPress={() => setOpen(true)}>
        <Text
          style={value ? styles.dropdownValueText : styles.dropdownPlaceholderText}
          numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Icon name="arrow-drop-down" size={24} color="#666" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
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
                  }}>
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.dropdownSeparator} />}
              contentContainerStyle={{ paddingVertical: 6 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function EditEmployee({ employee, employeeId, onBack }) {
  const dispatch = useDispatch();
  const { 
    loading: editLoading, 
    item: editItem, 
    error: editError,
    updating,
    updateError,
    updateResult
  } = useSelector((state) => state.editEmployee || {});

  // Initialize empty, will hydrate from API
  const [formData, setFormData] = useState({
    // Employee Information
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    uan: '',
    officialEmail: '',
    aadhaar: '',
    pan: '',
    photo: null,
    photoUri: null,

    // Address Details
    presentAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      country: '',
      state: '',
      postalCode: '',
    },
    permanentAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      country: '',
      state: '',
      postalCode: '',
    },
    sameAsPresent: false,

    // Professional Details
    experience: '',
    sourceOfHire: '',
    skillSet: '',
    highestQualification: '',
    location: '',
    title: '',
    currentSalary: '',
    department: 'HR',
    additionalInfo: '',
    offerLetter: null,
    offerLetterName: null,
  });

  const [focusedInput, setFocusedInput] = useState(null);

  // Fetch edit data via API instead of external prop
  useEffect(() => {
    const id = employeeId || employee?.id || employee?.employee_id;
    console.log('[EditEmployee] Resolved employee_id:', id);
    dispatch(fetchEditEmployee(id ? { employee_id: id } : {}));
  }, [dispatch, employeeId, employee]);

  // Hydrate form when API data arrives
  useEffect(() => {
    if (!editItem) return;
    console.log('[EditEmployee] Mapping API item to form:', editItem);
    setFormData((prev) => ({
      ...prev,
      email: editItem.employee_email || '',
      firstName: editItem.employee_first_name || '',
      lastName: editItem.employee_last_name || '',
      phone: editItem.employee_phone || '',
      uan: editItem.employee_uan_number || '',
      officialEmail: editItem.employee_official_email || '',
      aadhaar: editItem.employee_aadhaar_number || '',
      pan: editItem.employee_pan_number || '',
      // We keep photoUri separate for local selection
      presentAddress: {
        addressLine1: editItem.employee_present_address1 || '',
        addressLine2: editItem.employee_present_address2 || '',
        city: editItem.employee_present_city || '',
        country: editItem.employee_present_country || '',
        state: editItem.employee_present_state || '',
        postalCode: editItem.employee_present_postal || '',
      },
      permanentAddress: {
        addressLine1: editItem.employee_permanent_address1 || '',
        addressLine2: editItem.employee_permanent_address2 || '',
        city: editItem.employee_permanent_city || '',
        country: editItem.employee_permanent_country || '',
        state: editItem.employee_permanent_state || '',
        postalCode: editItem.employee_permanent_postal || '',
      },
      experience: editItem.employee_experience || '',
      location: editItem.employee_location || '',
      sourceOfHire: editItem.employee_source_of_hire || '',
      title: editItem.employee_title || '',
      skillSet: editItem.employee_skills || '',
      currentSalary: editItem.employee_current_salary || '',
      highestQualification: editItem.employee_qualification || '',
      department: editItem.employee_department || 'HR',
      additionalInfo: editItem.employee_additional_info || '',
      offerLetterName: editItem.employee_offer_lett ? 'Selected' : null,
      // Education
      schoolName: editItem.employee_school_name || '',
      degree: editItem.employee_degree || '',
      fieldOfStudy: editItem.employee_field || '',
      dateOfCompletion: editItem.employee_completion_date || '',
      notes: editItem.employee_notes || '',
      // Experience
      occupation: editItem.employee_occupation || '',
      company: editItem.employee_company || '',
      summary: editItem.employee_summary || '',
      duration: editItem.employee_duration || '',
      currentlyWorkHere: editItem.employee_currently_working || '',
      role: editItem.employee_role || '',
      designation: editItem.employee_designation || '',
    }));
  }, [editItem]);

  // Dropdown options
  const countryOptions = [
    { label: 'Select Country', value: '' },
    { label: 'India', value: 'India' },
  ];

  const stateOptions = [
    { label: 'Select State', value: '' },
    { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
    { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
    { label: 'Assam', value: 'Assam' },
    { label: 'Bihar', value: 'Bihar' },
    { label: 'Chhattisgarh', value: 'Chhattisgarh' },
    { label: 'Goa', value: 'Goa' },
    { label: 'Gujarat', value: 'Gujarat' },
    { label: 'Haryana', value: 'Haryana' },
    { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
    { label: 'Jharkhand', value: 'Jharkhand' },
    { label: 'Karnataka', value: 'Karnataka' },
    { label: 'Kerala', value: 'Kerala' },
    { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
    { label: 'Maharashtra', value: 'Maharashtra' },
    { label: 'Manipur', value: 'Manipur' },
    { label: 'Meghalaya', value: 'Meghalaya' },
    { label: 'Mizoram', value: 'Mizoram' },
    { label: 'Nagaland', value: 'Nagaland' },
    { label: 'Odisha', value: 'Odisha' },
    { label: 'Punjab', value: 'Punjab' },
    { label: 'Rajasthan', value: 'Rajasthan' },
    { label: 'Sikkim', value: 'Sikkim' },
    { label: 'Tamil Nadu', value: 'Tamil Nadu' },
    { label: 'Telangana', value: 'Telangana' },
    { label: 'Tripura', value: 'Tripura' },
    { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
    { label: 'Uttarakhand', value: 'Uttarakhand' },
    { label: 'West Bengal', value: 'West Bengal' },
    { label: 'Andaman and Nicobar Islands', value: 'Andaman and Nicobar Islands' },
    { label: 'Chandigarh', value: 'Chandigarh' },
    { label: 'Dadra and Nagar Haveli and Daman and Diu', value: 'Dadra and Nagar Haveli and Daman and Diu' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Jammu and Kashmir', value: 'Jammu and Kashmir' },
    { label: 'Ladakh', value: 'Ladakh' },
    { label: 'Lakshadweep', value: 'Lakshadweep' },
    { label: 'Puducherry', value: 'Puducherry' },
  ];

  const departmentOptions = [
    { label: 'HR', value: 'HR' },
    { label: 'IT', value: 'IT' },
   
  ];

  const sourceOfHireOptions = [
    { label: 'Select', value: '' },
    { label: 'Job Portal', value: 'Job Portal' },
    { label: 'Referral', value: 'Referral' },
   
  ];

  const locationOptions = [
    { label: 'Select', value: '' },
    { label: 'Mumbai', value: 'Mumbai' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Bangalore', value: 'Bangalore' },
    { label: 'Pune', value: 'Pune' },
    { label: 'Hyderabad', value: 'Hyderabad' },
  ];

  const handlePhotoSelect = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          setFormData((prev) => ({
            ...prev,
            photoUri: response.assets[0].uri,
          }));
        }
      }
    );
  };

  const handleOfferLetterSelect = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      if (result && result[0]) {
        setFormData((prev) => ({
          ...prev,
          offerLetter: result[0],
          offerLetterName: result[0].name,
        }));
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
      }
    }
  };

  const handleSameAsPresent = () => {
    if (!formData.sameAsPresent) {
      setFormData((prev) => ({
        ...prev,
        sameAsPresent: true,
        permanentAddress: { ...prev.presentAddress },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        sameAsPresent: false,
        permanentAddress: {
          addressLine1: '',
          addressLine2: '',
          city: '',
          country: '',
          state: '',
          postalCode: '',
        },
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Get employee_id from editItem or props
      const id = editItem?.employee_id || employeeId || employee?.id || employee?.employee_id;
      
      if (!id) {
        console.error('[EditEmployee] No employee_id found');
        return;
      }

      // Prepare photo object if photoUri exists
      let photoObj = null;
      if (formData.photoUri) {
        // Extract filename from URI or use default
        const uriParts = formData.photoUri.split('/');
        const filename = uriParts[uriParts.length - 1] || 'photo.jpg';
        photoObj = {
          uri: formData.photoUri,
          name: filename,
          type: 'image/jpeg',
        };
      }

      // Note: Offer letter is not included in update API as the database column doesn't exist

      // Map formData to API payload format
      const payload = {
        employee_id: id,
        employee_email: formData.email || '',
        employee_first_name: formData.firstName || '',
        employee_last_name: formData.lastName || '',
        employee_password: editItem?.employee_password || '', // Keep existing password if not changed
        employee_phone: formData.phone || '',
        employee_uan_number: formData.uan || '',
        employee_official_email: formData.officialEmail || '',
        employee_aadhaar_number: formData.aadhaar || '',
        employee_pan_number: formData.pan || '',
        employee_photo: photoObj,
        employee_present_address1: formData.presentAddress.addressLine1 || '',
        employee_present_address2: formData.presentAddress.addressLine2 || '',
        employee_present_city: formData.presentAddress.city || '',
        employee_present_country: formData.presentAddress.country || '',
        employee_present_state: formData.presentAddress.state || '',
        employee_present_postal: formData.presentAddress.postalCode || '',
        employee_permanent_address1: formData.permanentAddress.addressLine1 || '',
        employee_permanent_address2: formData.permanentAddress.addressLine2 || '',
        employee_permanent_city: formData.permanentAddress.city || '',
        employee_permanent_country: formData.permanentAddress.country || '',
        employee_permanent_state: formData.permanentAddress.state || '',
        employee_permanent_postal: formData.permanentAddress.postalCode || '',
        employee_experience: formData.experience || '',
        employee_location: formData.location || '',
        employee_source_of_hire: formData.sourceOfHire || '',
        employee_title: formData.title || '',
        employee_skills: formData.skillSet || '',
        employee_current_salary: formData.currentSalary || '',
        employee_qualification: formData.highestQualification || '',
        employee_department: formData.department || '',
        employee_additional_info: formData.additionalInfo || '',
        // Note: employee_offer_lett removed - database column doesn't exist
        employee_school_name: formData.schoolName || '',
        employee_degree: formData.degree || '',
        employee_field: formData.fieldOfStudy || '',
        employee_completion_date: formData.dateOfCompletion || '',
        employee_notes: formData.notes || '',
        employee_occupation: formData.occupation || '',
        employee_company: formData.company || '',
        employee_summary: formData.summary || '',
        employee_duration: formData.duration || '',
        employee_currently_working: formData.currentlyWorkHere || '',
        employee_role: formData.role || '',
        employee_designation: formData.designation || '',
      };

      console.log('[EditEmployee] Updating employee with payload:', payload);
      
      const result = await dispatch(updateEmployee(payload)).unwrap();
      
      console.log('[EditEmployee] Update successful:', result);
      
      // Navigate back on success
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('[EditEmployee] Update failed:', error);
      // Error is already stored in Redux state (updateError)
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.mainHeading}>Edit Employee</Text>
        </View>

        {/* Employee Information Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Employee Information</Text>
          </View>

          <View style={styles.formVertical}>
            {/* Email ID */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="email" size={18} color="#E95420" />
                <Text style={styles.label}>
                  Email ID <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && styles.inputWrapperFocused,
                ]}>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                  placeholder="Enter email"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  keyboardType="email-address"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* First Name */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="person" size={18} color="#E95420" />
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'firstName' && styles.inputWrapperFocused,
                ]}>
                <TextInput
                  value={formData.firstName}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, firstName: text }))
                  }
                  placeholder="Enter first name"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  onFocus={() => setFocusedInput('firstName')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Phone */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="phone" size={18} color="#E95420" />
                <Text style={styles.label}>
                  Phone <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'phone' && styles.inputWrapperFocused,
                ]}>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                    placeholder="1234567890"
                    placeholderTextColor="#9CA3AF"
                    style={styles.phoneInput}
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="person-outline" size={18} color="#E95420" />
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'lastName' && styles.inputWrapperFocused,
                ]}>
                <TextInput
                  value={formData.lastName}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, lastName: text }))
                  }
                  placeholder="Enter last name"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  onFocus={() => setFocusedInput('lastName')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* UAN Number */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="badge" size={18} color="#4B5563" />
                <Text style={styles.label}>UAN Number</Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'uan' && styles.inputWrapperFocused,
                ]}>
                <TextInput
                  value={formData.uan}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, uan: text }))}
                  placeholder="Enter UAN number"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  onFocus={() => setFocusedInput('uan')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Official Email */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="mail-outline" size={18} color="#4B5563" />
                <Text style={styles.label}>Official Email</Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'officialEmail' && styles.inputWrapperFocused,
                ]}>
                <TextInput
                  value={formData.officialEmail}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, officialEmail: text }))
                  }
                  placeholder="Enter official email"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  keyboardType="email-address"
                  onFocus={() => setFocusedInput('officialEmail')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Aadhaar Card Number */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="credit-card" size={18} color="#4B5563" />
                <Text style={styles.label}>Aadhaar Card Number</Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'aadhaar' && styles.inputWrapperFocused,
                ]}>
                <TextInput
                  value={formData.aadhaar}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, aadhaar: text }))
                  }
                  placeholder="Enter Aadhaar number"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={12}
                  onFocus={() => setFocusedInput('aadhaar')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* PAN Card Number */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="account-card-details" size={18} color="#4B5563" />
                <Text style={styles.label}>PAN Card Number</Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'pan' && styles.inputWrapperFocused,
                ]}>
                <TextInput
                  value={formData.pan}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, pan: text }))}
                  placeholder="Enter PAN number"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  maxLength={10}
                  onFocus={() => setFocusedInput('pan')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Photo */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="photo-camera" size={18} color="#4B5563" />
                <Text style={styles.label}>Photo</Text>
              </View>
              <View style={styles.fileInputContainer}>
                <TouchableOpacity style={styles.fileButton} onPress={handlePhotoSelect}>
                  <Text style={styles.fileButtonText}>Choose file</Text>
                </TouchableOpacity>
                <View style={styles.fileNameContainer}>
                  <Text style={styles.fileName}>
                    {formData.photoUri ? 'File selected' : employee?.photo ? 'Current photo' : 'No file chosen'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Address Details Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Address Details</Text>
          </View>

          {/* Present Address */}
          <View style={styles.addressSection}>
            <View style={styles.subSectionHeader}>
              <Icon name="home" size={20} color="#E95420" />
              <Text style={styles.subSectionTitle}>Present Address</Text>
            </View>
            <View style={styles.formVertical}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="location-on" size={18} color="#4B5563" />
                  <Text style={styles.label}>Address line 1</Text>
                </View>
                <TextInput
                  value={formData.presentAddress.addressLine1}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      presentAddress: { ...prev.presentAddress, addressLine1: text },
                    }))
                  }
                  placeholder="Address line 1"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="location-on" size={18} color="#4B5563" />
                  <Text style={styles.label}>Address line 2</Text>
                </View>
                <TextInput
                  value={formData.presentAddress.addressLine2}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      presentAddress: { ...prev.presentAddress, addressLine2: text },
                    }))
                  }
                  placeholder="Address line 2"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="place" size={18} color="#4B5563" />
                  <Text style={styles.label}>City</Text>
                </View>
                <TextInput
                  value={formData.presentAddress.city}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      presentAddress: { ...prev.presentAddress, city: text },
                    }))
                  }
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="public" size={18} color="#4B5563" />
                  <Text style={styles.label}>Country</Text>
                </View>
                <CustomDropdown
                  value={formData.presentAddress.country}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      presentAddress: { ...prev.presentAddress, country: value },
                    }))
                  }
                  placeholder="Select Country"
                  options={countryOptions}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="map" size={18} color="#4B5563" />
                  <Text style={styles.label}>State</Text>
                </View>
                <CustomDropdown
                  value={formData.presentAddress.state}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      presentAddress: { ...prev.presentAddress, state: value },
                    }))
                  }
                  placeholder="Select State"
                  options={stateOptions}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="markunread-mailbox" size={18} color="#4B5563" />
                  <Text style={styles.label}>Postal Code</Text>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'presentPostalCode' && styles.inputWrapperFocused,
                  ]}>
                  <TextInput
                    value={formData.presentAddress.postalCode}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        presentAddress: { ...prev.presentAddress, postalCode: text },
                      }))
                    }
                    placeholder="Postal Code"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={6}
                    onFocus={() => setFocusedInput('presentPostalCode')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleSameAsPresent}
            activeOpacity={0.7}>
            <View style={[styles.checkbox, formData.sameAsPresent && styles.checkboxChecked]}>
              {formData.sameAsPresent && <Icon name="check" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Same as Present Address</Text>
          </TouchableOpacity>

          {/* Permanent Address */}
          <View style={styles.addressSection}>
            <View style={styles.subSectionHeader}>
              <Icon name="home-work" size={20} color="#E95420" />
              <Text style={styles.subSectionTitle}>Permanent Address</Text>
            </View>
            <View style={styles.formVertical}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="location-on" size={18} color="#4B5563" />
                  <Text style={styles.label}>Address line 1</Text>
                </View>
                <TextInput
                  value={formData.permanentAddress.addressLine1}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      permanentAddress: { ...prev.permanentAddress, addressLine1: text },
                    }))
                  }
                  placeholder="Address line 1"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  editable={!formData.sameAsPresent}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="location-on" size={18} color="#4B5563" />
                  <Text style={styles.label}>Address line 2</Text>
                </View>
                <TextInput
                  value={formData.permanentAddress.addressLine2}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      permanentAddress: { ...prev.permanentAddress, addressLine2: text },
                    }))
                  }
                  placeholder="Address line 2"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  editable={!formData.sameAsPresent}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="place" size={18} color="#4B5563" />
                  <Text style={styles.label}>City</Text>
                </View>
                <TextInput
                  value={formData.permanentAddress.city}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      permanentAddress: { ...prev.permanentAddress, city: text },
                    }))
                  }
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  editable={!formData.sameAsPresent}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="public" size={18} color="#4B5563" />
                  <Text style={styles.label}>Country</Text>
                </View>
                <CustomDropdown
                  value={formData.permanentAddress.country}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      permanentAddress: { ...prev.permanentAddress, country: value },
                    }))
                  }
                  placeholder="Select Country"
                  options={countryOptions}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>State</Text>
                <CustomDropdown
                  value={formData.permanentAddress.state}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      permanentAddress: { ...prev.permanentAddress, state: value },
                    }))
                  }
                  placeholder="Select State"
                  options={stateOptions}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Icon name="markunread-mailbox" size={18} color="#4B5563" />
                  <Text style={styles.label}>Postal Code</Text>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'permanentPostalCode' && styles.inputWrapperFocused,
                  ]}>
                  <TextInput
                    value={formData.permanentAddress.postalCode}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        permanentAddress: { ...prev.permanentAddress, postalCode: text },
                      }))
                    }
                    placeholder="Postal Code"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={6}
                    editable={!formData.sameAsPresent}
                    onFocus={() => setFocusedInput('permanentPostalCode')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Professional Details Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Professional Details</Text>
          </View>

          <View style={styles.formVertical}>
            {/* Experience */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="work" size={18} color="#4B5563" />
                <Text style={styles.label}>Experience</Text>
              </View>
              <TextInput
                value={formData.experience}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, experience: text }))}
                placeholder="e.g. 3 years"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.divider} />

            {/* Location */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="location-city" size={18} color="#4B5563" />
                <Text style={styles.label}>Location</Text>
              </View>
              <CustomDropdown
                value={formData.location}
                onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                placeholder="Select"
                options={locationOptions}
              />
            </View>

            <View style={styles.divider} />

            {/* Source of Hire */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="person-add" size={18} color="#4B5563" />
                <Text style={styles.label}>Source of Hire</Text>
              </View>
              <CustomDropdown
                value={formData.sourceOfHire}
                onChange={(value) => setFormData((prev) => ({ ...prev, sourceOfHire: value }))}
                placeholder="Select"
                options={sourceOfHireOptions}
              />
            </View>

            <View style={styles.divider} />

            {/* Title */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="title" size={18} color="#4B5563" />
                <Text style={styles.label}>Title</Text>
              </View>
              <TextInput
                value={formData.title}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
                placeholder="Enter title"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.divider} />

            {/* Skill Set */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="stars" size={18} color="#4B5563" />
                <Text style={styles.label}>Skill Set</Text>
              </View>
              <TextInput
                value={formData.skillSet}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, skillSet: text }))}
                placeholder="Enter skill set"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.divider} />

            {/* Current Salary */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="attach-money" size={18} color="#4B5563" />
                <Text style={styles.label}>Current Salary</Text>
              </View>
              <TextInput
                value={formData.currentSalary}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, currentSalary: text }))
                }
                placeholder="Enter salary"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.divider} />

            {/* Highest Qualification */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="school" size={18} color="#4B5563" />
                <Text style={styles.label}>Highest Qualification</Text>
              </View>
              <TextInput
                value={formData.highestQualification}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, highestQualification: text }))
                }
                placeholder="Enter qualification"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.divider} />

            {/* Department */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="business" size={18} color="#4B5563" />
                <Text style={styles.label}>Department</Text>
              </View>
              <CustomDropdown
                value={formData.department}
                onChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                placeholder="Select"
                options={departmentOptions}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Additional Information */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Icon name="info" size={18} color="#4B5563" />
              <Text style={styles.label}>Additional Information</Text>
            </View>
            <TextInput
              value={formData.additionalInfo}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, additionalInfo: text }))
              }
              placeholder="Enter additional information"
              placeholderTextColor="#9CA3AF"
              style={styles.textarea}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.divider} />

          {/* Offer Letter */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Icon name="description" size={18} color="#4B5563" />
              <Text style={styles.label}>Offer Letter</Text>
            </View>
            <View style={styles.fileInputContainer}>
              <TouchableOpacity style={styles.fileButton} onPress={handleOfferLetterSelect}>
                <Text style={styles.fileButtonText}>Choose file</Text>
              </TouchableOpacity>
              <View style={styles.fileNameContainer}>
                <Text style={styles.fileName}>
                  {formData.offerLetterName || 'No file chosen'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Error Message */}
        {updateError && (
          <View style={styles.errorContainer}>
            <Icon name="error" size={20} color="#EF4444" />
            <Text style={styles.errorText}>
              {updateError?.message || 'Failed to update employee. Please try again.'}
            </Text>
          </View>
        )}

        {/* Success Message */}
        {updateResult && updateResult.success && (
          <View style={styles.successContainer}>
            <Icon name="check-circle" size={20} color="#10B981" />
            <Text style={styles.successText}>
              {updateResult?.message || 'Employee updated successfully!'}
            </Text>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={[styles.saveButton, updating && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={updating}>
          <LinearGradient
            colors={updating ? ['#9CA3AF', '#6B7280'] : ['#E95420', '#D14A1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}>
            {updating ? (
              <>
                <Icon name="hourglass-empty" size={20} color="#fff" style={styles.saveButtonIcon} />
                <Text style={styles.saveButtonText}>Updating...</Text>
              </>
            ) : (
              <>
                <Icon name="save" size={20} color="#fff" style={styles.saveButtonIcon} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
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
  mainHeading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E95420',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E95420',
    letterSpacing: 0.2,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  formVertical: {
    flexDirection: 'column',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  required: {
    color: '#E95420',
    fontSize: 14,
  },
  inputWrapper: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: '#E95420',
    backgroundColor: '#FFF',
  },
  input: {
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  textarea: {
    minHeight: 100,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    color: '#1F2937',
  },
  fileInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    height: 44,
    alignItems: 'center',
  },
  fileButton: {
    backgroundColor: '#E5E7EB',
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  fileNameContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    color: '#6B7280',
  },
  addressSection: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#E95420',
    borderColor: '#E95420',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownTrigger: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValueText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  dropdownPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '80%',
    maxHeight: 300,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1F2937',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E95420',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonIcon: {
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

