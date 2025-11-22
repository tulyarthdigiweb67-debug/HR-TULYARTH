

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotificationList } from '../redux/slices/notificationListSlice';
import { fetchLatestNotification } from '../redux/slices/adminDashboardSlice';
import { fetchEmployeeLeaveList } from '../redux/slices/employeeLeaveListSlice';
import { fetchEmployeeList } from '../redux/slices/employeeListSlice';
import { LinearGradient } from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 60;
const CARD_SPACING = 16;
const EMPLOYEE_BADGE_COLORS = ['#FACC15', '#38BDF8', '#A78BFA', '#FB7185', '#34D399'];

const getNameInitials = (name = '') => {
  const sanitized = name.trim();
  if (!sanitized) return 'NA';
  const parts = sanitized.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const normalizeName = (value = '') => value.trim().toLowerCase();

const formatEmployeeName = employee => {
  const first = employee?.employee_first_name?.trim() || '';
  const last = employee?.employee_last_name?.trim() || '';
  const fallback = employee?.employee_name?.trim() || '';
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  if (fallback) return fallback;
  return 'Unknown Employee';
};



export default function AdminDashboard({ onNavigate }) {
  const dispatch = useDispatch();
  const { items: notifications } = useSelector(state => state.notificationList || { items: [] });
  const { latestNotification, loading: latestNotificationLoading } = useSelector(
    state => state.adminDashboard || { latestNotification: null, loading: false }
  );
  const { items: leaveItems = [], loading: leaveLoading } = useSelector(
    state => state.employeeLeaveList || { items: [], loading: false }
  );
  const { items: employeeItems = [], loading: employeeLoading } = useSelector(
    state => state.employeeList || { items: [], loading: false }
  );

  const scrollViewRef = useRef(null);
  const mainScrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const marqueeTranslate = useRef(new Animated.Value(0)).current;
  const marqueeLoopRef = useRef(null);
  const [marqueeSizes, setMarqueeSizes] = useState({ container: 0, content: 0 });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [calendarDate, setCalendarDate] = useState(() => new Date(2025, 10, 1));
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const navigationBlockedRef = useRef(false);
  const navigationBlockTimeoutRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isUserAtBottomRef = useRef(false);
  const scrollPositionTimeoutRef = useRef(null);

  // Pulse animation for notification icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
  }, []);

  // Shimmer animation for cards
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    dispatch(fetchNotificationList());
    dispatch(fetchLatestNotification());
    dispatch(fetchEmployeeLeaveList());
    dispatch(fetchEmployeeList());

    const interval = setInterval(() => {
      // Only refresh data if user is not actively scrolling AND not at bottom
      // This prevents unwanted re-renders when user is viewing the employees on leave section
      if (!isScrollingRef.current && !isUserAtBottomRef.current) {
        dispatch(fetchNotificationList());
        dispatch(fetchLatestNotification());
        dispatch(fetchEmployeeLeaveList());
        dispatch(fetchEmployeeList());
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (navigationBlockTimeoutRef.current) {
        clearTimeout(navigationBlockTimeoutRef.current);
      }
      if (scrollPositionTimeoutRef.current) {
        clearTimeout(scrollPositionTimeoutRef.current);
      }
    };
  }, [dispatch]);

  // Use the latest notification from API instead of calculating from list
  const displayNotification = useMemo(() => {
    if (latestNotification) {
      return latestNotification;
    }

    // Fallback to calculated latest from list if API notification not available
    if (!notifications || notifications.length === 0) {
      return null;
    }

    const sorted = [...notifications].sort((a, b) => {
      const dateA = a.n_date || '';
      const dateB = b.n_date || '';
      return dateB.localeCompare(dateA);
    });

    return sorted[0];
  }, [latestNotification, notifications, latestNotificationLoading]);

  // Safe navigation wrapper that prevents navigation during/after scrolling
  const safeNavigate = (action, params = null, options = {}) => {
    const { allowWhenBlocked = false } = options;
    const shouldBlock =
      navigationBlockedRef.current || isScrollingRef.current || isUserAtBottomRef.current;

    if (shouldBlock && !allowWhenBlocked) {
      return;
    }

    if (allowWhenBlocked) {
      navigationBlockedRef.current = false;
      isScrollingRef.current = false;
      isUserAtBottomRef.current = false;
    }

    if (onNavigate) {
      if (params) {
        onNavigate(action, params);
      } else {
        onNavigate(action);
      }
    }
  };

  const handleNotificationPress = () => {
    // Block navigation if scrolling, at bottom, or navigation is blocked
    if (navigationBlockedRef.current || isScrollingRef.current || isUserAtBottomRef.current) {
      return;
    }
    if (onNavigate && displayNotification) {
      onNavigate('notificationCard', { notification: displayNotification, source: 'dashboard' });
    }
  };

  useEffect(() => {
    if (marqueeSizes.container === 0 || marqueeSizes.content === 0) {
      return;
    }

    if (marqueeLoopRef.current) {
      marqueeLoopRef.current.stop();
      marqueeLoopRef.current = null;
    }

    marqueeTranslate.setValue(marqueeSizes.container);

    const distance = marqueeSizes.container + marqueeSizes.content;
    const duration = Math.max(5000, distance * 20);

    const animation = Animated.loop(
      Animated.timing(marqueeTranslate, {
        toValue: -marqueeSizes.content,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    marqueeLoopRef.current = animation;
    marqueeLoopRef.current.start();

    return () => {
      if (marqueeLoopRef.current) {
        marqueeLoopRef.current.stop();
        marqueeLoopRef.current = null;
      }
    };
  }, [marqueeSizes, marqueeTranslate]);

  const cards = [
    {
      id: 'employee',
      title: 'Employee',
      description: 'Manage team members',
      icon: 'account-group',
      iconColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.2)',
      gradientColors: ['#667EEA', '#764BA2'],
      accentColor: '#667EEA',
      addAction: 'addEmployee',
      listAction: 'employeeList',
      addLabel: 'Add ',
      listLabel: 'List',
    },
    {
      id: 'notification',
      title: 'Notifications',
      description: 'Broadcast messages',
      icon: 'bell-ring',
      iconColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.2)',
      gradientColors: ['#E95420', '#FF6B35'],
      accentColor: '#E95420',
      addAction: 'addNotification',
      listAction: 'notificationList',
      addLabel: 'Add',
      listLabel: 'List',
    },
    {
      id: 'leave',
      title: 'Leave',
      description: 'Manage time off',
      icon: 'calendar-check',
      iconColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.2)',
      gradientColors: ['#4FACFE', '#00F2FE'],
      accentColor: '#4FACFE',
      addAction: 'leaveApplication',
      listAction: 'employeeLeaveList',
      addLabel: 'Add',
      listLabel: 'List',
    },
    {
      id: 'attendance',
      title: 'Attendance',
      description: 'Track work hours',
      icon: 'clock-check',
      iconColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.2)',
      gradientColors: ['#FA709A', '#FEE140'],
      accentColor: '#FA709A',
      addAction: 'employeeAttendanceMark',
      // Open the same Attendance List screen that is available from the sidebar
      // (this renders the AttendanceList.jsx component)
      listAction: 'attendanceList',
      addLabel: 'Mark',
      listLabel: 'View ',
    },
  ];

  const handleCardListPress = (card) => {
    if (card.id === 'employee') {
      // Allow navigation even if scrolling blockers are active
      safeNavigate(card.listAction, null, { allowWhenBlocked: true });
      return;
    }
    safeNavigate(card.listAction);
  };

  const handleCardAddPress = (card) => {
    if (card.id === 'employee' || card.id === 'leave') {
      safeNavigate(card.addAction, null, { allowWhenBlocked: true });
      return;
    }
    safeNavigate(card.addAction);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-CARD_WIDTH, CARD_WIDTH],
  });

  // Process leave data for display
  const pendingLeaves = useMemo(() => {
    if (!leaveItems || leaveItems.length === 0) return [];

    // Filter pending leaves (assuming status field exists or default to pending)
    return leaveItems
      .filter(leave => {
        // If status field exists, filter by pending status
        // Otherwise, show all leaves as pending
        const status = leave.l_status?.toLowerCase() || 'pending';
        return status === 'pending' || !leave.l_status;
      })
      .slice(0, 5); // Show only first 5 pending leaves
  }, [leaveItems]);

  const employeesOnLeaveCount = useMemo(() => {
    if (!leaveItems || leaveItems.length === 0) return 0;

    // Count all leaves that are currently active (today is between from and to date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return leaveItems.filter(leave => {
      if (!leave.l_from_date || !leave.l_to_date) return false;

      try {
        const fromDate = new Date(leave.l_from_date);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(leave.l_to_date);
        toDate.setHours(23, 59, 59, 999);

        return today >= fromDate && today <= toDate;
      } catch (e) {
        return false;
      }
    }).length;
  }, [leaveItems]);

  // Get employees currently on leave - memoized with stable reference
  const employeesOnLeave = useMemo(() => {
    if (!leaveItems || leaveItems.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = leaveItems
      .filter(leave => {
        if (!leave.l_from_date || !leave.l_to_date) return false;

        try {
          const fromDate = new Date(leave.l_from_date);
          fromDate.setHours(0, 0, 0, 0);

          const toDate = new Date(leave.l_to_date);
          toDate.setHours(23, 59, 59, 999);

          return today >= fromDate && today <= toDate;
        } catch (e) {
          return false;
        }
      })
      .slice(0, 5); // Show only first 5
    
    // Sort by ID to maintain stable order
    const sorted = [...filtered].sort((a, b) => {
      const idA = a.l_id || 0;
      const idB = b.l_id || 0;
      return idA - idB;
    });
    
    return sorted;
  }, [leaveItems]);

  const absentNamesLookup = useMemo(() => {
    return new Set(
      employeesOnLeave
        .map(leave => normalizeName(leave?.l_name || ''))
        .filter(Boolean)
    );
  }, [employeesOnLeave]);

  const presentEmployees = useMemo(() => {
    if (!employeeItems || employeeItems.length === 0) return [];
    return employeeItems
      .map(employee => ({
        id: String(
          employee?.employee_id ??
            `${employee?.employee_first_name || 'emp'}-${employee?.employee_last_name || 'name'}`
        ),
        name: formatEmployeeName(employee),
        meta:
          employee?.employee_department ||
          employee?.employee_designation ||
          employee?.employee_title ||
          '—',
      }))
      .filter(employee => !absentNamesLookup.has(normalizeName(employee.name)));
  }, [employeeItems, absentNamesLookup]);

  const absentEmployees = useMemo(() => {
    return employeesOnLeave.map((leave, index) => {
      const leaveId = leave.l_id ? String(leave.l_id) : `absent-${index}`;
      return {
        id: leaveId,
        name: leave.l_name || 'Unknown Employee',
        meta: leave.l_purpose || formatDateRange(leave.l_from_date, leave.l_to_date),
      };
    });
  }, [employeesOnLeave]);

  const dailyAttendanceHighlights = useMemo(() => {
    return {
      present: presentEmployees,
      absent: absentEmployees,
    };
  }, [presentEmployees, absentEmployees]);

  const employeeDirectory = useMemo(() => {
    const rows = (employeeItems || []).map((employee, index) => {
      const company =
        employee?.employee_company ||
        employee?.employee_working_company ||
        employee?.employee_current_company ||
        '—';
      const email =
        employee?.employee_email ||
        employee?.employee_official_email ||
        employee?.employee_personal_email ||
        '—';
      const designation =
        employee?.employee_designation ||
        employee?.employee_department ||
        employee?.employee_title ||
        '—';

      return {
        id: String(employee?.employee_id ?? `employee-${index}`),
        name: formatEmployeeName(employee),
        company,
        email,
        designation,
      };
    });

    const query = employeeSearch.trim().toLowerCase();
    const filteredRows = query
      ? rows.filter(row =>
          [row.name, row.company, row.email, row.designation].some(value =>
            (value || '').toLowerCase().includes(query)
          )
        )
      : rows;

    return {
      total: rows.length,
      rows: filteredRows.slice(0, 5),
      filteredCount: filteredRows.length,
      isFiltered: Boolean(query),
    };
  }, [employeeItems, employeeSearch]);

  const leaveCalendarData = useMemo(() => {
    const calendarYear = calendarDate.getFullYear();
    const calendarMonthIndex = calendarDate.getMonth();
    const monthDisplayName = calendarDate.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    const totalDaysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();

    const leaveDays = new Set();
    if (leaveItems && leaveItems.length > 0) {
      leaveItems.forEach(leave => {
        if (!leave.l_from_date || !leave.l_to_date) return;
        try {
          const from = new Date(leave.l_from_date);
          const to = new Date(leave.l_to_date);
          let current = new Date(from);
          while (current <= to) {
            if (
              current.getFullYear() === calendarYear &&
              current.getMonth() === calendarMonthIndex
            ) {
              leaveDays.add(current.getDate());
            }
            current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
          }
        } catch (e) {
          // ignore invalid dates
        }
      });
    }

    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === calendarYear && today.getMonth() === calendarMonthIndex;
    const highlightedDate = isCurrentMonth ? today.getDate() : null;

    const firstDayOfWeek = new Date(calendarYear, calendarMonthIndex, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i += 1) {
      days.push({ key: `placeholder-start-${calendarYear}-${calendarMonthIndex}-${i}`, label: '', status: 'placeholder' });
    }

    for (let day = 1; day <= totalDaysInMonth; day += 1) {
      const date = new Date(calendarYear, calendarMonthIndex, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let status = 'default';
      if (isWeekend) {
        status = 'weekend';
      }
      if (leaveDays.has(day)) {
        status = 'leave';
      }
      if (highlightedDate && day === highlightedDate) {
        status = 'today';
      }

      days.push({
        key: `day-${calendarYear}-${calendarMonthIndex}-${day}`,
        label: day.toString(),
        status,
      });
    }

    while (days.length % 7 !== 0) {
      const index = days.length;
      days.push({
        key: `placeholder-end-${calendarYear}-${calendarMonthIndex}-${index}`,
        label: '',
        status: 'placeholder',
      });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return {
      header: monthDisplayName,
      weeks,
    };
  }, [calendarDate, leaveItems]);

  const presentCount = dailyAttendanceHighlights.present.length;
  const absentCount = dailyAttendanceHighlights.absent.length;

  // Calculate days between dates
  const calculateDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  // Toggle employee details expansion
  const toggleEmployeeExpansion = (leaveId) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [leaveId]: !prev[leaveId]
    }));
  };

  const handleAddEmployeeNavigate = () => {
    safeNavigate('addEmployee', null, { allowWhenBlocked: true });
  };

  const handleCalendarNavigate = direction => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month}, ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Format date range
  const formatDateRange = (fromDate, toDate) => {
    if (!fromDate || !toDate) return '';
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      const fromDay = from.getDate();
      const fromMonth = from.toLocaleString('en-US', { month: 'short' });
      const toDay = to.getDate();
      const toMonth = to.toLocaleString('en-US', { month: 'short' });
      const year = from.getFullYear();

      if (fromDay === toDay && fromMonth === toMonth) {
        return `${fromDay} ${fromMonth}, ${year}`;
      }

      return `${fromDay} ${fromMonth} - ${toDay} ${toMonth}, ${year}`;
    } catch (e) {
      return `${fromDate} - ${toDate}`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Title */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
      </View>

      <ScrollView 
        ref={mainScrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          isScrollingRef.current = true;
          navigationBlockedRef.current = true;
          // Don't reset isUserAtBottomRef here - let onScroll determine if still at bottom
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          if (navigationBlockTimeoutRef.current) {
            clearTimeout(navigationBlockTimeoutRef.current);
            navigationBlockTimeoutRef.current = null;
          }
          if (scrollPositionTimeoutRef.current) {
            clearTimeout(scrollPositionTimeoutRef.current);
            scrollPositionTimeoutRef.current = null;
          }
        }}
        onScrollEndDrag={() => {
          scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
          }, 1000);
          
          // Check if still at bottom - if so, keep navigation blocked
          if (!isUserAtBottomRef.current) {
            // Block navigation for 2000ms after scroll ends to prevent accidental navigation
            if (navigationBlockTimeoutRef.current) {
              clearTimeout(navigationBlockTimeoutRef.current);
            }
            navigationBlockTimeoutRef.current = setTimeout(() => {
              navigationBlockedRef.current = false;
            }, 2000);
          }
          // If at bottom, navigation stays blocked (handled in onScroll/onMomentumScrollEnd)
        }}
        onMomentumScrollEnd={(event) => {
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
          }, 500);
          
          // Check if user is at bottom of scroll
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          const paddingToBottom = 100;
          const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
          
          if (isAtBottom) {
            isUserAtBottomRef.current = true;
            // Keep navigation blocked indefinitely when at bottom - user must scroll up to enable navigation
            navigationBlockedRef.current = true;
            // Clear any existing timeouts
            if (navigationBlockTimeoutRef.current) {
              clearTimeout(navigationBlockTimeoutRef.current);
              navigationBlockTimeoutRef.current = null;
            }
            if (scrollPositionTimeoutRef.current) {
              clearTimeout(scrollPositionTimeoutRef.current);
              scrollPositionTimeoutRef.current = null;
            }
            // Navigation stays blocked until user scrolls away from bottom
          } else {
            // User scrolled away from bottom - reset flags after a delay
            if (scrollPositionTimeoutRef.current) {
              clearTimeout(scrollPositionTimeoutRef.current);
            }
            scrollPositionTimeoutRef.current = setTimeout(() => {
              isUserAtBottomRef.current = false;
            }, 1000);
            
            // Block navigation for 2000ms after momentum scroll ends
            if (navigationBlockTimeoutRef.current) {
              clearTimeout(navigationBlockTimeoutRef.current);
            }
            navigationBlockTimeoutRef.current = setTimeout(() => {
              navigationBlockedRef.current = false;
            }, 2000);
          }
        }}
        onScroll={(event) => {
          // Save scroll position
          scrollPositionRef.current = event.nativeEvent.contentOffset.y;
          
          // Check if user is at bottom
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          const paddingToBottom = 100;
          const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
          
          if (isAtBottom) {
            // User is at bottom - keep navigation blocked and prevent data refresh
            isUserAtBottomRef.current = true;
            navigationBlockedRef.current = true;
            // Clear any timeouts that would re-enable navigation
            if (navigationBlockTimeoutRef.current) {
              clearTimeout(navigationBlockTimeoutRef.current);
              navigationBlockTimeoutRef.current = null;
            }
            if (scrollPositionTimeoutRef.current) {
              clearTimeout(scrollPositionTimeoutRef.current);
              scrollPositionTimeoutRef.current = null;
            }
          } else {
            // User scrolled away from bottom - prepare to re-enable after delay
            if (isUserAtBottomRef.current) {
              // User just scrolled away from bottom
              if (scrollPositionTimeoutRef.current) {
                clearTimeout(scrollPositionTimeoutRef.current);
              }
              scrollPositionTimeoutRef.current = setTimeout(() => {
                isUserAtBottomRef.current = false;
              }, 1000);
            }
          }
          
          // Keep navigation blocked while actively scrolling
          if (!navigationBlockedRef.current && !isAtBottom) {
            navigationBlockedRef.current = true;
          }
          if (navigationBlockTimeoutRef.current && !isAtBottom) {
            clearTimeout(navigationBlockTimeoutRef.current);
          }
        }}
      >
        {/* Welcome Banner - Compact Design */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeBodyCard}>
            <LinearGradient
              colors={['#FF7A45', '#E95420', '#FF9A3C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeBody}
            >
              <View style={styles.welcomeBodyAccent} />
              
              <View style={styles.welcomeContentContainer}>
                {/* Avatar Image on Left */}
                <View style={styles.avatarContainer}>
                  <Image
                    source={require('../assests/images/avatar.jpg')}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                  <View style={styles.avatarBorder} />
                </View>

                {/* Text Content on Right */}
              <View style={styles.welcomeHeadingBlock}>
                <Text style={styles.welcomeTitleImage}>Welcome back, Admin!</Text>
                <Text style={styles.welcomeSubtitleImage}>
                  Here's what's happening with your workspace today
                </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Modern Notification Bar */}
        <TouchableOpacity
          style={styles.notificationBarContainer}
          onPress={handleNotificationPress}
          activeOpacity={0.9}
        >
          <View style={styles.notificationBar}>
            <Animated.View
              style={[
                styles.notificationIconContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <MaterialCommunityIcons name="bell-ring" size={22} color="#FFF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notifications?.length || 0}</Text>
              </View>
            </Animated.View>

            <View
              style={styles.marqueeInlineContainer}
              onLayout={(event) => {
                const width = event.nativeEvent.layout.width;
                setMarqueeSizes((prev) =>
                  prev.container === width ? prev : { ...prev, container: width }
                );
              }}
            >
              <Animated.View
                style={[
                  styles.marqueeContent,
                  { transform: [{ translateX: marqueeTranslate }] },
                ]}
                onLayout={(event) => {
                  const width = event.nativeEvent.layout.width;
                  setMarqueeSizes((prev) =>
                    prev.content === width ? prev : { ...prev, content: width }
                  );
                }}
              >
                <Text style={styles.notificationText}>
                  {displayNotification
                    ? (displayNotification.n_subject || displayNotification.n_description || 'No new notifications')
                    : 'No new notifications'}
                </Text>
              </Animated.View>
            </View>

            <View style={styles.chevronContainer}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6366F1" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Manage your workspace</Text>
        </View>

        {/* Enhanced Card Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            snapToAlignment="start"
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselContent}
          >
            {cards.map((card, index) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + CARD_SPACING),
                index * (CARD_WIDTH + CARD_SPACING),
                (index + 1) * (CARD_WIDTH + CARD_SPACING),
              ];

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.92, 1, 0.92],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.6, 1, 0.6],
                extrapolate: 'clamp',
              });

              const translateY = scrollX.interpolate({
                inputRange,
                outputRange: [20, 0, 20],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={card.id}
                  style={[
                    styles.carouselCard,
                    {
                      width: CARD_WIDTH,
                      transform: [{ scale }, { translateY }],
                      opacity,
                    },
                  ]}
                >
                  <LinearGradient colors={['#FFFFFF', '#FAFAFA']} style={styles.cardGradient}>
                    {/* Card Header with Gradient */}
                    <View style={styles.cardHeader}>
                      <LinearGradient
                        colors={card.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardHeaderGradient}
                      >
                        {/* Decorative Pattern */}
                        <View style={styles.cardHeaderPattern}>
                          <View style={[styles.patternCircle1, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
                          <View style={[styles.patternCircle2, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />
                          <View style={[styles.patternLine, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} />
                        </View>

                        <View style={styles.cardHeaderContent}>
                          <View style={[styles.iconContainer, { backgroundColor: card.iconBg }]}>
                            <MaterialCommunityIcons
                              name={card.icon}
                              size={42}
                              color={card.iconColor}
                            />
                          </View>
                        </View>
                      </LinearGradient>
                    </View>

                    {/* Card Body */}
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardDescription}>{card.description}</Text>

                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleCardAddPress(card)}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={card.gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionButtonGradient}
                          >
                            <MaterialCommunityIcons
                              name={card.id === 'attendance' ? 'clock-plus' : 'plus-circle'}
                              size={20}
                              color="#FFFFFF"
                            />
                            <Text style={styles.actionButtonText}>{card.addLabel}</Text>
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.secondaryAction, { borderColor: card.accentColor + '40' }]}
                          onPress={() => handleCardListPress(card)}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons
                            name="format-list-bulleted-square"
                            size={20}
                            color={card.accentColor}
                          />
                          <Text style={[styles.secondaryActionText, { color: card.accentColor }]}>
                            {card.listLabel}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>

          {/* Modern Pagination Dots */}
          <View style={styles.paginationContainer}>
            {cards.map((card, index) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + CARD_SPACING),
                index * (CARD_WIDTH + CARD_SPACING),
                (index + 1) * (CARD_WIDTH + CARD_SPACING),
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 28, 8],
                extrapolate: 'clamp',
              });

              const dotOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      width: dotWidth,
                      opacity: dotOpacity,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={card.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.dotGradient}
                  />
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Attendance and Leave Section */}
        <View style={styles.attendanceLeaveSection}>
          {/* All Attendance List Card */}
          <TouchableOpacity
            style={styles.attendanceCard}
            // Navigate to the Attendance List screen (AttendanceList.jsx)
            onPress={() => safeNavigate('attendanceList')}
            activeOpacity={0.9}
          >
            <View style={styles.attendanceCardContent}>
              <View style={styles.attendanceCardTop}>
                <View style={styles.attendanceIconContainer}>
                  <MaterialCommunityIcons name="format-list-checks" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.attendanceCardText}>
                  <Text style={styles.attendanceCardTitle}>All Attendance List</Text>
                  <Text style={styles.attendanceCardSubtitle}>Manage your team members</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.viewListButton} 
                activeOpacity={0.8}
                onPress={() => {
                  // Direct navigation for button press - bypass scroll restrictions
                  if (onNavigate) {
                    // Open the same Attendance List screen as from the sidebar
                    onNavigate('attendanceList');
                  }
                }}
              >
                <LinearGradient
                  colors={['#4FACFE', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.viewListButtonGradient}
                >
                  <MaterialCommunityIcons name="eye" size={18} color="#FFFFFF" />
                  <Text style={styles.viewListButtonText}>View List</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Employees on Leave Section */}
          {employeesOnLeave.length > 0 && (
            <View style={styles.employeesOnLeaveSection}>
              {/* Header Card - Similar to All Attendance List */}
              <TouchableOpacity
                style={styles.employeesOnLeaveCard}
                activeOpacity={0.9}
              >
                <View style={styles.employeesOnLeaveCardContent}>
                  <View style={styles.employeesOnLeaveCardTop}>
                    <View style={styles.employeesOnLeaveIconContainer}>
                      <MaterialCommunityIcons name="calendar-remove" size={28} color="#FFFFFF" />
                    </View>
                    <View style={styles.employeesOnLeaveCardText}>
                      <Text style={styles.employeesOnLeaveCardTitle}>Employees on Leave</Text>
                      <Text style={styles.employeesOnLeaveCardSubtitle}>Team members currently on leave</Text>
                    </View>
                  </View>
                  <View style={styles.employeesOnLeaveCountBadge}>
                    <MaterialCommunityIcons name="account-group" size={18} color="#FFFFFF" />
                    <Text style={styles.employeesOnLeaveCountText}>{employeesOnLeaveCount}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Employee List with Unique Expandable Design */}
              <View style={styles.employeesOnLeaveList}>
                {employeesOnLeave.map((leave, index) => {
                  const days = calculateDays(leave.l_from_date, leave.l_to_date);
                  const leaveType = leave.l_purpose || 'personal';
                  const isLast = index === employeesOnLeave.length - 1;
                  const leaveId = leave.l_id ? String(leave.l_id) : `leave-${leave.l_name || 'unknown'}-${leave.l_from_date || index}`;
                  const isExpanded = expandedEmployees[leaveId];
                  
                  return (
                    <View 
                      key={leaveId} 
                      style={[
                        styles.employeeLeaveCard,
                        isLast && styles.employeeLeaveCardLast
                      ]}
                    >
                      {/* Main Clickable Row */}
                      <TouchableOpacity
                        style={styles.employeeLeaveMainRow}
                        onPress={() => toggleEmployeeExpansion(leaveId)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.employeeLeaveMainLeft}>
                          <View style={styles.employeeLeaveAvatarOrange}>
                            <MaterialCommunityIcons name="account" size={22} color="#FFFFFF" />
                          </View>
                          <Text style={styles.employeeLeaveNameOrange}>
                            {leave.l_name || 'Unknown Employee'}
                          </Text>
                        </View>
                        <View style={styles.employeeLeaveMainRight}>
                          <View style={styles.employeeLeaveQuickBadge}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#F97316" />
                            <Text style={styles.employeeLeaveQuickDays}>{days}d</Text>
                          </View>
                          <MaterialCommunityIcons 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={22} 
                            color="#F97316" 
                          />
                        </View>
                      </TouchableOpacity>

                      {/* Unique Slide-out Details Panel */}
                      {isExpanded && (
                        <Animated.View style={styles.employeeLeaveSlidePanel}>
                          <LinearGradient
                            colors={['#FFF7ED', '#FFFFFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.employeeLeavePanelGradient}
                          >
                            {/* Status Row */}
                            <View style={styles.employeeLeavePanelHeader}>
                              <View style={styles.employeeLeaveStatusBadgeOrange}>
                                <MaterialCommunityIcons name="check-circle" size={16} color="#FFFFFF" />
                                <Text style={styles.employeeLeaveStatusTextOrange}>
                                  {leave.l_status?.charAt(0).toUpperCase() + leave.l_status?.slice(1) || 'Pending'}
                                </Text>
                              </View>
                              <View style={styles.employeeLeaveDurationBadgeOrange}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color="#FFFFFF" />
                                <Text style={styles.employeeLeaveDurationTextOrange}>
                                  {days} {days === 1 ? 'day' : 'days'}
                                </Text>
                              </View>
                            </View>

                            {/* Details Grid */}
                            <View style={styles.employeeLeaveDetailsGrid}>
                              {/* Row 1 */}
                              <View style={styles.employeeLeaveDetailCard}>
                                <View style={styles.employeeLeaveDetailCardIcon}>
                                  <MaterialCommunityIcons name="briefcase" size={20} color="#F97316" />
                                </View>
                                <Text style={styles.employeeLeaveDetailCardLabel}>Designation</Text>
                                <Text style={styles.employeeLeaveDetailCardValue}>
                                  {leave.l_designation || 'N/A'}
                                </Text>
                              </View>

                              <View style={styles.employeeLeaveDetailCard}>
                                <View style={styles.employeeLeaveDetailCardIcon}>
                                  <MaterialCommunityIcons name="office-building" size={20} color="#F97316" />
                                </View>
                                <Text style={styles.employeeLeaveDetailCardLabel}>Company</Text>
                                <Text style={styles.employeeLeaveDetailCardValue}>
                                  {leave.l_company || leave.l_company_main || 'N/A'}
                                </Text>
                              </View>

                              {/* Row 2 */}
                              <View style={styles.employeeLeaveDetailCard}>
                                <View style={styles.employeeLeaveDetailCardIcon}>
                                  <MaterialCommunityIcons name="calendar-range" size={20} color="#F97316" />
                                </View>
                                <Text style={styles.employeeLeaveDetailCardLabel}>Leave Period</Text>
                                <Text style={styles.employeeLeaveDetailCardValue} numberOfLines={2}>
                                  {formatDateRange(leave.l_from_date, leave.l_to_date)}
                                </Text>
                              </View>

                              <View style={styles.employeeLeaveDetailCard}>
                                <View style={styles.employeeLeaveDetailCardIcon}>
                                  <MaterialCommunityIcons name="information" size={20} color="#F97316" />
                                </View>
                                <Text style={styles.employeeLeaveDetailCardLabel}>Leave Type</Text>
                                <Text style={styles.employeeLeaveDetailCardValue}>
                                  {leaveType}
                                </Text>
                              </View>
                            </View>

                            {/* Additional Info */}
                            {(leave.l_emp_code || leave.l_address_on_leave) && (
                              <View style={styles.employeeLeaveAdditionalInfo}>
                                {leave.l_emp_code && (
                                  <View style={styles.employeeLeaveInfoRow}>
                                    <MaterialCommunityIcons name="identifier" size={16} color="#F97316" />
                                    <Text style={styles.employeeLeaveInfoText}>
                                      Code: {leave.l_emp_code}
                                    </Text>
                                  </View>
                                )}
                                {leave.l_address_on_leave && (
                                  <View style={styles.employeeLeaveInfoRow}>
                                    <MaterialCommunityIcons name="map-marker" size={16} color="#F97316" />
                                    <Text style={styles.employeeLeaveInfoText} numberOfLines={2}>
                                      {leave.l_address_on_leave}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            )}
                          </LinearGradient>
                        </Animated.View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
       {/* ======= TOP HEADER ======= */}
<View style={styles.headerColumn}>
  <View style={styles.leftHeader}>
    <View style={styles.iconBox}>
      <MaterialCommunityIcons
        name="account-off-outline"
        size={28}
        color="#d99100"
      />
    </View>

    <View>
      <Text style={styles.title}>Employees on Leave Today</Text>
      <Text style={styles.subTitle}>Team members currently on leave</Text>

      {/* BADGE MOVED HERE BELOW SUBTITLE */}
      <View style={styles.badge}>
        <MaterialCommunityIcons name="account-multiple" size={16} color="#fff" />
        <Text style={styles.badgeText}>{employeesOnLeaveCount} On Leave</Text>
      </View>
    </View>
  </View>
</View>


{/* ======= CENTER AREA ======= */}
<View style={styles.centerContainer}>
  <View style={styles.circleOuter}>
    <View style={styles.circleInner}>
      <MaterialCommunityIcons
        name="calendar-check-outline"
        size={50}
        color="#0dbb62"
      />
    </View>
  </View>

  <Text style={styles.centerTitle}>All Hands on Deck! 🎉</Text>
  <Text style={styles.centerSubTitle}>
    No team members are currently on leave
  </Text>
</View>

<View style={styles.leaveCalendarCard}>
  <View style={styles.leaveCalendarHeader}>
    <View>
      <Text style={styles.leaveCalendarTitle}>Leave Calendar</Text>
      <Text style={styles.leaveCalendarSubtitle}>Team member schedules</Text>
    </View>
    <View style={styles.leaveCalendarNav}>
      <TouchableOpacity
        style={styles.leaveCalendarNavButton}
        onPress={() => handleCalendarNavigate(-1)}
      >
        <MaterialCommunityIcons name="chevron-left" size={22} color="#0F172A" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.leaveCalendarNavButton}
        onPress={() => handleCalendarNavigate(1)}
      >
        <MaterialCommunityIcons name="chevron-right" size={22} color="#0F172A" />
      </TouchableOpacity>
    </View>
  </View>

  <View style={styles.leaveCalendarGrid}>
    <View style={styles.leaveCalendarWeekdayRow}>
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
        <Text key={`weekday-${index}`} style={styles.leaveCalendarWeekdayText}>
          {day}
        </Text>
      ))}
    </View>

    {leaveCalendarData.weeks.map((week, weekIndex) => (
      <View key={`week-${weekIndex}`} style={styles.leaveCalendarWeekRow}>
        {week.map(day => (
          <View
            key={day.key}
            style={[
              styles.leaveCalendarDayCell,
              day.status === 'today' && styles.leaveCalendarDayToday,
              day.status === 'leave' && styles.leaveCalendarDayLeave,
              day.status === 'weekend' && styles.leaveCalendarDayWeekend,
              day.status === 'placeholder' && styles.leaveCalendarDayPlaceholder,
            ]}
          >
            <Text
              style={[
                styles.leaveCalendarDayText,
                day.status === 'today' && styles.leaveCalendarDayTextToday,
                day.status === 'leave' && styles.leaveCalendarDayTextLeave,
                day.status === 'weekend' && styles.leaveCalendarDayTextWeekend,
              ]}
            >
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    ))}
  </View>

  <View style={styles.leaveCalendarFooter}>
    <View style={styles.leaveCalendarMonthBadge}>
      <MaterialCommunityIcons name="calendar-month" size={18} color="#0F172A" />
      <Text style={styles.leaveCalendarMonthText}>{leaveCalendarData.header}</Text>
    </View>
    <View style={styles.leaveCalendarLegend}>
      <View style={styles.leaveCalendarLegendItem}>
        <View style={[styles.leaveCalendarLegendDot, styles.legendDotToday]} />
        <Text style={styles.leaveCalendarLegendLabel}>Today</Text>
      </View>
      <View style={styles.leaveCalendarLegendItem}>
        <View style={[styles.leaveCalendarLegendDot, styles.legendDotLeave]} />
        <Text style={styles.leaveCalendarLegendLabel}>On Leave</Text>
      </View>
      <View style={styles.leaveCalendarLegendItem}>
        <View style={[styles.leaveCalendarLegendDot, styles.legendDotWeekend]} />
        <Text style={styles.leaveCalendarLegendLabel}>Weekend</Text>
      </View>
    </View>
  </View>
</View>

<View style={styles.dailyAttendanceSection}>
  {/* Present Today Card - Professional Compact Design */}
  <View style={[styles.dailyAttendanceCard, styles.presentTodayCard]}>
    <View style={styles.dailyAttendanceHeader}>
      <View style={styles.dailyAttendanceHeaderLeft}>
        <View style={[styles.dailyAttendanceIcon, styles.presentIcon]}>
          <MaterialCommunityIcons name="account-check-outline" size={20} color="#10B981" />
        </View>
        <View style={styles.dailyAttendanceHeaderText}>
          <View style={styles.dailyAttendanceTitleRow}>
            <Text style={styles.dailyAttendanceTitle}>Present Today</Text>
            <View style={styles.countBadgePresent}>
              <Text style={styles.countBadgeText}>{presentCount}</Text>
            </View>
          </View>
          <Text style={styles.dailyAttendanceSubText}>Live attendance status</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="account-multiple-check" size={18} color="#10B981" />
    </View>

    <View style={styles.dailyAttendanceList}>
      {presentCount === 0 ? (
        <Text style={styles.dailyAttendanceEmptyText}>No Present Employees Today</Text>
      ) : (
        dailyAttendanceHighlights.present.slice(0, 3).map(employee => (
          <View key={employee.id} style={styles.dailyAttendanceListItem}>
            <View style={styles.dailyAttendanceAvatar}>
              <Text style={styles.dailyAttendanceInitials}>{getNameInitials(employee.name)}</Text>
            </View>
            <View style={styles.dailyAttendanceTextGroup}>
              <Text style={styles.dailyAttendanceName}>{employee.name}</Text>
              <Text style={styles.dailyAttendanceMeta}>{employee.meta}</Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
          </View>
        ))
      )}
    </View>

    <TouchableOpacity
      style={[styles.dailyAttendanceFooterButton, styles.presentFooterButton]}
      activeOpacity={0.85}
      onPress={() => safeNavigate('attendancePresentAbsent', null, { allowWhenBlocked: true })}
    >
      <Text style={styles.dailyAttendanceFooterButtonText}>View All</Text>
      <MaterialCommunityIcons name="chevron-right" size={16} color="#10B981" />
    </TouchableOpacity>
  </View>

  {/* Absent Today Card - Professional Compact Design */}
  <View style={[styles.dailyAttendanceCard, styles.absentTodayCard]}>
    <View style={styles.dailyAttendanceHeader}>
      <View style={styles.dailyAttendanceHeaderLeft}>
        <View style={[styles.dailyAttendanceIcon, styles.absentIcon]}>
          <MaterialCommunityIcons name="account-remove-outline" size={20} color="#E95420" />
        </View>
        <View style={styles.dailyAttendanceHeaderText}>
          <View style={styles.dailyAttendanceTitleRow}>
            <Text style={styles.dailyAttendanceTitle}>Absent Today</Text>
            <View style={styles.countBadgeAbsent}>
              <Text style={styles.countBadgeText}>{absentCount}</Text>
            </View>
          </View>
          <Text style={styles.dailyAttendanceSubText}>Tracking approved leaves</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="account-alert" size={18} color="#E95420" />
    </View>

    <View style={styles.dailyAttendanceList}>
      {absentCount === 0 ? (
        <Text style={styles.dailyAttendanceEmptyText}>No Absent Employees Today</Text>
      ) : (
        dailyAttendanceHighlights.absent.slice(0, 3).map(employee => (
          <View key={employee.id} style={styles.dailyAttendanceListItem}>
            <View style={[styles.dailyAttendanceAvatar, styles.absentAvatar]}>
              <Text style={styles.dailyAttendanceInitials}>{getNameInitials(employee.name)}</Text>
            </View>
            <View style={styles.dailyAttendanceTextGroup}>
              <Text style={styles.dailyAttendanceName}>{employee.name}</Text>
              <Text style={styles.dailyAttendanceMeta}>{employee.meta}</Text>
            </View>
            <View style={styles.statusPillAbsent}>
              <Text style={styles.dailyAttendanceStatusText}>Leave</Text>
            </View>
          </View>
        ))
      )}
    </View>

    <TouchableOpacity
      style={[styles.dailyAttendanceFooterButton, styles.absentFooterButton]}
      activeOpacity={0.85}
      onPress={() => safeNavigate('attendancePresentAbsent', null, { allowWhenBlocked: true })}
    >
      <Text style={styles.dailyAttendanceFooterButtonText}>View All</Text>
      <MaterialCommunityIcons name="chevron-right" size={16} color="#E95420" />
    </TouchableOpacity>
  </View>
</View>

{/* Employee Management CTA */}
<View style={styles.employeeManagementCard}>
  <View style={styles.employeeManagementHeader}>
    <View style={styles.employeeManagementIconBox}>
      <MaterialCommunityIcons name="account-group" size={28} color="#FACC15" />
    </View>
    <View>
      <Text style={styles.employeeManagementTitle}>Employee Management</Text>
      <Text style={styles.employeeManagementSubtitle}>Manage your team members</Text>
    </View>
  </View>

  <View style={styles.employeeManagementActions}>
    <View style={styles.employeeSearchContainer}>
      <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
      <TextInput
        style={styles.employeeSearchInput}
        placeholder="Search employees..."
        placeholderTextColor="#94A3B8"
        value={employeeSearch}
        onChangeText={setEmployeeSearch}
        returnKeyType="search"
      />
    </View>
    <TouchableOpacity
      style={styles.addEmployeeButton}
      activeOpacity={0.9}
      onPress={handleAddEmployeeNavigate}
    >
      <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
      <Text style={styles.addEmployeeButtonText}>Add Employee</Text>
    </TouchableOpacity>
  </View>
</View>

        <View style={styles.employeeDirectoryCard}>
          <View style={styles.employeeDirectoryHeader}>
            <View style={styles.employeeDirectoryTitleRow}>
              <View style={styles.employeeDirectoryIconBox}>
                <MaterialCommunityIcons name="account-badge-outline" size={26} color="#F97316" />
              </View>
              <View>
                <Text style={styles.employeeDirectoryTitle}>All Employees</Text>
                <Text style={styles.employeeDirectorySubtitle}>
                  {employeeDirectory.isFiltered
                    ? `Showing ${employeeDirectory.filteredCount} result${employeeDirectory.filteredCount === 1 ? '' : 's'}`
                    : 'Snapshot of your active workforce'}
                </Text>
              </View>
            </View>
            <View style={styles.employeeDirectoryTotalBadge}>
              <Text style={styles.employeeDirectoryTotalText}>{employeeDirectory.total} Total</Text>
            </View>
          </View>

        </View>

        <View style={styles.employeeTableContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.employeeTableScrollContent}
          >
            <View style={styles.employeeTable}>
              <LinearGradient
                colors={['#0F172A', '#1E1B4B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.employeeTableHeaderRow, styles.employeeTableGlow]}
              >
                <View style={styles.employeeSerialColumn}>
                  <Text style={styles.employeeTableHeaderCell}>S.NO</Text>
                </View>
                <View style={styles.employeeNameColumn}>
                  <Text style={styles.employeeTableHeaderCell}>EMPLOYEE</Text>
                </View>
                <View style={styles.employeeCompanyColumn}>
                  <Text style={styles.employeeTableHeaderCell}>COMPANY</Text>
                </View>
                <View style={styles.employeeEmailColumn}>
                  <Text style={styles.employeeTableHeaderCell}>EMAIL</Text>
                </View>
                <View style={styles.employeeDesignationColumn}>
                  <Text style={styles.employeeTableHeaderCell}>DESIGNATION</Text>
                </View>
                <View style={styles.employeeActionColumn}>
                  <Text style={styles.employeeTableHeaderCell}>ACTION</Text>
                </View>
              </LinearGradient>

              {employeeDirectory.rows.length === 0 ? (
                <View style={styles.employeeTableEmpty}>
                  <Text style={styles.employeeTableEmptyText}>
                    {employeeDirectory.isFiltered
                      ? 'No employees match your search. Try a different keyword.'
                      : 'Add employees to populate this overview.'}
                  </Text>
                </View>
              ) : (
                employeeDirectory.rows.map((employee, index) => {
                  const accentColor = EMPLOYEE_BADGE_COLORS[index % EMPLOYEE_BADGE_COLORS.length];
                  const rowColors =
                    index % 2 === 0
                      ? ['#FFFFFF', '#F8FAFF']
                      : ['#FFF9F0', '#FFFFFF'];
                  return (
                    <LinearGradient
                      key={employee.id}
                      colors={rowColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.employeeRowGradient}
                    >
                      <View style={styles.employeeTableRow}>
                        <Text style={[styles.employeeTableCell, styles.employeeSerialColumn]}>
                          {index + 1}
                        </Text>

                        <View style={[styles.employeeTableCell, styles.employeeNameColumn, styles.employeeNameCellContent]}>
                          <View style={[styles.employeeAvatarBadge, { backgroundColor: accentColor }]}>
                            <Text style={styles.employeeAvatarInitials}>
                              {getNameInitials(employee.name)}
                            </Text>
                          </View>
                          <View style={styles.employeeNameTextBlock}>
                            <Text style={styles.employeeNameText}>{employee.name}</Text>
                            <Text style={styles.employeeNameMeta}>
                              {employee.designation !== '—' ? employee.designation : employee.company}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.employeeTableCell, styles.employeeCompanyColumn]}>
                          <Text style={styles.employeeCompanyText}>{employee.company}</Text>
                          <View style={styles.employeeCompanyPill}>
                            <MaterialCommunityIcons name="office-building" size={12} color="#334155" />
                            <Text style={styles.employeeCompanyPillText}>Active</Text>
                          </View>
                        </View>

                        <View style={[styles.employeeTableCell, styles.employeeEmailColumn]}>
                          <Text
                            style={styles.employeeEmailText}
                            numberOfLines={1}
                          >
                            {employee.email}
                          </Text>
                          <View style={styles.employeeEmailStatus}>
                            <View style={styles.employeeEmailStatusDot} />
                            <Text style={styles.employeeEmailStatusText}>Verified</Text>
                          </View>
                        </View>

                        <View style={[styles.employeeTableCell, styles.employeeDesignationColumn]}>
                          <Text style={styles.employeeDesignationText}>{employee.designation}</Text>
                          <View style={styles.employeeBadgeRow}>
                            <View style={[styles.employeeBadgeChip, styles.employeeBadgePrimary]}>
                              <Text style={styles.employeeBadgeChipText}>Core</Text>
                            </View>
                            <View style={[styles.employeeBadgeChip, styles.employeeBadgeGhost]}>
                              <Text style={styles.employeeBadgeChipTextSecondary}>Team</Text>
                            </View>
                          </View>
                        </View>

                        <View style={[styles.employeeTableCell, styles.employeeActionColumn]}>
                          <TouchableOpacity
                            style={styles.employeeQuickAction}
                            activeOpacity={0.9}
                            onPress={() =>
                              safeNavigate(
                                'employeeDetails',
                                { employeeId: employee.id },
                                { allowWhenBlocked: true }
                              )
                            }
                          >
                            <MaterialCommunityIcons name="card-account-details-outline" size={16} color="#0F172A" />
                            <Text style={styles.employeeQuickActionText}>Profile</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </LinearGradient>
                  );
                })
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.viewAllEmployeesButton}
            activeOpacity={0.9}
            onPress={() => safeNavigate('employeeList', null, { allowWhenBlocked: true })}
          >
            <LinearGradient
              colors={['#FACC15', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.viewAllEmployeesButtonGradient}
            >
              <Text style={styles.viewAllEmployeesButtonText}>View All Employees</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 1.2,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Welcome Banner Styles
  welcomeBanner: {
    marginTop: 16,
    marginBottom: 24,
  },
  welcomeBodyCard: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
    borderRadius: 24,
    overflow: 'hidden',
  },
  welcomeSubtitleImage: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 20,
    textAlign: 'left',
  },
  welcomeBody: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    position: 'relative',
    minHeight: 120,
  },
  welcomeBodyAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 18,
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 2,
  },
  welcomeContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'visible',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  welcomeHeadingBlock: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  welcomeTitleImage: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  // Notification Bar Styles
  notificationBarContainer: {
    marginBottom: 24,
  },
  notificationBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  marqueeInlineContainer: {
    flex: 1,
    overflow: 'hidden',
    marginRight: 8,
  },
  marqueeContent: {
    flexDirection: 'row',
  },
  notificationText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section Header
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },

  // Carousel Styles
  carouselContainer: {
    marginBottom: 24,
  },
  carouselContent: {
    paddingVertical: 12,
  },
  carouselCard: {
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    height: 160,
    overflow: 'hidden',
  },
  cardHeaderGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardHeaderPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  patternCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -30,
    right: -20,
  },
  patternCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: -50,
    left: -30,
  },
  patternLine: {
    position: 'absolute',
    width: 200,
    height: 3,
    top: 60,
    right: -50,
    transform: [{ rotate: '45deg' }],
  },

  cardHeaderContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  cardBody: {
    padding: 24,
    minHeight: 200,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },

  cardActions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },

  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dotGradient: {
    flex: 1,
    borderRadius: 4,
  },

  bottomSpacer: {
    height: 40,
  },

  // Attendance and Leave Section Styles
  attendanceLeaveSection: {
    marginTop: 8,
    marginBottom: 24,
  },

  // All Attendance List Card
  attendanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attendanceCardContent: {
    flexDirection: 'column',
    width: '100%',
    gap: 16,
  },
  attendanceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  attendanceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  attendanceCardText: {
    flex: 1,
    minWidth: 0,
  },
  attendanceCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    flex: 1,
  },
  attendanceCardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    flex: 1,
  },
  viewListButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4FACFE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    width: '100%',
  },
  viewListButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  viewListButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Employees on Leave Section Styles - Orange Theme
  employeesOnLeaveSection: {
    marginBottom: 16,
  },
  employeesOnLeaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  employeesOnLeaveCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeesOnLeaveCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeesOnLeaveIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  employeesOnLeaveCardText: {
    flex: 1,
    minWidth: 0,
  },
  employeesOnLeaveCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  employeesOnLeaveCardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  employeesOnLeaveCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  employeesOnLeaveCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeesOnLeaveList: {
    gap: 12,
  },
  employeeLeaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  employeeLeaveCardLast: {
    marginBottom: 0,
  },
  employeeLeaveMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  employeeLeaveMainLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeLeaveMainRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employeeLeaveAvatarOrange: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeLeaveNameOrange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textTransform: 'capitalize',
    flex: 1,
  },
  employeeLeaveQuickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  employeeLeaveQuickDays: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F97316',
  },
  employeeLeaveSlidePanel: {
    borderTopWidth: 2,
    borderTopColor: '#F97316',
    overflow: 'hidden',
  },
  employeeLeavePanelGradient: {
    padding: 20,
  },
  employeeLeavePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  employeeLeaveStatusBadgeOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    flex: 1,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeLeaveStatusTextOrange: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  employeeLeaveDurationBadgeOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    flex: 1,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeLeaveDurationTextOrange: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeeLeaveDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  employeeLeaveDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  employeeLeaveDetailCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  employeeLeaveDetailCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  employeeLeaveDetailCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  employeeLeaveAdditionalInfo: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
    gap: 10,
  },
  employeeLeaveInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  employeeLeaveInfoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
    lineHeight: 20,
  },
  employeeLeaveStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  employeeLeaveStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    textTransform: 'capitalize',
  },
  employeeLeaveDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  employeeLeaveDateText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  employeeLeaveDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  employeeLeaveDurationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F97316',
  },
  employeeLeaveTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  employeeLeaveTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'capitalize',
  },

  /* ------- HEADER ------- */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#fff7d1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  subTitle: {
    fontSize: 13,
    marginTop: 2,
    color: '#555',
  },

  badge: {
    flexDirection: 'row',
    backgroundColor: '#f5b300',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },

  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 5,
  },

  headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

