import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Image,
  Modal,
  FlatList
} from 'react-native';

// Image and Document Picker imports
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker, { types as DocumentTypes } from 'react-native-document-picker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { addEmployee, resetAddState } from '../redux/slices/employeeSlice';



// Lightweight, attractive white-themed dropdown
const CustomDropdown = ({ value, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.dropdownValueText : styles.dropdownPlaceholderText} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Icon name="arrow-drop-down" size={24} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity style={styles.dropdownBackdrop} activeOpacity={1} onPress={() => setOpen(false)}>
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
              ItemSeparatorComponent={() => <View style={styles.dropdownSeparator} />}
              contentContainerStyle={{ paddingVertical: 6 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const AddEmployee = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { adding, addError, addResult } = useSelector((state) => state.employee || {});
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    officialEmail: '',
    panNumber: '',
    uanNumber: '',
    aadhaarNumber: '',
    photo: null,
  });

  // State for image and document
  const [photoUri, setPhotoUri] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);

  /* Android Permissions Required (add to AndroidManifest.xml):
   * For Camera:
   * <uses-permission android:name="android.permission.CAMERA" />
   * 
   * For Storage/Gallery:
   * <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   * <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   * For Android 13+:
   * <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
   */

  // Function to handle image picker - Gallery or Camera
  const handleImagePicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 800,
                maxHeight: 800,
              },
              (response) => {
                if (response.didCancel) {
                  console.log('User cancelled camera picker');
                } else if (response.errorMessage) {
                  Alert.alert('Error', response.errorMessage);
                } else if (response.assets && response.assets[0]) {
                  setPhotoUri(response.assets[0].uri);
                  setPersonalInfo({ ...personalInfo, photo: response.assets[0] });
                }
              }
            );
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 800,
                maxHeight: 800,
              },
              (response) => {
                if (response.didCancel) {
                  console.log('User cancelled image picker');
                } else if (response.errorMessage) {
                  Alert.alert('Error', response.errorMessage);
                } else if (response.assets && response.assets[0]) {
                  setPhotoUri(response.assets[0].uri);
                  setPersonalInfo({ ...personalInfo, photo: response.assets[0] });
                }
              }
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Function to handle document picker - Offer Letter
  const handleDocumentPicker = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [
          DocumentTypes.pdf,
          DocumentTypes.doc,
          DocumentTypes.docx,
        ],
        allowMultiSelection: false,
      });

      // results is an array of picked files
      if (results && results[0]) {
        const file = results[0];
        setDocumentInfo({
          name: file.name,
          size: file.size,
          uri: file.uri,
          type: file.type,
        });
        setProfessionalDetails({ ...professionalDetails, offerLetter: file });
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        Alert.alert('Error', 'Failed to pick document: ' + err.message);
      }
    }
  };

  const [addressDetails, setAddressDetails] = useState({
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
  });

  const [professionalDetails, setProfessionalDetails] = useState({
    experience: '',
    location: '',
    sourceOfHire: '',
    title: '',
    skillSet: '',
    currentSalary: '',
    highestQualification: '',
    department: 'HR',
    offerLetter: null,
    additionalInfo: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [education, setEducation] = useState({
    schoolName: '',
    degree: '',
    fieldOfStudy: '',
    dateOfCompletion: '',
    additionalNotes: '',
  });

  const [experience, setExperience] = useState({
    occupation: '',
    company: '',
    summary: '',
    duration: '',
    currentlyWorkHere: '',
    role: '',
    designation: '',
  });

  // Dropdown option data
  const countryOptions = ['India',];
  const statesByCountry = {
    India: [
      'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry','Chandigarh','Andaman and Nicobar Islands','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep'
    ],

  };

  const steps = [
    { id: 'employeeInfo', label: 'Employee Information', title: 'Personal Details' },
    { id: 'addressDetails', label: 'Address Details', title: 'Address Information' },
    { id: 'professionalDetails', label: 'Professional Details', title: 'Professional Info' },
    { id: 'education', label: 'Education', title: 'Educational Background' },
    { id: 'experience', label: 'Experience', title: 'Work Experience' },
  ];

  const handleStepChange = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateCurrentStep = (stepIndex = currentStep) => {
    const stepId = steps[stepIndex].id;
    switch (stepId) {
      case 'employeeInfo':
        return personalInfo.firstName.trim() !== '' && 
               personalInfo.lastName.trim() !== '' && 
               personalInfo.phone.trim() !== '' &&
               personalInfo.email.trim() !== '' &&
               personalInfo.password.trim() !== '' &&
               validateEmail(personalInfo.email) &&
               validatePassword(personalInfo.password);
      case 'addressDetails':
        return addressDetails.presentAddress.addressLine1.trim() !== '' && addressDetails.presentAddress.city.trim() !== '';
      case 'professionalDetails':
        return professionalDetails.title.trim() !== '' && professionalDetails.department.trim() !== '';
      case 'education':
        return education.schoolName.trim() !== '' && education.degree.trim() !== '';
      case 'experience':
        return experience.occupation.trim() !== '' && experience.company.trim() !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      let errorMessage = 'Please fill in all required fields before proceeding.';
      
      if (steps[currentStep].id === 'employeeInfo') {
        if (!personalInfo.email.trim() || !validateEmail(personalInfo.email)) {
          errorMessage = 'Please enter a valid email address.';
        } else if (!personalInfo.password.trim() || !validatePassword(personalInfo.password)) {
          errorMessage = 'Password must be at least 6 characters long.';
        }
      }
      
      Alert.alert('Validation Error', errorMessage);
      return;
    }
    
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Validate all steps before submission
    const allStepsValid = steps.every((step, index) => validateCurrentStep(index));

    if (!allStepsValid) {
      Alert.alert('Validation Error', 'Please complete all required fields in all steps before submitting.');
      return;
    }

    const payload = {
      personalInfo,
      addressDetails,
      professionalDetails,
      education,
      experience,
    };

    console.log('[ADD_EMPLOYEE][SUBMIT] Payload snapshot:', {
      personalInfo,
      addressDetails,
      professionalDetails: { ...professionalDetails, offerLetter: !!professionalDetails.offerLetter },
      education,
      experience,
    });

    dispatch(addEmployee(payload));
  };

  useEffect(() => {
    if (addResult) {
      console.log('[ADD_EMPLOYEE][SUCCESS] Result:', addResult);
      Alert.alert('Success', 'Employee added successfully!');
      dispatch(resetAddState());
    }
  }, [addResult, dispatch]);

  useEffect(() => {
    if (addError) {
      console.log('[ADD_EMPLOYEE][ERROR]:', addError);
      Alert.alert('Error', addError?.message || 'Failed to add employee');
      dispatch(resetAddState());
    }
  }, [addError, dispatch]);


  const renderEmployeeInfoForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Personal Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.firstName}
          onChangeText={(text) => setPersonalInfo({...personalInfo, firstName: text})}
          placeholder="Enter your first name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.lastName}
          onChangeText={(text) => setPersonalInfo({...personalInfo, lastName: text})}
          placeholder="Enter your last name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.phone}
          onChangeText={(text) => setPersonalInfo({...personalInfo, phone: text})}
          placeholder="Enter your phone number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.email}
          onChangeText={(text) => setPersonalInfo({...personalInfo, email: text})}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Create Password *</Text>
        <View>
          <TextInput
            style={styles.input}
            value={personalInfo.password}
            onChangeText={(text) => setPersonalInfo({...personalInfo, password: text})}
            placeholder="Create a secure password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={{ position: 'absolute', right: 12, top: 12 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Official Email</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.officialEmail}
          onChangeText={(text) => setPersonalInfo({...personalInfo, officialEmail: text})}
          placeholder="Enter official email address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>PAN Card Number</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.panNumber}
          onChangeText={(text) => setPersonalInfo({...personalInfo, panNumber: text})}
          placeholder="Enter PAN card number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>UAN Number</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.uanNumber}
          onChangeText={(text) => setPersonalInfo({...personalInfo, uanNumber: text})}
          placeholder="Enter UAN number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Aadhaar Card Number</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.aadhaarNumber}
          onChangeText={(text) => setPersonalInfo({...personalInfo, aadhaarNumber: text})}
          placeholder="Enter Aadhaar card number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Photo</Text>
        <View style={styles.fileInputContainer}>
          <TouchableOpacity style={styles.fileButton} onPress={handleImagePicker}>
            <Text style={styles.fileButtonText}>Choose</Text>
          </TouchableOpacity>
          <View style={styles.fileDisplayArea}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.fileText}>No file chosen</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderAddressDetailsForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Address Details</Text>
      
      <Text style={styles.sectionTitle}>Present Address</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Line 1 *</Text>
        <TextInput
          style={styles.input}
          value={addressDetails.presentAddress.addressLine1}
          onChangeText={(text) => setAddressDetails({
            ...addressDetails,
            presentAddress: {...addressDetails.presentAddress, addressLine1: text}
          })}
          placeholder="Enter street address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Line 2</Text>
        <TextInput
          style={styles.input}
          value={addressDetails.presentAddress.addressLine2}
          onChangeText={(text) => setAddressDetails({
            ...addressDetails,
            presentAddress: {...addressDetails.presentAddress, addressLine2: text}
          })}
          placeholder="Enter apartment, suite, etc."
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={addressDetails.presentAddress.city}
          onChangeText={(text) => setAddressDetails({
            ...addressDetails,
            presentAddress: {...addressDetails.presentAddress, city: text}
          })}
          placeholder="Enter city name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Country</Text>
        <CustomDropdown
          value={addressDetails.presentAddress.country || null}
          onChange={(value) =>
            setAddressDetails({
              ...addressDetails,
              presentAddress: {
                ...addressDetails.presentAddress,
                country: value,
                state: '',
              },
            })
          }
          placeholder="Select Country"
          options={[
            { label: 'Select Country', value: null },
            ...countryOptions.map((c) => ({ label: c, value: c })),
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select State</Text>
        <CustomDropdown
          value={addressDetails.presentAddress.state || null}
          onChange={(value) =>
            setAddressDetails({
              ...addressDetails,
              presentAddress: { ...addressDetails.presentAddress, state: value },
            })
          }
          placeholder="Select State"
          options={[
            { label: 'Select State', value: null },
            ...(statesByCountry[addressDetails.presentAddress.country] || []).map((s) => ({ label: s, value: s })),
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Postal Code</Text>
        <TextInput
          style={styles.input}
          value={addressDetails.presentAddress.postalCode}
          onChangeText={(text) => setAddressDetails({
            ...addressDetails,
            presentAddress: {...addressDetails.presentAddress, postalCode: text}
          })}
          placeholder="Enter postal/ZIP code"
        />
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() =>
          setAddressDetails((prev) => {
            const nextSame = !prev.sameAsPresent;
            const next = { ...prev, sameAsPresent: nextSame };
            if (nextSame) {
              next.permanentAddress = {
                ...prev.permanentAddress,
                addressLine1: prev.presentAddress.addressLine1,
                addressLine2: prev.presentAddress.addressLine2,
                city: prev.presentAddress.city,
                country: prev.presentAddress.country,
                state: prev.presentAddress.state,
                postalCode: prev.presentAddress.postalCode,
              };
            }
            return next;
          })
        }
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          addressDetails.sameAsPresent && { backgroundColor: '#8B0000', borderColor: '#8B0000', justifyContent: 'center', alignItems: 'center' }
        ]}>
          {addressDetails.sameAsPresent ? <Icon name="check" size={16} color="#fff" /> : null}
        </View>
        <Text style={styles.checkboxLabel}>Same as Present Address</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Permanent Address</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Line 1</Text>
        <TextInput
          style={styles.input}
          value={addressDetails.permanentAddress.addressLine1}
          onChangeText={(text) => setAddressDetails({
            ...addressDetails,
            permanentAddress: {...addressDetails.permanentAddress, addressLine1: text}
          })}
          placeholder="Enter street address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Line 2</Text>
        <TextInput
          style={styles.input}
          value={addressDetails.permanentAddress.addressLine2}
          onChangeText={(text) => setAddressDetails({
            ...addressDetails,
            permanentAddress: {...addressDetails.permanentAddress, addressLine2: text}
          })}
          placeholder="Enter apartment, suite, etc."
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={addressDetails.permanentAddress.city}
          onChangeText={(text) => setAddressDetails({
            ...addressDetails,
            permanentAddress: {...addressDetails.permanentAddress, city: text}
          })}
          placeholder="Enter city name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Country</Text>
        <CustomDropdown
          value={addressDetails.permanentAddress.country || null}
          onChange={(value) =>
            setAddressDetails({
              ...addressDetails,
              permanentAddress: {
                ...addressDetails.permanentAddress,
                country: value,
                state: '',
              },
            })
          }
          placeholder="Select Country"
          options={[
            { label: 'Select Country', value: null },
            ...countryOptions.map((c) => ({ label: c, value: c })),
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select State</Text>
        <CustomDropdown
          value={addressDetails.permanentAddress.state || null}
          onChange={(value) =>
            setAddressDetails({
              ...addressDetails,
              permanentAddress: { ...addressDetails.permanentAddress, state: value },
            })
          }
          placeholder="Select State"
          options={[
            { label: 'Select State', value: null },
            ...(statesByCountry[addressDetails.permanentAddress.country] || []).map((s) => ({ label: s, value: s })),
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Postal Code</Text>
        <TextInput
          style={styles.input}
          value={addressDetails.permanentAddress.postalCode}
          onChangeText={(text) => setAddressDetails({
            ...addressDetails,
            permanentAddress: {...addressDetails.permanentAddress, postalCode: text}
          })}
          placeholder="Enter postal/ZIP code"
        />
      </View>
    </View>
  );

  const renderProfessionalDetailsForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Professional Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Experience</Text>
        <TextInput
          style={styles.input}
          value={professionalDetails.experience}
          onChangeText={(text) => setProfessionalDetails({...professionalDetails, experience: text})}
          placeholder="Enter years of experience"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location</Text>
        <CustomDropdown
          value={professionalDetails.location || null}
          onChange={(value) => setProfessionalDetails({ ...professionalDetails, location: value })}
          placeholder="Select"
          options={[
            { label: 'Select', value: null },
            { label: 'Dehradun', value: 'Dehradun' },
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Source of Hire</Text>
        <CustomDropdown
          value={professionalDetails.sourceOfHire || null}
          onChange={(value) => setProfessionalDetails({ ...professionalDetails, sourceOfHire: value })}
          placeholder="Select"
          options={[
            { label: 'Select', value: null },
            { label: 'Referral', value: 'Referral' },
            { label: 'Job Portal', value: 'Job Portal' },
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={professionalDetails.title}
          onChangeText={(text) => setProfessionalDetails({...professionalDetails, title: text})}
          placeholder="Enter job title"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Skill Set</Text>
        <TextInput
          style={styles.input}
          value={professionalDetails.skillSet}
          onChangeText={(text) => setProfessionalDetails({...professionalDetails, skillSet: text})}
          placeholder="Enter your skills"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Current Salary</Text>
        <TextInput
          style={styles.input}
          value={professionalDetails.currentSalary}
          onChangeText={(text) => setProfessionalDetails({...professionalDetails, currentSalary: text})}
          placeholder="Enter current salary"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Highest Qualification</Text>
        <TextInput
          style={styles.input}
          value={professionalDetails.highestQualification}
          onChangeText={(text) => setProfessionalDetails({...professionalDetails, highestQualification: text})}
          placeholder="Enter highest qualification"
        />
      </View>

     <View style={styles.inputGroup}>
  <Text style={styles.label}>Department *</Text>
  <View style={styles.pickerContainer}>
    <CustomDropdown
      value={professionalDetails.department || null}
      onChange={(value) => setProfessionalDetails({ ...professionalDetails, department: value })}
      placeholder="Select Department"
      options={[
        { label: 'Select Department', value: null },
        { label: 'HR', value: 'HR' },
        { label: 'IT', value: 'IT' },
        { label: 'Finance', value: 'Finance' },
      ]}
    />
  </View>
</View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Additional Information</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={professionalDetails.additionalInfo}
          onChangeText={(text) => setProfessionalDetails({...professionalDetails, additionalInfo: text})}
          placeholder="Enter any additional information"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Offer Letter</Text>
        <View style={styles.fileInputContainer}>
          <TouchableOpacity style={styles.fileButton} onPress={handleDocumentPicker}>
            <Text style={styles.fileButtonText}>Choose</Text>
          </TouchableOpacity>
          <View style={styles.fileDisplayArea}>
            {documentInfo ? (
              <Text style={styles.fileText} numberOfLines={1}>
                {documentInfo.name}
              </Text>
            ) : (
              <Text style={styles.fileText}>No file chosen</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderEducationForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Education</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>School Name *</Text>
        <TextInput
          style={styles.input}
          value={education.schoolName}
          onChangeText={(text) => setEducation({...education, schoolName: text})}
          placeholder="Enter school/university name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Degree/Diploma *</Text>
        <TextInput
          style={styles.input}
          value={education.degree}
          onChangeText={(text) => setEducation({...education, degree: text})}
          placeholder="Enter degree or diploma"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Field(s) of Study</Text>
        <TextInput
          style={styles.input}
          value={education.fieldOfStudy}
          onChangeText={(text) => setEducation({...education, fieldOfStudy: text})}
          placeholder="Enter field of study"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Completion</Text>
        <TextInput
          style={styles.input}
          value={education.dateOfCompletion}
          onChangeText={(text) => setEducation({...education, dateOfCompletion: text})}
          placeholder="Enter completion date"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={education.additionalNotes}
          onChangeText={(text) => setEducation({...education, additionalNotes: text})}
          placeholder="Enter any additional notes"
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Education</Text>
      </TouchableOpacity>
    </View>
  );

  const renderExperienceForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Experience</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Occupation *</Text>
        <TextInput
          style={styles.input}
          value={experience.occupation}
          onChangeText={(text) => setExperience({...experience, occupation: text})}
          placeholder="Enter occupation"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Company</Text>
        <CustomDropdown
          value={experience.company || null}
          onChange={(value) => setExperience({ ...experience, company: value })}
          placeholder="Select Company"
          options={[
            { label: 'Select Company', value: null },
            { label: 'Tulyarth', value: 'Tulyarth' },
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Summary</Text>
        <TextInput
          style={styles.input}
          value={experience.summary}
          onChangeText={(text) => setExperience({...experience, summary: text})}
          placeholder="Enter role summary"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Duration</Text>
        <TextInput
          style={styles.input}
          value={experience.duration}
          onChangeText={(text) => setExperience({...experience, duration: text})}
          placeholder="Enter duration of work"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Currently Work Here</Text>
        <CustomDropdown
          value={experience.currentlyWorkHere || null}
          onChange={(value) => setExperience({ ...experience, currentlyWorkHere: value })}
          placeholder="Select"
          options={[
            { label: 'Select', value: null },
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Role</Text>
        <CustomDropdown
          value={experience.role || null}
          onChange={(value) => setExperience({ ...experience, role: value })}
          placeholder="Select"
          options={[
            { label: 'Select', value: null },
            { label: 'Team Leader', value: 'Team Leader' },
            { label: 'HR', value: 'HR' },
            { label: 'Employee', value: 'Employee' },
            { label: 'Admin', value: 'Admin' },
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Designation</Text>
        <CustomDropdown
          value={experience.designation || null}
          onChange={(value) => setExperience({ ...experience, designation: value })}
          placeholder="Select"
          options={[
            { label: 'Select', value: null },
            { label: 'CA', value: 'CA' },
            { label: 'HR', value: 'HR' },
            { label: 'Developer', value: 'Developer' },
          ]}
        />
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Experience</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActiveForm = (stepId) => {
    switch (stepId) {
      case 'employeeInfo':
        return renderEmployeeInfoForm();
      case 'addressDetails':
        return renderAddressDetailsForm();
      case 'professionalDetails':
        return renderProfessionalDetailsForm();
      case 'education':
        return renderEducationForm();
      case 'experience':
        return renderExperienceForm();
      default:
        return renderEmployeeInfoForm();
    }
  };


  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Add Details</Text>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / steps.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} / {steps.length}
            </Text>
          </View>

          {/* Step Indicators */}
          <View style={styles.stepIndicators}>
            {steps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.stepIndicator,
                  index === currentStep && styles.activeStepIndicator,
                  index < currentStep && styles.completedStepIndicator
                ]}
                onPress={() => handleStepChange(index)}
              >
                <Text style={[
                  styles.stepIndicatorText,
                  index === currentStep && styles.activeStepIndicatorText,
                  index < currentStep && styles.completedStepIndicatorText
                ]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form Content */}
        <View style={styles.formContent}>
          {renderActiveForm(steps[currentStep].id)}
        </View>

        {/* Navigation Buttons */}
        <View style={[
          styles.navigationContainer,
          { paddingBottom: (insets?.bottom || 0) + 16 }
        ]}>
          <TouchableOpacity 
            style={[
              styles.navButton, 
              styles.previousButton,
              currentStep === 0 && styles.disabledButton
            ]} 
            onPress={handlePrevious}
            disabled={currentStep === 0}
          >
            <Text style={[
              styles.previousButtonText,
              currentStep === 0 && styles.disabledButtonText
            ]}>Previous</Text>
          </TouchableOpacity>
          
          {currentStep === steps.length - 1 ? (
            <TouchableOpacity style={[styles.submitButton, adding && styles.disabledButton]} onPress={handleSubmit} disabled={adding}>
              <Text style={styles.submitButtonText}>{adding ? 'Submitting...' : 'Submit'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 15,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B0000',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeStepIndicator: {
    backgroundColor: '#8B0000',
  },
  completedStepIndicator: {
    backgroundColor: '#4CAF50',
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  activeStepIndicatorText: {
    color: '#fff',
  },
  completedStepIndicatorText: {
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // Space for scrollable navigation buttons
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
    
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  activeInput: {
    backgroundColor: '#e3f2fd',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 14,
    color: '#999',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#ffffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  picker: {
  backgroundColor: '#ffffff',
  color: '#000000',
},
  
  pickerIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -12,
  },
  // Custom dropdown styles
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValueText: {
    fontSize: 14,
    color: '#111',
    flex: 1,
    marginRight: 8,
  },
  dropdownPlaceholderText: {
    fontSize: 14,
    color: '#999',
    flex: 1,
    marginRight: 8,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 24,
    justifyContent: 'center',
  },
  dropdownCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    maxHeight: 360,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  dropdownItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#222',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 18,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  fileInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fileButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  fileButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fileDisplayArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  fileText: {
    fontSize: 14,
    color: '#999',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'android' ? 40 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#070707ff',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  navButton: {
    backgroundColor: '#8B0000',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  previousButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    elevation: 1,
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    opacity: 0.6,
    elevation: 0,
  },
  navButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  previousButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#8B0000',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddEmployee;
