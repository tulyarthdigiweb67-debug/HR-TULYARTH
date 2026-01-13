import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeAttendanceView } from '../redux/slices/employeeAttendanceViewSlice';

const { width } = Dimensions.get('window');

export default function MyAttendance() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const scrollViewRef = useRef(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  
  // Get attendance data from Redux
  const { items: apiAttendanceData, loading } = useSelector(
    (state) => state.employeeAttendanceView || { items: [], loading: false }
  );

  // Generate months list - starts from Jan 2025, extends to current month and beyond
  const generateMonths = () => {
    const months = [];
    const currentDate = new Date();
    const startDate = new Date(2025, 0, 1); // January 2025
    
    // Generate from Jan 2025 to current month + 3 months ahead
    let date = new Date(startDate);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1);
    
    while (date <= endDate) {
      months.push(new Date(date));
      date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }
    
    return months;
  };

  const months = generateMonths();

  // Fetch attendance data on mount and when month changes
  useEffect(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1; // API expects 1-12
    dispatch(fetchEmployeeAttendanceView({ year, month }));
  }, [selectedMonth, dispatch]);

  // Scroll to current month on mount
  useEffect(() => {
    setTimeout(() => {
      scrollToMonth(new Date());
    }, 100);
  }, []);

  // Modal animation
  useEffect(() => {
    if (modalVisible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  // Format month for display
  const formatMonth = (date) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Check if month is selected
  const isSelected = (date) => {
    return (
      date.getMonth() === selectedMonth.getMonth() &&
      date.getFullYear() === selectedMonth.getFullYear()
    );
  };

  // Handle month selection
  const handleMonthSelect = (date) => {
    setSelectedMonth(date);
  };

  // Navigate to previous months
  const handlePrevious = () => {
    const newDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    setSelectedMonth(newDate);
    scrollToMonth(newDate);
  };

  // Navigate to next months
  const handleNext = () => {
    const newDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    setSelectedMonth(newDate);
    scrollToMonth(newDate);
  };

  // Scroll to selected month
  const scrollToMonth = (date) => {
    const index = months.findIndex(
      (m) => m.getMonth() === date.getMonth() && m.getFullYear() === date.getFullYear()
    );
    if (index !== -1 && scrollViewRef.current) {
      const scrollX = index * 112;
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  };

  // Process API data and merge with all days in month
  const getAttendanceData = () => {
    const data = [];
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Get number of days in the selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create a map of API data by date
    const apiDataMap = {};
    if (Array.isArray(apiAttendanceData)) {
      apiAttendanceData.forEach((record) => {
        if (record.date) {
          const recordDate = new Date(record.date);
          if (
            recordDate.getMonth() === month &&
            recordDate.getFullYear() === year
          ) {
            const dayKey = recordDate.getDate();
            apiDataMap[dayKey] = record;
          }
        }
      });
    }
    
    // Generate data for all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const apiRecord = apiDataMap[day];
      
      let status = 'ABSENT';
      let checkIn = '—';
      let checkOut = '—';
      let totalHours = '—';
      let timeIn = null;
      let timeOut = null;
      
      if (apiRecord) {
        timeIn = apiRecord.timeIn || apiRecord.a_time_in;
        timeOut = apiRecord.timeOut || apiRecord.a_time_out;
        const recordStatus = apiRecord.status || apiRecord.a_status;
        
        // Determine status: 'p' = present, 'a' = absent, 'h' = holiday
        if (recordStatus === 'p' || recordStatus === 'P') {
          status = 'PRESENT';
        } else if (recordStatus === 'h' || recordStatus === 'H') {
          status = 'HOLIDAY';
        } else {
          status = 'ABSENT';
        }
        
        // Format check-in time
        if (timeIn) {
          try {
            const timeInDate = new Date(`2000-01-01T${timeIn}`);
            checkIn = timeInDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });
          } catch (e) {
            checkIn = timeIn;
          }
        }
        
        // Format check-out time
        if (timeOut) {
          try {
            const timeOutDate = new Date(`2000-01-01T${timeOut}`);
            checkOut = timeOutDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });
          } catch (e) {
            checkOut = timeOut;
          }
          
          // Calculate total hours if both times available
          if (timeIn && timeOut) {
            try {
              const inDate = new Date(`2000-01-01T${timeIn}`);
              const outDate = new Date(`2000-01-01T${timeOut}`);
              let diffMs = outDate - inDate;
              if (diffMs < 0) {
                diffMs += 24 * 3600000; // Add 24 hours if checkout is next day
              }
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              totalHours = `${diffHours}h ${diffMinutes}m`;
            } catch (e) {
              totalHours = '—';
            }
          }
        }
      }
      
      data.push({
        id: day,
        date: date,
        status: status,
        checkIn: checkIn,
        checkOut: checkOut,
        totalHours: totalHours,
        timeIn: timeIn,
        timeOut: timeOut,
        rawData: apiRecord,
      });
    }
    
    // Sort by date (newest first)
    return data.reverse();
  };

  const attendanceData = useMemo(() => getAttendanceData(), [selectedMonth, apiAttendanceData]);

  // Format date for card
  const formatDateCard = (date) => {
    const day = date.getDate();
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      day: day < 10 ? `0${day}` : `${day}`,
      month: monthNames[date.getMonth()],
    };
  };

  // Filter attendance data for selected month
  const filteredAttendance = attendanceData.filter((record) => {
    return (
      record.date.getMonth() === selectedMonth.getMonth() &&
      record.date.getFullYear() === selectedMonth.getFullYear()
    );
  });

  // Handle card click
  const handleCardPress = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedRecord(null);
    });
  };

  // Get status icon and color - Simple PhonePe Style
  const getStatusConfig = (status) => {
    switch (status) {
      case 'PRESENT':
        return {
          icon: 'check-circle',
          color: '#10B981',
          bgColor: '#D1FAE5',
          gradient: ['#F2FFF9', '#D1FAE5'],
          iconName: 'check-circle',
          iconLibrary: 'MaterialIcons',
        };
      case 'ABSENT':
        return {
          icon: 'calendar-today',
          color: '#E95420', // Navbar orange color
          bgColor: '#FFE5D9', // Light orange
          gradient: ['#FFF8F3', '#FFE5D9'],
          iconName: 'calendar-today',
          iconLibrary: 'MaterialIcons',
        };
      case 'HOLIDAY':
        return {
          icon: 'celebration',
          color: '#F97316', // Orange shade
          bgColor: '#FFF4E6', // Light orange
          gradient: ['#FFFDF5', '#FFEED7'],
          iconName: 'celebration',
          iconLibrary: 'MaterialIcons',
        };
      default:
        return {
          icon: 'calendar-today',
          color: '#E95420',
          bgColor: '#FFE5D9',
          gradient: ['#FFF8F3', '#FFE5D9'],
          iconName: 'calendar-today',
          iconLibrary: 'MaterialIcons',
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <View style={styles.barChartContainer}>
                <View style={[styles.bar, styles.barGreen]} />
                <View style={[styles.bar, styles.barBlue]} />
                <View style={[styles.bar, styles.barRed]} />
              </View>
            </View>
            <Text style={styles.headerTitle}>Employee Attendance</Text>
          </View>
        </View>

        {/* Month Selector Card */}
        <View style={styles.monthSelectorCard}>
          <View style={styles.monthSelectorContent}>
            {/* Previous Button */}
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePrevious}
              activeOpacity={0.7}
            >
              <Icon name="chevron-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Scrollable Month Buttons */}
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthScrollContainer}
              style={styles.monthScrollView}
            >
              {months.map((month, index) => (
                <TouchableOpacity
                  key={`${month.getFullYear()}-${month.getMonth()}-${index}`}
                  style={[
                    styles.monthButton,
                    isSelected(month) && styles.monthButtonActive,
                  ]}
                  onPress={() => handleMonthSelect(month)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.monthButtonText,
                      isSelected(month) && styles.monthButtonTextActive,
                    ]}
                  >
                    {formatMonth(month)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Next Button */}
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Icon name="chevron-right" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Attendance Records */}
        <View style={styles.attendanceContainer}>
          {loading ? (
            <View style={styles.loadingState}>
              <Icon name="hourglass-empty" size={48} color="#9CA3AF" />
              <Text style={styles.loadingText}>Loading attendance...</Text>
            </View>
          ) : filteredAttendance.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="event-busy" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No attendance records found</Text>
              <Text style={styles.emptyStateSubtext}>for {formatMonth(selectedMonth)}</Text>
            </View>
          ) : (
            <View style={styles.attendanceGrid}>
          {filteredAttendance.map((record, index) => {
                const dateCard = formatDateCard(record.date);
                const statusConfig = getStatusConfig(record.status);
            // Define a set of very light pastel gradients for cards (app-style)
            const pastelGradients = [
              ['#FDFBFF', '#E5F0FF'], // very light blue
              ['#FFFDF7', '#FFEFD9'], // very light orange
              ['#FDFDFB', '#E9FCE5'], // very light green
              ['#FFF9FD', '#FFE5F5'], // very light pink
              ['#F8FDFF', '#E4F7FF'], // very light cyan
            ];
            const cardGradient =
              pastelGradients[index % pastelGradients.length];
                return (
                  <TouchableOpacity
                    key={record.id}
                    style={styles.attendanceCard}
                    onPress={() => handleCardPress(record)}
                    activeOpacity={0.7}
                  >
                    {/* Simple Icon - PhonePe Style */}
                    <LinearGradient
                  colors={cardGradient}
                      style={styles.simpleIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {/* Date Number at Top */}
                      <Text style={[styles.iconDateText, { color: statusConfig.color }]}>
                        {dateCard.day}
                      </Text>
                      
                      {/* Simple Icon - No Circle */}
                      <Icon 
                        name={statusConfig.iconName} 
                        size={28} 
                        color={statusConfig.color} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              {selectedRecord && (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderContent}>
                      <View style={styles.modalDateContainer}>
                        <Text style={styles.modalDateDay}>
                          {formatDateCard(selectedRecord.date).day}
                        </Text>
                        <Text style={styles.modalDateMonth}>
                          {formatDateCard(selectedRecord.date).month}
                        </Text>
                        <Text style={styles.modalDateYear}>
                          {selectedRecord.date.getFullYear()}
                        </Text>
                      </View>
                      <View style={styles.modalHeaderRight}>
                        {(() => {
                          const statusConfig = getStatusConfig(selectedRecord.status);
                          return (
                            <View style={[styles.modalStatusBadge, { backgroundColor: statusConfig.bgColor }]}>
                              {statusConfig.iconLibrary === 'MaterialCommunityIcons' ? (
                                <MaterialCommunityIcons 
                                  name={statusConfig.iconName} 
                                  size={18} 
                                  color={statusConfig.color} 
                                />
                              ) : (
                                <Icon name={statusConfig.iconName} size={18} color={statusConfig.color} />
                              )}
                              <Text style={[styles.modalStatusText, { color: statusConfig.color }]}>
                                {selectedRecord.status}
                              </Text>
                            </View>
                          );
                        })()}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={closeModal}
                      activeOpacity={0.7}
                    >
                      <Icon name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Modal Body */}
                  <ScrollView
                    style={styles.modalBody}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Check In Card - Advanced */}
                    <View style={styles.detailCard}>
                      <View style={[styles.detailCardIcon, { backgroundColor: '#D1FAE5', borderWidth: 2, borderColor: '#10B981' }]}>
                        <MaterialCommunityIcons name="clock-in" size={24} color="#059669" />
                      </View>
                      <View style={styles.detailCardContent}>
                        <Text style={styles.detailCardLabel}>Check In</Text>
                        <Text style={[styles.detailCardValue, styles.checkInValue]}>
                          {selectedRecord.checkIn}
                        </Text>
                      </View>
                    </View>

                    {/* Check Out Card - Advanced */}
                    <View style={styles.detailCard}>
                      <View style={[styles.detailCardIcon, { backgroundColor: '#FFE5D9', borderWidth: 2, borderColor: '#E95420' }]}>
                        <MaterialCommunityIcons name="clock-out" size={24} color="#E95420" />
                      </View>
                      <View style={styles.detailCardContent}>
                        <Text style={styles.detailCardLabel}>Check Out</Text>
                        <Text style={[
                          styles.detailCardValue,
                          selectedRecord.checkOut === '—' ? styles.pendingValue : styles.checkOutValue
                        ]}>
                          {selectedRecord.checkOut}
                        </Text>
                      </View>
                    </View>

                    {/* Total Hours Card - Advanced */}
                    <View style={styles.detailCard}>
                      <View style={[styles.detailCardIcon, { backgroundColor: '#FEF3C7', borderWidth: 2, borderColor: '#FBBF24' }]}>
                        <MaterialCommunityIcons name="timer-sand" size={24} color="#D97706" />
                      </View>
                      <View style={styles.detailCardContent}>
                        <Text style={styles.detailCardLabel}>Total Working Hours</Text>
                        <Text style={[
                          styles.detailCardValue,
                          selectedRecord.totalHours === '—' ? styles.pendingValue : styles.totalHoursValue
                        ]}>
                          {selectedRecord.totalHours}
                        </Text>
                      </View>
                    </View>

                    {/* Additional Info */}
                    {selectedRecord.rawData && (
                      <View style={styles.additionalInfoCard}>
                        <Text style={styles.additionalInfoTitle}>Additional Information</Text>
                        {selectedRecord.rawData.created_at && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Recorded At:</Text>
                            <Text style={styles.infoValue}>
                              {new Date(selectedRecord.rawData.created_at).toLocaleString('en-US', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </ScrollView>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 32,
  },
  // Header Card Styles
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    width: 32,
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  bar: {
    width: 8,
    borderRadius: 2,
  },
  barGreen: {
    height: 28,
    backgroundColor: '#10B981',
  },
  barBlue: {
    height: 24,
    backgroundColor: '#3B82F6',
  },
  barRed: {
    height: 20,
    backgroundColor: '#EF4444',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  // Month Selector Card Styles
  monthSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  monthSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  monthScrollView: {
    flex: 1,
    marginHorizontal: 12,
  },
  monthScrollContainer: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  monthButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 6,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonActive: {
    backgroundColor: '#374151',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  monthButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Attendance Records Styles
  attendanceContainer: {
    flex: 1,
  },
  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
    marginTop: 20,
    paddingHorizontal: 8,
  },
  attendanceCard: {
    marginBottom: 12,
  },
  simpleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    position: 'relative',
  },
  iconDateText: {
    position: 'absolute',
    top: 6,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDateContainer: {
    alignItems: 'flex-start',
  },
  modalDateDay: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 36,
  },
  modalDateMonth: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginTop: 2,
  },
  modalDateYear: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalHeaderRight: {
    alignItems: 'flex-end',
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  modalBody: {
    padding: 20,
    paddingTop: 16,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  detailCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  detailCardContent: {
    flex: 1,
  },
  detailCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  detailCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  checkInValue: {
    color: '#10B981',
    fontWeight: '800',
  },
  checkOutValue: {
    color: '#E95420', // Navbar orange
    fontWeight: '800',
  },
  totalHoursValue: {
    color: '#F97316', // Orange shade
    fontWeight: '800',
  },
  pendingValue: {
    color: '#F97316',
    fontSize: 16,
  },
  additionalInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  additionalInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
});

