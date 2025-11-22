import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EmployeeAttendanceMark({ onBack }) {
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [workHours, setWorkHours] = useState(0.0);
  const [status, setStatus] = useState('Not Marked');
  const [currentDate, setCurrentDate] = useState('');
  const [isClocking, setIsClocking] = useState(false);

  // Animation refs
  const clockAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Format current date
  useEffect(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(today.toLocaleDateString('en-US', options));
  }, []);

  // Continuous pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Rotating border animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(borderAnim, {
        toValue: 360,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const formatTime = (date) => {
    if (!date) return '--:--';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleCheckIn = () => {
    setIsClocking(true);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(clockAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(clockAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsClocking(false);
      setTimeout(() => {
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });

    const now = new Date();
    setCheckInTime(now);
    setStatus('In Progress');
  };

  const handleCheckOut = () => {
    if (!checkInTime) return;
    
    setIsClocking(true);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(clockAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(clockAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsClocking(false);
      setTimeout(() => {
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });

    const now = new Date();
    setCheckOutTime(now);
    setStatus('Completed');

    const diffMs = now - checkInTime;
    const diffHours = (diffMs / (1000 * 60 * 60)).toFixed(1);
    setWorkHours(parseFloat(diffHours));
  };

  const rotateBorder = borderAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const clockScale = clockAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const successScale = successAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1.1, 1],
  });

  const getStatusColor = () => {
    switch (status) {
      case 'Not Marked': return '#6B7280';
      case 'In Progress': return '#F59E0B';
      case 'Completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getProgressPercentage = () => {
    return Math.min((workHours / 8) * 100, 100);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#FFFFFF', '#F0F4FF', '#E8F4FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bgGradient}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backButtonGradient}
              >
                <MaterialCommunityIcons name="chevron-left" size={26} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Employee Attendance</Text>
              <Text style={styles.headerSubtitle}>{currentDate}</Text>
            </View>
          </View>
        </View>

        {/* Circular Clock Status */}
        <View style={styles.clockContainer}>
          <View style={styles.clockWrapper}>
            {/* Rotating Border */}
            <Animated.View
              style={[
                styles.rotatingBorder,
                {
                  transform: [{ rotate: rotateBorder }],
                },
              ]}
            />

            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.clockInner}
            >
              <Animated.View
                style={[
                  styles.clockContent,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <MaterialCommunityIcons 
                  name={status === 'Not Marked' ? 'clock-outline' : status === 'In Progress' ? 'motion-play' : 'check-circle'} 
                  size={50} 
                  color="#FFFFFF" 
                />
                <Text style={styles.clockStatus}>{status}</Text>
              </Animated.View>
            </LinearGradient>

            {/* Success Checkmark */}
            <Animated.View
              style={[
                styles.successOverlay,
                {
                  opacity: successAnim,
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <View style={styles.successCheck}>
                <MaterialCommunityIcons name="check-bold" size={40} color="#10B981" />
              </View>
            </Animated.View>
          </View>

          {/* Time Display */}
          <View style={styles.timeDisplayContainer}>
            <View style={styles.timeBox}>
              <View style={styles.timeBoxInner}>
                <MaterialCommunityIcons name="login" size={20} color="#667EEA" />
                <Text style={styles.timeBoxLabel}>IN</Text>
                <Text style={styles.timeBoxValue}>{checkInTime ? formatTime(checkInTime) : '--:--'}</Text>
              </View>
            </View>

            <View style={styles.timeBox}>
              <View style={styles.timeBoxInner}>
                <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
                <Text style={styles.timeBoxLabel}>OUT</Text>
                <Text style={styles.timeBoxValue}>{checkOutTime ? formatTime(checkOutTime) : '--:--'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Work Hours Visualization */}
        <View style={styles.workHoursSection}>
          <View style={styles.workHoursHeader}>
            <Text style={styles.workHoursTitle}>Today's Hours</Text>
            <Text style={styles.workHoursValue}>{workHours.toFixed(1)} / 8.0</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]}
              />
            </View>
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Start: {checkInTime ? formatTime(checkInTime) : '--:--'}</Text>
            <Text style={styles.progressLabel}>End: {checkOutTime ? formatTime(checkOutTime) : '--:--'}</Text>
          </View>
        </View>

        {/* Action Buttons - Enhanced */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              checkInTime !== null && checkOutTime === null && styles.buttonDisabled,
            ]}
            onPress={handleCheckIn}
            disabled={checkInTime !== null && checkOutTime === null}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonIconContainer}>
                <MaterialCommunityIcons name="play-circle-outline" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonMainText}>Check In</Text>
                <Text style={styles.buttonSubText}>Start Work</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              (!checkInTime || checkOutTime !== null) && styles.buttonDisabled,
            ]}
            onPress={handleCheckOut}
            disabled={!checkInTime || checkOutTime !== null}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonIconContainer}>
                <MaterialCommunityIcons name="stop-circle-outline" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonMainText}>Check Out</Text>
                <Text style={styles.buttonSubText}>End Work</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCardGradient}
            >
              <MaterialCommunityIcons name="briefcase-check" size={24} color="#E95420" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>{status}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.1)', 'rgba(99, 102, 241, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCardGradient}
            >
              <MaterialCommunityIcons name="clock-time-eight" size={24} color="#E95420" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Hours</Text>
                <Text style={styles.statValue}>{workHours.toFixed(1)}h</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Info Alert */}
        <View style={styles.infoAlert}>
          <View style={styles.alertContent}>
            <MaterialCommunityIcons name="information" size={20} color="#667EEA" />
            <Text style={styles.alertText}>
              {status === 'Not Marked' 
                ? 'Tap Check In to begin tracking your work hours'
                : status === 'In Progress'
                ? 'You\'re checked in. Tap Check Out when finished'
                : 'Your shift has been recorded successfully!'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
  },
  clockContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  clockWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  rotatingBorder: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#667EEA',
    opacity: 0.2,
    top: -10,
    left: -10,
  },
  clockInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  clockContent: {
    alignItems: 'center',
  },
  clockStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  successOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheck: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  timeDisplayContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeBox: {
    flex: 1,
  },
  timeBoxInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E95420',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  timeBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeBoxValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  workHoursSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  workHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workHoursTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  workHoursValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#667EEA',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBackground: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  buttonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonMainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonSubText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 28,
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    borderRadius: 16,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  infoAlert: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 20,
  },
  alertContent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    alignItems: 'flex-start',
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#667EEA',
    lineHeight: 20,
  },
});