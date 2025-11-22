import React, { useState, useRef, useEffect } from 'react';
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

export default function EmployeeAttendanceView({ employee, onBack }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date(2025, 10, 1)); // Default to Nov 2025
  const scrollViewRef = useRef(null);

  // Generate months list from Jan 2025 to Nov 2025
  const generateMonths = () => {
    const months = [];
    
    // Generate from January 2025 (month 0) to November 2025 (month 10)
    for (let month = 0; month <= 10; month++) {
      const date = new Date(2025, month, 1);
      months.push(date);
    }
    
    return months;
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
    if (index !== -1 && scrollViewRef.current) {
      // Calculate approximate scroll position (each button is ~100px wide + 12px margin)
      const scrollX = index * 112;
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        {onBack && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#F26A1B" />
          </TouchableOpacity>
        )}

        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <View style={styles.barChartContainer}>
                <View style={[styles.bar, styles.barRed]} />
                <View style={[styles.bar, styles.barGreen]} />
                <View style={[styles.bar, styles.barBlue]} />
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

        {/* Attendance Content Area - You can add your attendance data here */}
        <View style={styles.attendanceContent}>
          <Text style={styles.selectedMonthText}>
            Viewing attendance for: {formatMonth(selectedMonth)}
          </Text>
          {/* Add your attendance list/calendar here */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  barRed: {
    height: 20,
    backgroundColor: '#EF4444',
  },
  barGreen: {
    height: 28,
    backgroundColor: '#10B981',
  },
  barBlue: {
    height: 24,
    backgroundColor: '#3B82F6',
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
  navButtonDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
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
    backgroundColor: '#F26A1B',
    elevation: 3,
    shadowColor: '#F26A1B',
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
  // Attendance Content Area
  attendanceContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectedMonthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

