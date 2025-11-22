import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function MyAttendance() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const scrollViewRef = useRef(null);

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

  // Scroll to current month on mount
  useEffect(() => {
    setTimeout(() => {
      scrollToMonth(new Date());
    }, 100);
  }, []);

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

  // Generate attendance data for all days in selected month
  const getAttendanceData = () => {
    const data = [];
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Get number of days in the selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Generate attendance for all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      // Generate random check-in times (9 AM to 11 AM)
      const checkInHours = Math.floor(Math.random() * 3) + 9;
      const checkInMinutes = Math.floor(Math.random() * 60);
      const checkInTime = new Date(year, month, day, checkInHours, checkInMinutes);
      
      // Format check-in time
      const checkInFormatted = checkInTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      
      // Randomly decide if checked out (70% chance)
      const hasCheckedOut = Math.random() > 0.3;
      
      let checkOut = '—';
      let totalHours = '—';
      
      if (hasCheckedOut) {
        const checkOutHours = checkInHours + Math.floor(Math.random() * 4) + 6; // 6-9 hours later
        const checkOutMinutes = Math.floor(Math.random() * 60);
        const checkOutTime = new Date(year, month, day, checkOutHours, checkOutMinutes);
        
        checkOut = checkOutTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        
        // Calculate total hours
        const diffMs = checkOutTime - checkInTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        totalHours = `${diffHours}h ${diffMinutes}m`;
      }
      
      data.push({
        id: day,
        date: date,
        status: 'PRESENT',
        checkIn: checkInFormatted,
        checkOut: checkOut,
        totalHours: totalHours,
      });
    }
    
    // Sort by date (newest first)
    return data.reverse();
  };

  const attendanceData = useMemo(() => getAttendanceData(), [selectedMonth]);

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
          {filteredAttendance.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="event-busy" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No attendance records found</Text>
              <Text style={styles.emptyStateSubtext}>for {formatMonth(selectedMonth)}</Text>
            </View>
          ) : (
            <View style={styles.attendanceGrid}>
              {filteredAttendance.map((record) => {
                const dateCard = formatDateCard(record.date);
                return (
                  <View key={record.id} style={styles.attendanceCard}>
                    {/* Date Indicator */}
                    <View style={styles.dateIndicator}>
                      <Text style={styles.dateDay}>{dateCard.day}</Text>
                      <Text style={styles.dateMonth}>{dateCard.month}</Text>
                    </View>

                    {/* Status Badge */}
                    <View style={styles.statusBadge}>
                      <Icon name="check-circle" size={12} color="#10B981" />
                      <Text style={styles.statusText}>{record.status}</Text>
                    </View>

                    {/* Check In/Out Details */}
                    <View style={styles.timeDetails}>
                      <View style={styles.timeRow}>
                        <Text style={styles.timeLabel}>Check In</Text>
                        <Text style={styles.checkInTime}>{record.checkIn}</Text>
                      </View>
                      <View style={styles.timeRow}>
                        <Text style={styles.timeLabel}>Check Out</Text>
                        <Text style={[
                          styles.checkOutTime,
                          record.checkOut === '—' && styles.pendingTime
                        ]}>
                          {record.checkOut}
                        </Text>
                      </View>
                    </View>

                    {/* Total Hours */}
                    <View style={styles.totalHoursContainer}>
                      <Icon name="access-time" size={12} color="#F26A1B" />
                      <Text style={styles.totalLabel}>Total:</Text>
                      <Text style={[
                        styles.totalValue,
                        record.totalHours === '—' && styles.pendingTime
                      ]}>
                        {record.totalHours}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 20,
  },
  attendanceCard: {
    width: (width - 40) / 2, // Two cards per row with smaller padding
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  dateIndicator: {
    backgroundColor: '#F26A1B',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    minHeight: 55,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFF3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 4,
  },
  timeDetails: {
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  checkInTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  checkOutTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  pendingTime: {
    color: '#F26A1B',
  },
  totalHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  totalValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 2,
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
});

