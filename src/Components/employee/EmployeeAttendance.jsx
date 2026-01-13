import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { postEmployeeCheckIn, postEmployeeCheckOut, postAttendanceDashboard } from "../../redux/slices/employeeAttendanceSlice";

const { width } = Dimensions.get('window');

export default function EmployeeAttendance({ employee, onBack, employeeName = "Arun Kumar" }) {
  const dispatch = useDispatch();
  const {
    loading: attendanceLoading,
    error: attendanceError,
    lastCheckInResponse,
    lastCheckOutResponse,
    dashboardLoading,
    dashboardError,
    dashboardData,
  } = useSelector((state) => state.employeeAttendance || {});
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("--:--:--");
  const [checkOutTime, setCheckOutTime] = useState("--:--:--");
  const [checkedIn, setCheckedIn] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [shiftType, setShiftType] = useState("Home");
  const [workingHours, setWorkingHours] = useState("00:00:00");
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    console.log('[EMPLOYEE_ATTENDANCE] Mounted');
    console.log('[EMPLOYEE_ATTENDANCE] Employee prop:', employee);

    // Extract employeeId using same logic as check-in/out
    const baseEmployee = employee?.data || employee || {};
    const employeeId =
      baseEmployee.employee_id ||
      baseEmployee.id ||
      baseEmployee.employeeid ||
      baseEmployee.emp_id ||
      null;

    console.log('[EMPLOYEE_ATTENDANCE] Derived employeeId for dashboard:', employeeId);

    if (employeeId) {
      console.log('[EMPLOYEE_ATTENDANCE] Dispatching postAttendanceDashboard with:', {
        employeeId,
      });
      dispatch(postAttendanceDashboard({ employeeId }));
    } else {
      console.log('[EMPLOYEE_ATTENDANCE] No employee_id found, skipping attendance dashboard API call');
    }
  }, [employee, dispatch]);

  // Log dashboard API response / error for debugging
  useEffect(() => {
    if (dashboardLoading) {
      console.log('[EMPLOYEE_ATTENDANCE] Dashboard loading...');
    }
    if (dashboardData) {
      console.log('[EMPLOYEE_ATTENDANCE] Dashboard data:', dashboardData);
    }
    if (dashboardError) {
      console.log('[EMPLOYEE_ATTENDANCE] Dashboard error:', dashboardError);
    }
  }, [dashboardLoading, dashboardData, dashboardError]);

  // Pulse animation for check-in button
  useEffect(() => {
    if (!checkedIn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [checkedIn, pulseAnim]);

  // Update live time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { 
          hour12: true, 
          hour: "2-digit", 
          minute: "2-digit",
          second: "2-digit"
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-GB", { 
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate working hours
  useEffect(() => {
    if (checkInTime !== "--:--:--" && checkedIn) {
      // Live calculation while checked in
      const interval = setInterval(() => {
        try {
          const now = new Date();
          const checkInParts = checkInTime.split(/[: ]/).filter(part => part !== '');
          let checkInHour = parseInt(checkInParts[0]);
          const checkInMin = parseInt(checkInParts[1]);
          const checkInAmPm = checkInParts[checkInParts.length - 1] || '';
          
          if (checkInAmPm === 'PM' && checkInHour !== 12) checkInHour += 12;
          if (checkInAmPm === 'AM' && checkInHour === 12) checkInHour = 0;
          
          const checkInDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), checkInHour, checkInMin, 0);
          const diffMs = now.getTime() - checkInDate.getTime();
          
          if (diffMs > 0) {
            const hours = Math.floor(diffMs / 3600000);
            const minutes = Math.floor((diffMs % 3600000) / 60000);
            const seconds = Math.floor((diffMs % 60000) / 1000);
            setWorkingHours(
              `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
          }
        } catch (e) {
          setWorkingHours("00:00:00");
        }
      }, 1000);
      return () => clearInterval(interval);
    } else if (checkOutTime !== "--:--:--" && checkInTime !== "--:--:--") {
      // Calculate final hours when checked out
      try {
        const checkInParts = checkInTime.split(/[: ]/).filter(part => part !== '');
        const checkOutParts = checkOutTime.split(/[: ]/).filter(part => part !== '');
        
        let checkInHour = parseInt(checkInParts[0]);
        const checkInMin = parseInt(checkInParts[1]);
        const checkInAmPm = checkInParts[checkInParts.length - 1] || '';
        
        let checkOutHour = parseInt(checkOutParts[0]);
        const checkOutMin = parseInt(checkOutParts[1]);
        const checkOutAmPm = checkOutParts[checkOutParts.length - 1] || '';
        
        if (checkInAmPm === 'PM' && checkInHour !== 12) checkInHour += 12;
        if (checkInAmPm === 'AM' && checkInHour === 12) checkInHour = 0;
        if (checkOutAmPm === 'PM' && checkOutHour !== 12) checkOutHour += 12;
        if (checkOutAmPm === 'AM' && checkOutHour === 12) checkOutHour = 0;
        
        const now = new Date();
        const checkInDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), checkInHour, checkInMin, 0);
        const checkOutDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), checkOutHour, checkOutMin, 0);
        
        // Handle case where checkout is next day
        let diffMs = checkOutDate.getTime() - checkInDate.getTime();
        if (diffMs < 0) {
          diffMs += 24 * 3600000; // Add 24 hours if checkout is next day
        }
        
        if (diffMs > 0) {
          const hours = Math.floor(diffMs / 3600000);
          const minutes = Math.floor((diffMs % 3600000) / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);
          setWorkingHours(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        }
      } catch (e) {
        setWorkingHours("00:00:00");
      }
    } else if (checkInTime === "--:--:--") {
      // Reset when no check in
      setWorkingHours("00:00:00");
    }
  }, [checkInTime, checkOutTime, checkedIn]);

  // Check-in logic
  const handleCheckIn = () => {
    console.log('[EMPLOYEE_ATTENDANCE] Handle Check-In clicked');
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", { 
      hour12: true, 
      hour: "2-digit", 
      minute: "2-digit",
      second: "2-digit"
    });
    setCheckInTime(timeString);
    setCheckedIn(true);
    setCheckOutTime("--:--:--");
    setWorkingHours("00:00:00");
    setOnBreak(false);

    // Backend expects employee_id and selected_time (HH:MM) as form-data
    // Login response ka actual employee object aksar data ke andar hota hai
    const baseEmployee = employee?.data || employee || {};
    const employeeId =
      baseEmployee.employee_id ||
      baseEmployee.id ||
      baseEmployee.employeeid ||
      baseEmployee.emp_id ||
      null;

    if (!employeeId) {
      console.log('[EMPLOYEE_ATTENDANCE] No employee_id found, skipping API call');
      return;
    }

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const selectedTime = `${hours}:${minutes}`;

    console.log('[EMPLOYEE_ATTENDANCE] Dispatching postEmployeeCheckIn with:', {
      employeeId,
      selectedTime,
    });
    dispatch(postEmployeeCheckIn({ employeeId, selectedTime }));
  };

  // Check-out logic
  const handleCheckOut = () => {
    console.log('[EMPLOYEE_ATTENDANCE] Handle Check-Out clicked');
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", { 
      hour12: true, 
      hour: "2-digit", 
      minute: "2-digit",
      second: "2-digit"
    });
    setCheckOutTime(timeString);
    setCheckedIn(false);
    setOnBreak(false);

    // Backend expects employee_id and selected_time (HH:MM) as form-data
    const baseEmployee = employee?.data || employee || {};
    const employeeId =
      baseEmployee.employee_id ||
      baseEmployee.id ||
      baseEmployee.employeeid ||
      baseEmployee.emp_id ||
      null;

    if (!employeeId) {
      console.log('[EMPLOYEE_ATTENDANCE] No employee_id found for check-out, skipping API call');
      return;
    }

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const selectedTime = `${hours}:${minutes}`;

    console.log('[EMPLOYEE_ATTENDANCE] Dispatching postEmployeeCheckOut with:', {
      employeeId,
      selectedTime,
    });
    dispatch(postEmployeeCheckOut({ employeeId, selectedTime }));
  };

  // Break logic
  const handleBreak = () => {
    setOnBreak(!onBreak);
  };

  // Format time for display
  const formatDisplayTime = (time) => {
    if (time === "--:--:--") return "---";
    const parts = time.split(' ');
    if (parts.length > 1) {
      const timeNoSeconds = parts[0].split(':').slice(0, 2).join(':');
      return `${timeNoSeconds} ${parts[1]}`;
    }
    return time;
  };

  // Attendance summary status card helpers
  const getAttendanceStatus = () => {
    // 1) Try to use backend status from attendance-dashboard API if available
    // Postman response sample:
    // {
    //   "success": true,
    //   "attendance": {
    //     "a_status": "p"  // p = present, a = absent
    //   }
    // }
    let backendStatusRaw =
      dashboardData?.attendance?.a_status ||
      dashboardData?.status ||
      dashboardData?.data?.status ||
      dashboardData?.data?.attendance_status ||
      dashboardData?.attendance_status ||
      null;

    if (typeof backendStatusRaw === 'string') {
      const normalized = backendStatusRaw.trim().toLowerCase();

      // Handle both short codes and full words
      if (normalized === 'p' || normalized === 'present') {
        return { label: 'Present', color: '#22C55E' }; // green
      }
      if (normalized === 'a' || normalized === 'absent') {
        return { label: 'Absent', color: '#EF4444' }; // red
      }
    }

    // 2) Fallback to local UI-based status if backend does not give clear present/absent
    if (checkInTime === "--:--:--" && checkOutTime === "--:--:--") {
      return { label: "Not Started", color: "#F97316" };
    }

    if (checkInTime !== "--:--:--" && checkOutTime === "--:--:--") {
      return { label: onBreak ? "On Break" : "In Progress", color: "#FACC15" };
    }

    if (checkInTime !== "--:--:--" && checkOutTime !== "--:--:--") {
      return { label: "Completed", color: "#22C55E" };
    }

    return { label: "Pending", color: "#F97316" };
  };

  const { label: statusLabel, color: statusColor } = getAttendanceStatus();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FAFAFA', '#F5F5F5', '#FFFFFF']}
        style={styles.backgroundGradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            {onBack && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="arrow-left" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Attendance</Text>
          </View>

          {/* Date & Time Cards - PhonePe Style */}
          <View style={styles.dateTimeRow}>
            <View style={styles.smallCard}>
              <View style={[styles.smallCardIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons name="calendar-outline" size={14} color="#F59E0B" />
              </View>
              <Text style={styles.smallCardValue}>{currentDate || "3 May, 2025"}</Text>
              <Text style={styles.smallCardLabel}>Date</Text>
            </View>
            <View style={styles.smallCard}>
              <View style={[styles.smallCardIconContainer, { backgroundColor: '#FCE7F3' }]}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#EC4899" />
              </View>
              <Text style={styles.smallCardValue}>{currentTime || "8:45 AM"}</Text>
              <Text style={styles.smallCardLabel}>Current Time</Text>
            </View>
          </View>


          {/* Check In/Out Time Cards */}
          <View style={styles.timeCardsRow}>
            <View style={styles.timeCard}>
              <View style={[styles.timeCardIcon, { backgroundColor: '#D1FAE5' }]}>
                <MaterialCommunityIcons name="login" size={14} color="#10B981" />
              </View>
              <Text style={styles.timeCardValue}>
                {checkInTime !== "--:--:--" ? formatDisplayTime(checkInTime) : "10:00 AM"}
              </Text>
              <Text style={styles.timeCardLabel}>Check In</Text>
            </View>
            <View style={styles.timeCard}>
              <View style={[styles.timeCardIcon, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons name="logout" size={14} color="#EF4444" />
              </View>
              <Text style={styles.timeCardValue}>
                {checkOutTime !== "--:--:--" ? formatDisplayTime(checkOutTime) : "05:00 PM"}
              </Text>
              <Text style={styles.timeCardLabel}>Check Out</Text>
            </View>
          </View>

          {/* Shift Info Card - Small */}
          <View style={styles.shiftInfoCard}>
            <Text style={styles.shiftTypeLabel}>GENERAL SHIFT</Text>
            <Text style={styles.currentTimeDisplay}>{currentTime || "09:50:22 AM"}</Text>
          </View>

          {/* Check In & Check Out Cards - Side by Side */}
          <View style={styles.checkInOutRow}>
            {!checkedIn ? (
              <Animated.View style={[styles.checkInOutCard, styles.checkInCard, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                  style={styles.checkInOutButton}
                  onPress={handleCheckIn}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkInOutIconContainer, { backgroundColor: '#D1FAE5' }]}>
                    <MaterialCommunityIcons name="fingerprint" size={18} color="#10B981" />
                  </View>
                  <Text style={styles.checkInOutLabel}>Check In</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <TouchableOpacity
                style={[styles.checkInOutCard, styles.checkOutCard]}
                onPress={handleCheckOut}
                activeOpacity={0.8}
              >
                <View style={[styles.checkInOutIconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
                </View>
                <Text style={styles.checkInOutLabel}>Check Out</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Working Hours Card - Small */}
          <View style={styles.workingHoursCard}>
            <View style={[styles.workingHoursIconContainer, { backgroundColor: '#FFF4E6' }]}>
              <MaterialCommunityIcons name="timer-outline" size={16} color="#F97316" />
            </View>
            <View style={styles.workingHoursContent}>
              <Text style={styles.workingHoursLabel}>Total Working Hours</Text>
              <Text style={styles.workingHoursValue}>
                {checkInTime !== "--:--:--" ? workingHours : "00:00:00"}
              </Text>
              {checkInTime !== "--:--:--" && checkOutTime !== "--:--:--" && (
                <Text style={styles.workingHoursSubtext}>
                  {checkInTime !== "--:--:--" ? formatDisplayTime(checkInTime) : "---"} to {checkOutTime !== "--:--:--" ? formatDisplayTime(checkOutTime) : "---"}
                </Text>
              )}
            </View>
          </View>

          {/* Attendance Summary - Separate compact cards */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryHeading}>Today&apos;s Attendance</Text>

            <View style={styles.summaryCardsRow}>
              {/* Start Time */}
              <View style={styles.summaryCard}>
                <View style={[styles.summaryIconWrapper, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#0284C7" />
                </View>
                <Text style={styles.summaryLabel}>Start Time</Text>
                <Text style={styles.summaryValue}>
                  {checkInTime !== "--:--:--" ? formatDisplayTime(checkInTime) : "--:-- --"}
                </Text>
              </View>

              {/* End Time */}
              <View style={styles.summaryCard}>
                <View style={[styles.summaryIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialCommunityIcons name="clock-end" size={16} color="#D97706" />
                </View>
                <Text style={styles.summaryLabel}>End Time</Text>
                <Text style={styles.summaryValue}>
                  {checkOutTime !== "--:--:--" ? formatDisplayTime(checkOutTime) : "--:-- --"}
                </Text>
              </View>

              {/* Status */}
              <View style={styles.summaryCard}>
                <View style={[styles.summaryIconWrapper, { backgroundColor: '#DCFCE7' }]}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={statusColor} />
                </View>
                <Text style={styles.summaryLabel}>Status</Text>
                <Text style={[styles.summaryValue, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  smallCardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  smallCardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  smallCardLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  shiftSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  shiftToggleContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  shiftToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  shiftToggleActive: {
    backgroundColor: '#FFF4E6',
  },
  shiftToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  shiftToggleTextActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  timeCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timeCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeCardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  timeCardLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  shiftInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  shiftTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  currentTimeDisplay: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  checkInOutRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  checkInOutCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  checkInCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  checkOutCard: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  checkInOutButton: {
    width: '100%',
    alignItems: 'center',
  },
  checkInOutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkInOutLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  workingHoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  workingHoursIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workingHoursContent: {
    flex: 1,
  },
  workingHoursLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  workingHoursValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F97316',
    marginTop: 2,
  },
  workingHoursSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 4,
  },
  summarySection: {
    marginTop: 25,      // push section a bit lower
    marginBottom: 28,
  },
  summaryHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  summaryCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  summaryIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  summaryRow: { // keep if referenced somewhere else
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