leftHeader: {
  flexDirection: 'row',
  alignItems: 'center',
},

iconBox: {
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: '#fff3cc',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 14,
  elevation: 4,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 6,
},

title: {
  fontSize: 17,
  fontWeight: '700',
  color: '#1f1f1f',
},

subTitle: {
  fontSize: 13,
  marginTop: 2,
  color: '#6f6f6f',
},
headerColumn: {
  flexDirection: 'column',
},

leftHeader: {
  flexDirection: 'row',
  alignItems: 'center',
},

iconBox: {
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: '#fff3cc',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 14,
  marginTop: -25,
},

title: {
  fontSize: 17,
  fontWeight: '700',
  color: '#1f1f1f',
  marginTop: 12,
  marginBottom: 5,
},

subTitle: {
  fontSize: 13,
  marginTop: 2,
  color: '#6f6f6f',
},

badge: {
  flexDirection: 'row',
  backgroundColor: '#f5b300',
  paddingVertical: 5,
  paddingHorizontal: 10,
  borderRadius: 20,
  alignItems: 'center',
  marginTop: 8,     // BADGE NICHE JAANE KE LIYE
  alignSelf: 'center',
},

badgeText: {
  fontSize: 13,
  fontWeight: '700',
  color: '#fff',
  marginLeft: 5,
},

