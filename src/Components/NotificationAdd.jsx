import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { storeNotification, resetStoreState } from '../redux/slices/notificationSlice';

export default function NotificationAdd() {
  const dispatch = useDispatch();
  const { storing, storeError, storeResult } = useSelector((state) => state.notification);
  
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const formattedDate = () => {
    if (!date) return 'Select date';
    const d = date;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleSendNotification = () => {
    // Validation
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter notification subject');
      console.log('[NOTIFICATION_ADD] Validation failed: Subject is required');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter notification description');
      console.log('[NOTIFICATION_ADD] Validation failed: Description is required');
      return;
    }

    console.log('[NOTIFICATION_ADD] Sending notification with:', {
      n_subject: subject,
      n_description: description,
      date: date,
    });

    // Dispatch the API call
    dispatch(
      storeNotification({
        n_subject: subject.trim(),
        n_description: description.trim(),
      })
    );
  };

  // Handle success/error after API call
  useEffect(() => {
    if (storeResult) {
      console.log('[NOTIFICATION_ADD] Success:', storeResult);
      Alert.alert('Success', 'Notification sent successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSubject('');
            setDescription('');
            setDate(null);
            dispatch(resetStoreState());
          },
        },
      ]);
    }
    
    if (storeError) {
      console.log('[NOTIFICATION_ADD] Error:', storeError);
      Alert.alert(
        'Error',
        storeError?.message || 'Failed to send notification. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              dispatch(resetStoreState());
            },
          },
        ]
      );
    }
  }, [storeResult, storeError, dispatch]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.mainHeading}>Add Notification</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notification Details</Text>
          </View>
          {/* Subject Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Icon name="title" size={18} color="#4B5563" />
              <Text style={styles.label}>Subject</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === 'subject' && styles.inputWrapperFocused,
              ]}>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter notification subject"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                onFocus={() => setFocusedInput('subject')}
                onBlur={() => setFocusedInput(null)}
              />
              {subject.length > 0 && (
                <Icon name="check-circle" size={20} color="#10B981" />
              )}
            </View>
          </View>

          {/* Date Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Icon name="event" size={18} color="#4B5563" />
              <Text style={styles.label}>Date</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.dateInput,
                focusedInput === 'date' && styles.inputWrapperFocused,
              ]}
              onPress={() => {
                setShowPicker(true);
                setFocusedInput('date');
              }}
              activeOpacity={0.8}>
              <View style={styles.dateContent}>
                <Icon name="calendar-today" size={18} color={date ? "#4B5563" : "#9CA3AF"} />
                <Text
                  style={[
                    styles.dateText,
                    !date && styles.datePlaceholder,
                  ]}>
                  {formattedDate()}
                </Text>
              </View>
              <Icon name="arrow-forward-ios" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Description Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Icon name="description" size={18} color="#4B5563" />
              <Text style={styles.label}>Description</Text>
              <Text style={styles.required}>*</Text>
            </View>
            
            {/* Editor Toolbar */}
            <View style={styles.editorToolbar}>
              <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}>
                <Icon name="format-bold" size={18} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.toolSeparator} />
              <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}>
                <Icon name="format-italic" size={18} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.toolSeparator} />
              <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}>
                <Icon name="format-underlined" size={18} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.toolSeparator} />
              <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}>
                <Icon name="format-align-left" size={18} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.toolSeparator} />
              <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}>
                <Icon name="code" size={18} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.toolSpacer} />
              <View style={styles.charCount}>
                <Text style={styles.charCountText}>
                  {description.length} / 500
                </Text>
              </View>
            </View>
            
            <View
              style={[
                styles.textareaWrapper,
                focusedInput === 'description' && styles.inputWrapperFocused,
              ]}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={styles.textarea}
                placeholder="Write your notification description here..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                maxLength={500}
                onFocus={() => setFocusedInput('description')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.button, storing && styles.buttonDisabled]}
            onPress={handleSendNotification}
            disabled={storing}>
            <LinearGradient
              colors={storing ? ['#9CA3AF', '#6B7280'] : ['#E95420', '#D14A1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}>
              <Icon name="send" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>
                {storing ? 'Sending...' : 'Send Notification'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Icon name="info-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              This notification will be sent to all employees
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onChangeDate}
          minimumDate={new Date()}
        />
      )}
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
  // Header Styles
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
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
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
    color: '#374151',
    letterSpacing: 0.2,
  },
  // Card Styles
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
  // Input Group Styles
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  required: {
    fontSize: 15,
    color: '#E95420',
    marginLeft: 4,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: '#E95420',
    backgroundColor: '#FFF',
    shadowColor: '#E95420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 0,
  },
  // Date Input Styles
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
    marginLeft: 12,
  },
  datePlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  // Editor Toolbar Styles
  editorToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#E5E7EB',
  },
  toolButton: {
    padding: 6,
    borderRadius: 6,
  },
  toolSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  toolSpacer: {
    flex: 1,
  },
  charCount: {
    paddingHorizontal: 8,
  },
  charCountText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Textarea Styles
  textareaWrapper: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textarea: {
    minHeight: 160,
    maxHeight: 200,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '400',
    lineHeight: 22,
  },
  // Button Styles
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
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
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  // Info Note Styles
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#E95420',
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
