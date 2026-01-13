import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeAttendanceView, resetEmployeeAttendanceView } from '../redux/slices/employeeAttendanceViewSlice';

const { width } = Dimensions.get('window');

export default function EmployeeAttendanceView({ employee, onBack }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const scrollViewRef = useRef(null);
  const monthScrollRef = useRef(null);
  
  // Redux
  const dispatch = useDispatch();
  const { loading, error, items, raw } = useSelector((state) => state.employeeAttendanceView);

  // Fetch attendance data from API
  useEffect(() => {
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Component mounted / month changed, fetching data...');
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Employee prop:', employee);
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Employee type:', typeof employee);
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Employee keys:', employee ? Object.keys(employee) : 'null');
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] employee.id:', employee?.id);
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] employee.employee_id:', employee?.employee_id);
    
    // Get employee_id from employee prop - employee_id comes first as that's the field name in API
    const employeeId = employee?.employee_id || employee?.id || employee;
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Final Employee ID:', employeeId);
    
    // Attach selected month filters so API scopes response correctly
    const year = selectedMonth?.getFullYear();
    const month = selectedMonth?.getMonth() + 1; // API expects 1-12
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Selected year/month:', year, month);
    
    if (employeeId && year && month) {
      // Call API with employee_id (required parameter)
      dispatch(fetchEmployeeAttendanceView({
        employee_id: employeeId,
        year,
        month,
      }));
    } else {
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Missing params, skipping API call');
    }

    // Cleanup on unmount
    return () => {
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Component unmounting, resetting state...');
      dispatch(resetEmployeeAttendanceView());
    };
  }, [dispatch, employee, selectedMonth]);

  // Log when data changes
  useEffect(() => {
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Loading:', loading);
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Error:', error);
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Items:', items);
    console.log('[EMPLOYEE_ATTENDANCE_VIEW] Raw Response:', raw);
  }, [loading, error, items, raw]);

  // Generate months list dynamically from Jan 2025 to current month + 3 months buffer
  const generateMonths = () => {
    const monthList = [];
    const startDate = new Date(2025, 0, 1);
    const currentDate = new Date();
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1);
    
    let iter = new Date(startDate);
    while (iter <= endDate) {
      monthList.push(new Date(iter));
      iter = new Date(iter.getFullYear(), iter.getMonth() + 1, 1);
    }
    return monthList;
  };

  const months = generateMonths();

  // Scroll to selected month on mount
  useEffect(() => {
    // Scroll to selected month after a short delay to ensure layout is complete
    setTimeout(() => {
      scrollToMonth(selectedMonth);
    }, 100);
  }, []);

  // Format month for display
  const formatMonth = (date) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Get number of days in selected month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Format time exactly as API provides (HH:MM:SS)
  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return timeStr.trim();
  };

  // Calculate total hours between timeIn and timeOut
  const calculateTotalHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return '--';
    
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    
    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;
    let diffMinutes = outMinutes - inMinutes;
    
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // handle times that roll past midnight
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours} h ${minutes} m`;
  };

  // Get month name from month number (1-12)
  const getMonthName = (monthNum) => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return monthNames[monthNum - 1] || '';
  };

  // Filter and transform API data for selected month
  const getAttendanceData = () => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    if (items.length > 0) {
      // Filter items for selected month
      const selectedYear = selectedMonth.getFullYear();
      const selectedMonthNum = selectedMonth.getMonth() + 1; // 1-12
      
      const filteredData = items
        .filter((item) => item.year === selectedYear && item.month === selectedMonthNum)
        .map((item) => ({
          day: item.day,
          month: getMonthName(item.month),
          isPresent: item.status === 'p',
          isHalfDay: item.status === 'h' && item.timeIn && item.timeOut,
          isHoliday: item.status === 'h' && !(item.timeIn && item.timeOut),
          isAbsent: item.status === 'a',
          status: item.status,
          checkIn: formatTime(item.timeIn),
          checkOut: formatTime(item.timeOut),
          totalHours: calculateTotalHours(item.timeIn, item.timeOut),
          date: item.date,
        }))
        .sort((a, b) => b.day - a.day); // Sort by day descending (newest first)
      
      console.log('[EMPLOYEE_ATTENDANCE_VIEW] Filtered data for', selectedMonthNum, '/', selectedYear, ':', filteredData.length, 'records');
      return filteredData;
    }
    
    // Return empty array if no API data
    return [];
  };

  const attendanceData = getAttendanceData();
  
  console.log('[EMPLOYEE_ATTENDANCE_VIEW] Using attendance data:', attendanceData.length, 'records');

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

  // Check if previous button should be disabled (at Jan 2025)
  const canGoPrevious = () => {
    return !(selectedMonth.getFullYear() === 2025 && selectedMonth.getMonth() === 0);
  };

  // Check if next button should be disabled (at Nov 2025)
  const canGoNext = () => {
    return !(selectedMonth.getFullYear() === 2025 && selectedMonth.getMonth() === 10);
  };

  // Navigate to previous months
  const handlePrevious = () => {
    if (!canGoPrevious()) return;
    const newDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    setSelectedMonth(newDate);
    scrollToMonth(newDate);
  };

  // Navigate to next months
  const handleNext = () => {
    if (!canGoNext()) return;
    const newDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    setSelectedMonth(newDate);
    scrollToMonth(newDate);
  };

  // Scroll to selected month
  const scrollToMonth = (date) => {
    const index = months.findIndex(
      (m) => m.getMonth() === date.getMonth() && m.getFullYear() === date.getFullYear()
    );
    if (index !== -1 && monthScrollRef.current) {
      // Calculate approximate scroll position (each button is ~100px wide + 12px margin)
      const scrollX = index * 112;
      monthScrollRef.current.scrollTo({ x: scrollX, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Single ScrollView for entire page */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
        nestedScrollEnabled={true}
      >
        {/* Header Card with Back Button */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            {/* Back Button - Pill Style */}
            {onBack && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.8}
              >
                <Icon name="keyboard-backspace" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            <View style={styles.iconContainer}>
              <View style={styles.barChartContainer}>
                <View style={[styles.bar, styles.barRed]} />
                <View style={[styles.bar, styles.barGreen]} />
                <View style={[styles.bar, styles.barBlue]} />
              </View>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>Employee Attendance</Text>
            
            {/* Loading Indicator */}
            {loading && (
              <ActivityIndicator size="small" color="#F26A1B" style={{ marginLeft: 10 }} />
            )}
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorCard}>
            <Icon name="error-outline" size={20} color="#EF4444" />
            <Text style={styles.errorText}>
              {error.message || 'Failed to load attendance data'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                const employeeId = employee?.employee_id || employee?.id || employee;
                  const year = selectedMonth?.getFullYear();
                  const month = selectedMonth?.getMonth() + 1;
                console.log('[EMPLOYEE_ATTENDANCE_VIEW] Retry clicked, Employee ID:', employeeId);
                  if (employeeId && year && month) {
                    dispatch(fetchEmployeeAttendanceView({ employee_id: employeeId, year, month }));
                }
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Month Selector Card */}
        <View style={styles.monthSelectorCard}>
          <View style={styles.monthSelectorContent}>
            {/* Previous Button */}
            <TouchableOpacity
              style={[
                styles.navButton,
                !canGoPrevious() && styles.navButtonDisabled
              ]}
              onPress={handlePrevious}
              activeOpacity={0.7}
              disabled={!canGoPrevious()}
            >
              <Icon name="chevron-left" size={24} color={canGoPrevious() ? "#FFFFFF" : "#9CA3AF"} />
            </TouchableOpacity>

            {/* Scrollable Month Buttons */}
            <ScrollView
              ref={monthScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthScrollContainer}
              style={styles.monthScrollView}
              nestedScrollEnabled={true}
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
              style={[
                styles.navButton,
                !canGoNext() && styles.navButtonDisabled
              ]}
              onPress={handleNext}
              activeOpacity={0.7}
              disabled={!canGoNext()}
            >
              <Icon name="chevron-right" size={24} color={canGoNext() ? "#FFFFFF" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Attendance Cards Grid */}
        <View style={styles.attendanceGrid}>
          {attendanceData.length === 0 && !loading && (
            <View style={styles.noDataContainer}>
              <Icon name="event-note" size={48} color="#D1D5DB" />
              <Text style={styles.noDataText}>No attendance records for this month</Text>
            </View>
          )}
          {attendanceData.map((item, index) => {
            const showTimingDetails = item.isPresent || item.isHalfDay;
            return (
            <View key={`${item.month}-${item.day}-${index}`} style={styles.attendanceCard}>
              {/* Date Badge */}
              <View style={[
                styles.dateBadge, 
                item.isHoliday && styles.dateBadgeHoliday,
                item.isHalfDay && styles.dateBadgeHalfDay
              ]}>
                <Text style={styles.dayNumber}>{item.day}</Text>
                <Text style={styles.monthText}>{item.month}</Text>
              </View>

              {/* Status Badge */}
              <View style={[
                styles.statusBadge, 
                item.isPresent && styles.statusPresent,
                item.isHalfDay && styles.statusHalfDay,
                item.isAbsent && styles.statusAbsent,
                item.isHoliday && styles.statusHoliday,
              ]}>
                <Icon 
                  name={
                    item.isPresent
                      ? "check"
                      : item.isHalfDay
                      ? "timelapse"
                      : item.isHoliday
                      ? "festival"
                      : "close"
                  } 
                  size={12} 
                  color="#FFFFFF" 
                />
                <Text style={styles.statusText}>
                  {item.isPresent
                    ? 'PRESENT'
                    : item.isHalfDay
                    ? 'HALF DAY'
                    : item.isHoliday
                    ? 'HOLIDAY'
                    : 'ABSENT'}
                </Text>
              </View>

              {item.isHalfDay && (
                <View style={styles.halfDayBanner}>
                  <Icon name="warning-amber" size={16} color="#92400E" />
                  <Text style={styles.halfDayText}>Half day logged</Text>
                </View>
              )}

              {showTimingDetails && (
                <>
                  {/* Check In */}
                  <View style={styles.timeRow}>
                    <Text style={styles.timeLabel}>Check In</Text>
                    <Text style={[
                      styles.timeValue,
                      item.isHalfDay && styles.halfDayTimeValue
                    ]}>
                      {item.checkIn}
                    </Text>
                  </View>

                  {/* Check Out */}
                  <View style={styles.timeRow}>
                    <Text style={styles.timeLabel}>Check Out</Text>
                    <Text style={[
                      styles.timeValue, 
                      styles.checkOutTime,
                      item.isHalfDay && styles.halfDayTimeValue
                    ]}>
                      {item.checkOut}
                    </Text>
                  </View>

                  {/* Total Time */}
                  <View style={styles.totalTimeContainer}>
                    <Icon name="access-time" size={16} color="#F26A1B" />
                    <Text style={styles.totalTimeLabel}>Total:</Text>
                    <Text style={[
                      styles.totalTimeValue,
                      item.isHalfDay && styles.halfDayTimeValue
                    ]}>
                      {item.totalHours}
                    </Text>
                  </View>
                </>
              )}

              {item.isHoliday && (
                <View style={styles.holidayContainer}>
                  <Icon name="celebration" size={32} color="#8B5CF6" />
                  <Text style={styles.holidayText}>Holiday</Text>
                </View>
              )}

              {item.isAbsent && !item.isHoliday && (
                <View style={styles.absentContainer}>
                  <Icon name="event-busy" size={32} color="#E5E7EB" />
                  <Text style={styles.absentText}>No attendance</Text>
                </View>
              )}
            </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Main ScrollView for entire page
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Header Card Styles
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F26A1B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 3,
    shadowColor: '#F26A1B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconContainer: {
    marginRight: 10,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 28,
    width: 28,
    justifyContent: 'space-between',
    paddingHorizontal: 1,
  },
  bar: {
    width: 7,
    borderRadius: 2,
  },
  barRed: {
    height: 16,
    backgroundColor: '#EF4444',
  },
  barGreen: {
    height: 24,
    backgroundColor: '#10B981',
  },
  barBlue: {
    height: 20,
    backgroundColor: '#3B82F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  // Month Selector Card Styles
  monthSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
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
    width: 36,
    height: 36,
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
  navButtonDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  monthScrollView: {
    flex: 1,
    marginHorizontal: 8,
  },
  monthScrollContainer: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonActive: {
    backgroundColor: '#F26A1B',
    elevation: 3,
    shadowColor: '#F26A1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  monthButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Attendance Grid
  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attendanceCard: {
    width: (width - 48) / 2, // 2 cards per row with spacing
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dateBadge: {
    backgroundColor: '#F26A1B',
    borderRadius: 12,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#F26A1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  monthText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusPresent: {
    backgroundColor: '#10B981',
  },
  statusAbsent: {
    backgroundColor: '#EF4444',
  },
  statusHalfDay: {
    backgroundColor: '#F59E0B',
  },
  statusHoliday: {
    backgroundColor: '#8B5CF6',
  },
  dateBadgeHoliday: {
    backgroundColor: '#8B5CF6',
  },
  dateBadgeHalfDay: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  halfDayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 6,
    marginBottom: 10,
    gap: 6,
  },
  halfDayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  halfDayTimeValue: {
    color: '#B45309',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  checkOutTime: {
    color: '#F26A1B',
  },
  totalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3E7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  totalTimeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  totalTimeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F26A1B',
    marginLeft: 4,
  },
  absentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  absentText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 6,
  },
  holidayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  holidayText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B5CF6',
    marginTop: 6,
  },
  noDataContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 12,
  },
  // Error Card Styles
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 10,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
