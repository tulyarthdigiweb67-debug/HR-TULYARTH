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
import { fetchNotificationById, updateNotification } from '../redux/slices/editNotificationSlice';

export default function EditNotification({ notification, onBack, onUpdate }) {
  const dispatch = useDispatch();
  const { loading, item, updating, updateResult, updateError } = useSelector(state => state.editNotification || {});
  
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Fetch latest notification details by id
  useEffect(() => {
    const id = notification?.n_id ?? notification?.id;
    if (id != null) {
      console.log('[EDIT_NOTIFICATION] Dispatch fetchNotificationById with n_id:', id);
      dispatch(fetchNotificationById({ n_id: id }));
    }
  }, [dispatch, notification]);

  // When item is loaded, initialize form
  useEffect(() => {
    if (item) {
      setSubject(item.n_subject ?? item.subject ?? '');
      setDescription(item.n_description ?? item.description ?? '');

      const raw = item.n_date ?? item.date;
      if (raw) {
        // Accept formats like '2025-11-04 16:11:39', '2025-11-04', or '04-11-2025'
        const dateOnly = String(raw).split(' ')[0];
        let d = null;
        const partsDash = dateOnly.split('-');
        if (partsDash.length === 3) {
          if (partsDash[0].length === 4) {
            // yyyy-mm-dd
            d = new Date(parseInt(partsDash[0]), parseInt(partsDash[1]) - 1, parseInt(partsDash[2]));
          } else {
            // dd-mm-yyyy
            d = new Date(parseInt(partsDash[2]), parseInt(partsDash[1]) - 1, parseInt(partsDash[0]));
          }
        }
        if (d && !isNaN(d.getTime())) {
          setDate(d);
        }
      }
    }
  }, [item]);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  // UI friendly date: dd-mm-yyyy
  const formattedDate = () => {
    if (!date) return 'dd-mm-yyyy';
    const d = date;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // API friendly date: yyyy-mm-dd HH:mm:ss
  const formattedApiDate = () => {
    if (!date) return '';
    const d = date;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd} 00:00:00`;
  };

  const handleUpdateNotification = () => {
    // Validation
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter notification subject');
      console.log('[EDIT_NOTIFICATION] Validation failed: Subject is required');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter notification description');
      console.log('[EDIT_NOTIFICATION] Validation failed: Description is required');
      return;
    }

    if (!date) {
      Alert.alert('Error', 'Please select a date');
      console.log('[EDIT_NOTIFICATION] Validation failed: Date is required');
      return;
    }

    const n_id = notification?.n_id ?? notification?.id ?? item?.n_id ?? item?.id;
    const payload = {
      n_id,
      n_subject: subject.trim(),
      n_description: description.trim(),
      n_date: formattedApiDate(),
    };
    console.log('[EDIT_NOTIFICATION] Dispatch updateNotification with:', payload);
    dispatch(updateNotification(payload))
      .unwrap()
      .then((res) => {
        Alert.alert('Success', 'Notification updated successfully!', [
          { text: 'OK', onPress: () => { if (onBack) onBack(); } },
        ]);
      })
      .catch((err) => {
        Alert.alert('Error', err?.message || 'Failed to update notification. Please try again.');
      });
  };

  // Rich text editor toolbar actions
  const handleFormatBold = () => {
    console.log('[EDIT_NOTIFICATION] Bold format');
    // TODO: Implement rich text formatting
  };

  const handleFormatItalic = () => {
    console.log('[EDIT_NOTIFICATION] Italic format');
    // TODO: Implement rich text formatting
  };

  const handleFormatUnderline = () => {
    console.log('[EDIT_NOTIFICATION] Underline format');
    // TODO: Implement rich text formatting
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.mainHeading}>Edit Notification</Text>
          <View style={styles.placeholder} />
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

              {/* Description Field with Rich Text Editor */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Icon name="description" size={18} color="#4B5563" />
                  <Text style={styles.label}>Description</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                
                {/* Rich Text Editor Toolbar */}
                <View style={styles.editorToolbar}>
                  <TouchableOpacity 
                    style={styles.toolButton} 
                    activeOpacity={0.6}
                    onPress={handleFormatBold}>
                    <Icon name="format-bold" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity 
                    style={styles.toolButton} 
                    activeOpacity={0.6}
                    onPress={handleFormatItalic}>
                    <Icon name="format-italic" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity 
                    style={styles.toolButton} 
                    activeOpacity={0.6}
                    onPress={handleFormatUnderline}>
                    <Icon name="format-underlined" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-strikethrough" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-size" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-color-text" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-color-fill" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-list-bulleted" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-list-numbered" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-align-left" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-align-center" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-align-right" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="format-align-justify" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSpacer} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="link" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="link-off" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="fullscreen" size={18} color="#374151" />
                  </TouchableOpacity>
                  <View style={styles.toolSeparator} />
                  <TouchableOpacity style={styles.toolButton} activeOpacity={0.6}>
                    <Icon name="code" size={18} color="#374151" />
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

              {/* Update Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.button, updating && styles.buttonDisabled]}
                onPress={handleUpdateNotification}
                disabled={updating}>
                <LinearGradient
                  colors={updating ? ['#9CA3AF', '#6B7280'] : ['#E95420', '#D14A1C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}>
                  <Icon name="update" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>
                    {updating ? 'Updating...' : 'Update Notification'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Info Note */}
              <View style={styles.infoNote}>
                <Icon name="info-outline" size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  This notification will be updated and sent to all employees
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
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
  editorToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#E5E7EB',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  toolButton: {
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: 'transparent',
  },
  toolSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
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
    minHeight: 180,
    maxHeight: 250,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '400',
    lineHeight: 22,
  },
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