/* ------- CENTER SECTION ------- */
centerContainer: {
  marginTop: 40,
  alignItems: 'center',
},

circleOuter: {
  width: 110,
  height: 110,
  borderRadius: 55,
  borderWidth: 3,
  borderColor: '#0dbb62',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#eafff3',
},

circleInner: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#ffffff',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 6,
},

centerTitle: {
  marginTop: 20,
  fontSize: 18,
  fontWeight: '700',
  color: '#1f1f1f',
},

  centerSubTitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#777',
  },

  leaveCalendarCard: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  leaveCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaveCalendarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  leaveCalendarSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  leaveCalendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  leaveCalendarNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leaveCalendarLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  leaveCalendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leaveCalendarLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotToday: {
    backgroundColor: '#FACC15',
  },
  legendDotLeave: {
    backgroundColor: '#F97316',
  },
  legendDotWeekend: {
    backgroundColor: '#CBD5F5',
  },
  leaveCalendarLegendLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  leaveCalendarGrid: {
    marginTop: 20,
  },
  leaveCalendarWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leaveCalendarWeekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  leaveCalendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leaveCalendarDayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 4,
  },
  leaveCalendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  leaveCalendarDayToday: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FACC15',
  },
  leaveCalendarDayLeave: {
    backgroundColor: '#FFE8E0',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  leaveCalendarDayWeekend: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5F5',
  },
  leaveCalendarDayPlaceholder: {
    backgroundColor: 'transparent',
  },
  leaveCalendarDayTextToday: {
    color: '#D97706',
  },
  leaveCalendarDayTextLeave: {
    color: '#C2410C',
  },
  leaveCalendarDayTextWeekend: {
    color: '#475569',
  },
  leaveCalendarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 12,
  },
  leaveCalendarMonthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leaveCalendarMonthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  dailyAttendanceSection: {
    marginTop: 20,
    gap: 14,
  },
  dailyAttendanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  presentTodayCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  absentTodayCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#E95420',
  },
  dailyAttendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dailyAttendanceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dailyAttendanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presentIcon: {
    backgroundColor: '#ECFDF5',
  },
  absentIcon: {
    backgroundColor: '#FFF7ED',
  },
  dailyAttendanceHeaderText: {
    flex: 1,
  },
  dailyAttendanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  dailyAttendanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  dailyAttendanceSubText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
  },
  countBadgePresent: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  countBadgeAbsent: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  dailyAttendanceList: {
    marginTop: 8,
    gap: 10,
  },
  dailyAttendanceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  dailyAttendanceAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  absentAvatar: {
    backgroundColor: '#FEF3C7',
  },
  dailyAttendanceInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  dailyAttendanceTextGroup: {
    flex: 1,
  },
  dailyAttendanceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  dailyAttendanceMeta: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '400',
  },
  statusPillAbsent: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dailyAttendanceStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyAttendanceEmptyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 8,
    textAlign: 'center',
  },
  dailyAttendanceFooterButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  presentFooterButton: {
    backgroundColor: '#ECFDF5',
  },
  absentFooterButton: {
    backgroundColor: '#FFF7ED',
  },
  dailyAttendanceFooterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  employeeManagementCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: 16,
  },
  employeeManagementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employeeManagementIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FEFCE8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  employeeManagementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  employeeManagementSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  employeeManagementActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  employeeSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 48,
  },
  employeeSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  addEmployeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FACC15',
    paddingHorizontal: 18,
    minHeight: 48,
    borderRadius: 14,
    gap: 8,
    elevation: 3,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  addEmployeeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  employeeDirectoryCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  employeeDirectoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  employeeDirectoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employeeDirectoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeDirectoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  employeeDirectorySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  employeeDirectoryTotalBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  employeeDirectoryTotalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAllEmployeesButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  viewAllEmployeesButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  viewAllEmployeesButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeeTableContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  employeeTableScrollContent: {
    paddingBottom: 4,
  },
  employeeTable: {
    minWidth: 720,
    backgroundColor: '#FFFFFF',
  },
  employeeTableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
  },
  employeeTableGlow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  employeeTableHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.8,
  },
  employeeTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  employeeTableRowAlt: {
    backgroundColor: '#FFFDF4',
  },
  employeeTableCell: {
    fontSize: 13,
    color: '#0F172A',
  },
  employeeSerialColumn: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeNameColumn: {
    width: 240,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  employeeCompanyColumn: {
    width: 200,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  employeeEmailColumn: {
    width: 240,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  employeeDesignationColumn: {
    width: 180,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  employeeActionColumn: {
    width: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeNameCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employeeAvatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  employeeAvatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  employeeNameTextBlock: {
    flex: 1,
  },
  employeeNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  employeeNameMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  employeeCompanyText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  employeeCompanyPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  employeeCompanyPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  employeeEmailText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  employeeEmailStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  employeeEmailStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  employeeEmailStatusText: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '600',
  },
  employeeDesignationText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  employeeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  employeeBadgeChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  employeeBadgePrimary: {
    backgroundColor: '#E0E7FF',
  },
  employeeBadgeGhost: {
    backgroundColor: '#F1F5F9',
  },
  employeeBadgeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  employeeBadgeChipTextSecondary: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  employeeRowGradient: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  employeeQuickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FACC15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  employeeQuickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  employeeTableEmpty: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeTableEmptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
});
