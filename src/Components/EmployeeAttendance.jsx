import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const DEFAULT_AVATAR = require('../assests/images/avatar.jpg');
const { width } = Dimensions.get('window');

export default function EmployeeAttendance({ employee, onBack }) {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("--:--:--");
  const [checkOutTime, setCheckOutTime] = useState("--:--:--");
  const [checkedIn, setCheckedIn] = useState(false);
  const [totalHours, setTotalHours] = useState("0h 0m");
  const [hoursToday, setHoursToday] = useState("0.0");

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
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate total hours when check-out happens
  useEffect(() => {
    if (checkInTime !== "--:--:--" && checkOutTime !== "--:--:--") {
      const checkIn = new Date(`2000-01-01 ${checkInTime}`);
      const checkOut = new Date(`2000-01-01 ${checkOutTime}`);
      const diff = checkOut - checkIn;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTotalHours(`${hours}h ${minutes}m`);
    }
  }, [checkInTime, checkOutTime]);

  // Calculate hours today for Work Hours card - updates in real-time
  useEffect(() => {
    const updateHours = () => {
      if (checkInTime !== "--:--:--" && checkOutTime !== "--:--:--") {
        // Both check-in and check-out are done
        try {
          const checkInParts = checkInTime.split(/[: ]/);
          const checkOutParts = checkOutTime.split(/[: ]/);
          const checkInHour = parseInt(checkInParts[0]);
          const checkInMin = parseInt(checkInParts[1]);
          const checkOutHour = parseInt(checkOutParts[0]);
          const checkOutMin = parseInt(checkOutParts[1]);
          const checkInAmPm = checkInParts[2] || '';
          const checkOutAmPm = checkOutParts[2] || '';
          
          let checkIn24 = checkInHour;
          let checkOut24 = checkOutHour;
          
          if (checkInAmPm === 'PM' && checkInHour !== 12) checkIn24 += 12;
          if (checkInAmPm === 'AM' && checkInHour === 12) checkIn24 = 0;
          if (checkOutAmPm === 'PM' && checkOutHour !== 12) checkOut24 += 12;
          if (checkOutAmPm === 'AM' && checkOutHour === 12) checkOut24 = 0;
          
          const checkInTotal = checkIn24 * 60 + checkInMin;
          const checkOutTotal = checkOut24 * 60 + checkOutMin;
          const diffMinutes = checkOutTotal - checkInTotal;
          const hours = diffMinutes / 60;
          setHoursToday(hours > 0 ? hours.toFixed(1) : "0.0");
        } catch (e) {
          setHoursToday("0.0");
        }
      } else if (checkInTime !== "--:--:--" && checkedIn) {
        // Checked in but not checked out - calculate from check-in to now
        try {
          const now = new Date();
          const checkInParts = checkInTime.split(/[: ]/);
          const checkInHour = parseInt(checkInParts[0]);
          const checkInMin = parseInt(checkInParts[1]);
          const checkInAmPm = checkInParts[2] || '';
          
          let checkIn24 = checkInHour;
          if (checkInAmPm === 'PM' && checkInHour !== 12) checkIn24 += 12;
          if (checkInAmPm === 'AM' && checkInHour === 12) checkIn24 = 0;
          
          const checkInTotal = checkIn24 * 60 + checkInMin;
          const nowTotal = now.getHours() * 60 + now.getMinutes();
          const diffMinutes = nowTotal - checkInTotal;
          const hours = diffMinutes / 60;
          setHoursToday(hours > 0 ? hours.toFixed(1) : "0.0");
        } catch (e) {
          setHoursToday("0.0");
        }
      } else {
        setHoursToday("0.0");
      }
    };

    updateHours();
    
    // Update every second if checked in (for real-time updates)
    let interval;
    if (checkedIn && checkInTime !== "--:--:--") {
      interval = setInterval(updateHours, 1000); // Update every second
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkInTime, checkOutTime, checkedIn, currentTime]);

  // Check-in logic
  const handleCheckIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", { 
      hour12: true, 
      hour: "2-digit", 
      minute: "2-digit" 
    });
    setCheckInTime(timeString);
    setCheckedIn(true);
    setCheckOutTime("--:--:--");
    setTotalHours("0h 0m");
  };

  // Check-out logic
  const handleCheckOut = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", { 
      hour12: true, 
      hour: "2-digit", 
      minute: "2-digit" 
    });
    setCheckOutTime(timeString);
    setCheckedIn(false);
  };

  // Get employee data
  const employeeName = employee 
    ? `${employee.employee_first_name || ''} ${employee.employee_last_name || ''}`.trim() || 'Employee'
    : 'John Doe';
  const employeeId = employee?.employee_id || 'N/A';
  const employeeDepartment = employee?.employee_department || 'Information Technology';
  const employeePhoto = employee?.employee_photo
    ? { uri: `https://hr.tulyarthdigiweb.com/uploads/${employee.employee_photo}` }
    : DEFAULT_AVATAR;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        {onBack && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#F26A1B" />
          </TouchableOpacity>
        )}

        {/* Page Title */}
        <View style={styles.headerSection}>
          <Icon name="access-time" size={32} color="#F26A1B" />
          <Text style={styles.title}>Employee Attendance</Text>
          <Text style={styles.subtitle}>{currentDate || new Date().toLocaleDateString("en-GB", { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>

        {/* Work Hours Card with Purple Gradient */}
        <LinearGradient
          colors={['#8B5CF6', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.workHoursCard}
        >
          <View style={styles.workHoursContent}>
            <Text style={styles.workHoursTitle}>WORK HOURS</Text>
            <Text style={styles.workHoursValue}>{hoursToday}</Text>
            <Text style={styles.workHoursSubtitle}>Hours Today</Text>
            
            <View style={styles.workHoursDivider} />
            
            <View style={styles.workHoursDetails}>
              <View style={styles.workHoursRow}>
                <Text style={styles.workHoursLabel}>Start Time</Text>
                <Text style={styles.workHoursDetailValue}>
                  {checkInTime !== "--:--:--" ? checkInTime : "---"}
                </Text>
              </View>
              <View style={styles.workHoursRow}>
                <Text style={styles.workHoursLabel}>End Time</Text>
                <Text style={styles.workHoursDetailValue}>
                  {checkOutTime !== "--:--:--" ? checkOutTime : "---"}
                </Text>
              </View>
              <View style={styles.workHoursRow}>
                <Text style={styles.workHoursLabel}>Status</Text>
                <Text style={styles.workHoursStatus}>
                  {checkedIn ? "In Progress" : checkOutTime !== "--:--:--" ? "Completed" : "Not Started"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Current Time Card with Gradient */}
        <LinearGradient
          colors={['#F26A1B', '#FF8C42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.timeCard}
        >
          <View style={styles.timeCardContent}>
            <Icon name="schedule" size={40} color="#FFFFFF" />
            <Text style={styles.timeLabel}>CURRENT TIME</Text>
            <Text style={styles.time}>{currentTime}</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
        </LinearGradient>

        {/* Employee Info Card */}
        <View style={styles.card}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image source={employeePhoto} style={styles.avatar} />
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: checkedIn ? '#10B981' : '#6B7280' }]} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.employeeName}>{employeeName}</Text>
              <View style={styles.idRow}>
                <Icon name="badge" size={16} color="#6B7280" />
                <Text style={styles.employeeId}>ID: {employeeId}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#E0E7FF' }]}>
                <Icon name="business" size={20} color="#4F46E5" />
              </View>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{employeeDepartment}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: '#E6FFF3' }]}>
                <Icon name="calendar-today" size={20} color="#10B981" />
              </View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {new Date().toLocaleDateString("en-GB", { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Attendance Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="today" size={24} color="#F26A1B" />
            <Text style={styles.sectionTitle}>Today's Attendance</Text>
          </View>

          <View style={styles.attendanceGrid}>
            <View style={styles.attendanceItem}>
              <View style={[styles.attendanceIconContainer, { backgroundColor: '#E6FFF3' }]}>
                <Icon name="login" size={24} color="#10B981" />
              </View>
              <Text style={styles.attendanceLabel}>Check In</Text>
              <Text style={[styles.attendanceValue, checkInTime !== "--:--:--" && styles.attendanceValueActive]}>
                {checkInTime}
              </Text>
            </View>

            <View style={styles.attendanceItem}>
              <View style={[styles.attendanceIconContainer, { backgroundColor: '#FFF4E6' }]}>
                <Icon name="logout" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.attendanceLabel}>Check Out</Text>
              <Text style={[styles.attendanceValue, checkOutTime !== "--:--:--" && styles.attendanceValueActive]}>
                {checkOutTime}
              </Text>
            </View>
          </View>

          {/* Total Hours */}
          {checkOutTime !== "--:--:--" && (
            <View style={styles.totalHoursContainer}>
              <Icon name="timer" size={20} color="#F26A1B" />
              <Text style={styles.totalHoursLabel}>Total Hours: </Text>
              <Text style={styles.totalHoursValue}>{totalHours}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.checkInButton,
                checkedIn && styles.buttonDisabled
              ]}
              disabled={checkedIn}
              onPress={handleCheckIn}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={checkedIn ? ['#D1D5DB', '#9CA3AF'] : ['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Icon name="login" size={22} color="#FFFFFF" />
                <Text style={styles.buttonText}>CHECK IN</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.checkOutButton,
                !checkedIn && styles.buttonDisabled
              ]}
              disabled={!checkedIn}
              onPress={handleCheckOut}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={!checkedIn ? ['#D1D5DB', '#9CA3AF'] : ['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Icon name="logout" size={22} color="#FFFFFF" />
                <Text style={styles.buttonText}>CHECK OUT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: checkedIn ? '#10B981' : '#6B7280' }]} />
            <Text style={styles.statusText}>
              {checkedIn ? 'Currently Checked In' : 'Not Checked In'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  timeCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#F26A1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  timeCardContent: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 12,
    opacity: 0.9,
  },
  time: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    letterSpacing: 1,
  },
  date: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 8,
    opacity: 0.9,
    textAlign: 'center',
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#F26A1B',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  profileInfo: {
    flex: 1,
  },
  employeeName: {
    fontWeight: "700",
    fontSize: 20,
    color: "#111827",
    marginBottom: 6,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeId: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#111827",
    marginLeft: 10,
  },
  attendanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  attendanceItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  attendanceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendanceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: '600',
  },
  attendanceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  attendanceValueActive: {
    color: "#111827",
    fontSize: 18,
  },
  totalHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  totalHoursLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    fontWeight: '600',
  },
  totalHoursValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F26A1B",
    marginLeft: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  checkInButton: {
    marginBottom: 0,
  },
  checkOutButton: {
    marginTop: 0,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: "#111827",
  },
  // Work Hours Card Styles
  workHoursCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  workHoursContent: {
    width: '100%',
  },
  workHoursTitle: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.9,
  },
  workHoursValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  workHoursSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 20,
    opacity: 0.9,
  },
  workHoursDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  workHoursDetails: {
    gap: 16,
  },
  workHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workHoursLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    opacity: 0.9,
  },
  workHoursDetailValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  workHoursStatus: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
