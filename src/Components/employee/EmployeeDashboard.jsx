import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import { fetchLatestNotification } from '../../redux/slices/adminDashboardSlice';
import { fetchNotificationList } from '../../redux/slices/notificationListSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 60;
const CARD_SPACING = 16;

const ACTION_CARDS = [
  {
    id: 'profile',
    title: 'My Profile',
    description: 'Track work hours',
    gradientColors: ['#462556', '#6a3a7c'],
    accentColor: '#6D28D9',
    icon: 'account',
    primaryAction: { key: 'profile-view', label: 'View', icon: 'eye' },
  },
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Track work hours',
    gradientColors: ['#FA709A', '#FEE140'],
    accentColor: '#F97316',
    icon: 'clock-check',
    primaryAction: { key: 'attendance-mark', label: 'Mark', icon: 'clock-plus' },
    secondaryAction: { key: 'attendance-view', label: 'View', icon: 'format-list-bulleted' },
  },
  {
    id: 'leave',
    title: 'Leave',
    description: 'Apply & review',
    gradientColors: ['#4FACFE', '#00F2FE'],
    accentColor: '#0EA5E9',
    icon: 'calendar-check',
    primaryAction: { key: 'leave-add', label: 'Add', icon: 'plus-circle' },
    secondaryAction: { key: 'leave-list', label: 'List', icon: 'view-list' },
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Keep up to date',
    gradientColors: ['#F43F5E', '#F97316'],
    accentColor: '#DC2626',
    icon: 'bell-ring',
    primaryAction: { key: 'notifications-list', label: 'List', icon: 'bell' },
  },
];

const STATS_CARDS = [
  { icon: 'calendar-check', label: 'Attendance', value: '92%', color: '#EC4899' },
  { icon: 'calendar-clock', label: 'Pending Leaves', value: '3', color: '#06B6D4' },
  { icon: 'briefcase', label: 'Projects', value: '5', color: '#F59E0B' },
];

const WEEKLY_PROGRESS = [
  { day: 'Mo', hours: 6.5 },
  { day: 'Tu', hours: 7.0 },
  { day: 'We', hours: 6.9 },
  { day: 'Th', hours: 7.4 },
  { day: 'Fr', hours: 8.2, highlighted: true },
  { day: 'Sa', hours: 3.6 },
  { day: 'Su', hours: 0.5 },
];

const stripHtml = (value = '') =>
  value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const formatHours = (value) => {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

export default function EmployeeDashboard({
  employeeName = 'John Doe',
  employeeDesignation = 'Web Developer',
  notificationsCount = 0,
  onCardAction,
  onAnnouncementsPress,
  onRequestSignOut,
}) {
  const dispatch = useDispatch();
  const { latestNotification, loading: latestNotificationLoading } = useSelector(
    (state) => state.adminDashboard || { latestNotification: null, loading: false }
  );
  const { items: notifications } = useSelector(
    (state) => state.notificationList || { items: [] }
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(-100)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const marqueeTranslate = useRef(new Animated.Value(0)).current;
  const marqueeLoopRef = useRef(null);
  const [marqueeSizes, setMarqueeSizes] = useState({ container: 0, content: 0 });
  const maxWeeklyHours = useMemo(
    () => WEEKLY_PROGRESS.reduce((max, item) => Math.max(max, item.hours), 0),
    []
  );
  const weeklyAverage = useMemo(() => {
    if (WEEKLY_PROGRESS.length === 0) {
      return 0;
    }
    const total = WEEKLY_PROGRESS.reduce((sum, item) => sum + item.hours, 0);
    return total / WEEKLY_PROGRESS.length;
  }, []);
  const featuredDay = useMemo(
    () => WEEKLY_PROGRESS.find((item) => item.highlighted) || WEEKLY_PROGRESS[0],
    []
  );

  const displayNotification = useMemo(() => {
    if (latestNotification && typeof latestNotification === 'object') {
      return latestNotification;
    }
    return null;
  }, [latestNotification]);

  const announcementTitle =
    displayNotification?.n_subject?.trim() || 'New Updates Available';

  useEffect(() => {
    dispatch(fetchLatestNotification());
    dispatch(fetchNotificationList());
    const interval = setInterval(() => {
      dispatch(fetchLatestNotification());
      dispatch(fetchNotificationList());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMenuPress = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOptionsPress = () => {
    onCardAction?.('profile-view');
    setSidebarOpen(false);
  };

  const handleSidebarMenuPress = (item) => {
    setSidebarOpen(false);

    const key = item?.id || item?.title;

    switch (key) {
      case 'dashboard':
        onCardAction?.('dashboard');
        break;
      case 'profile':
        onCardAction?.('profile-view');
        break;
      case 'attendance-add':
      case 'Add Attendance':
        onCardAction?.('attendance-mark');
        break;
      case 'attendance-my':
      case 'My Attendance':
        onCardAction?.('attendance-view');
        break;
      case 'leave-apply':
      case 'Apply Leave':
        onCardAction?.('leave-add');
        break;
      case 'leave-view':
      case 'View Leave':
        onCardAction?.('leave-list');
        break;
      case 'notification-list':
      case 'Notification List':
        onCardAction?.('notifications-list');
        break;
      default:
        break;
    }
  };

  const handleOverlayPress = () => {
    setSidebarOpen(false);
  };

  const handleAnnouncementPress = () => {
    if (onAnnouncementsPress) {
      onAnnouncementsPress(displayNotification);
      return;
    }
    onCardAction?.('notifications-list');
  };

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
  }, [pulseAnim]);

  useEffect(() => {
    Animated.timing(slideInAnim, {
      toValue: 0,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [slideInAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

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

  const safeName = useMemo(() => {
    if (typeof employeeName === 'string' && employeeName.trim()) {
      return employeeName.trim();
    }
    return 'Employee';
  }, [employeeName]);

  const renderCard = (card, index) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const scale = scrollX.current?.interpolate
      ? scrollX.current.interpolate({
          inputRange,
          outputRange: [0.92, 1, 0.92],
          extrapolate: 'clamp',
        })
      : 1;

    const opacity = scrollX.current?.interpolate
      ? scrollX.current.interpolate({
          inputRange,
          outputRange: [0.6, 1, 0.6],
          extrapolate: 'clamp',
        })
      : 1;

    const translateY = scrollX.current?.interpolate
      ? scrollX.current.interpolate({
          inputRange,
          outputRange: [16, 0, 16],
          extrapolate: 'clamp',
        })
      : 0;

    return (
      <Animated.View
        key={card.id}
        style={[
          styles.carouselCard,
          {
            width: CARD_WIDTH,
            opacity,
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FAFAFA']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={card.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardHeaderGradient}
            >
              <View style={styles.cardPattern} />
              <View style={styles.cardIconWrapper}>
                <MaterialCommunityIcons
                  name={card.icon}
                  size={42}
                  color="#FFFFFF"
                />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => onCardAction?.(card.primaryAction.key)}
              >
                <LinearGradient
                  colors={card.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <MaterialCommunityIcons
                    name={card.primaryAction.icon}
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.primaryButtonText}>
                    {card.primaryAction.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {card.secondaryAction && (
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: card.accentColor + '40' }]}
                  activeOpacity={0.85}
                  onPress={() => onCardAction?.(card.secondaryAction.key)}
                >
                  <MaterialCommunityIcons
                    name={card.secondaryAction.icon}
                    size={18}
                    color={card.accentColor}
                  />
                  <Text style={[styles.secondaryButtonText, { color: card.accentColor }]}>
                    {card.secondaryAction.label}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderStatCard = (stat, index) => {
    return (
      <View key={index} style={styles.statCard}>
        <LinearGradient
          colors={['#FFFFFF', '#F3F4F6']}
          style={styles.statGradient}
        >
          <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
            <MaterialCommunityIcons name={stat.icon} size={28} color={stat.color} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Navbar
        onMenuPress={handleMenuPress}
        onOptionsPress={handleOptionsPress}
      />

      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View style={styles.headerSection}>
            <View style={styles.headerTopRow}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Welcome back, {safeName}
              </Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.profileCardWrapper,
              { transform: [{ translateY: slideInAnim }] },
            ]}
          >
            <LinearGradient
              colors={['#462556', '#6a3a7c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCard}
            >
              <View style={styles.profileCardRow}>
                <Image
                  source={require('../../assests/images/bus.jpg')}
                  style={styles.profileImageFull}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{safeName}</Text>
                  <Text
                    style={styles.profileDesignation}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {employeeDesignation}
                  </Text>
                  <View style={styles.profileStatus}>
                    <View style={styles.completionRing}>
                      <View style={styles.completionRingInner}>
                        <Text style={styles.completionPercent}>95%</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressMeta}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>{formatHours(weeklyAverage)}</Text>
                <Text style={styles.progressValueLabel}>Avg</Text>
              </View>
              <View style={styles.progressHighlight}>
                <Text style={styles.progressHighlightTime}>
                  {formatHours(featuredDay.hours)}
                </Text>
                <Text style={styles.progressHighlightLabel}>{featuredDay.day} focus</Text>
              </View>
            </View>
            <View style={styles.progressBars}>
              {WEEKLY_PROGRESS.map((item) => {
                const isActive = item.day === featuredDay.day;
                const fillHeight = maxWeeklyHours ? (item.hours / maxWeeklyHours) * 110 : 0;
                return (
                  <View key={item.day} style={styles.progressBarItem}>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { height: fillHeight },
                          isActive && styles.progressBarFillActive,
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.progressDayLabel,
                        isActive && styles.progressDayActive,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationBarContainer}
            onPress={handleAnnouncementPress}
            activeOpacity={0.85}
          >
            <View style={styles.notificationBar}>
              <Animated.View
                style={[
                  styles.notificationIcon,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <MaterialCommunityIcons name="bell-ring" size={22} color="#FFF" />
                {(notifications?.length || 0) > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {(notifications?.length || 0) > 99 ? '99+' : (notifications?.length || 0)}
                    </Text>
                  </View>
                )}
              </Animated.View>

              <View
                style={styles.notificationTextContainer}
                onLayout={(event) => {
                  const width = event.nativeEvent.layout.width;
                  setMarqueeSizes((prev) =>
                    prev.container === width ? prev : { ...prev, container: width }
                  );
                }}
              >
                <Animated.View
                  style={[
                    styles.notificationTextMarquee,
                    { transform: [{ translateX: marqueeTranslate }] },
                  ]}
                  onLayout={(event) => {
                    const width = event.nativeEvent.layout.width;
                    setMarqueeSizes((prev) =>
                      prev.content === width ? prev : { ...prev, content: width }
                    );
                  }}
                >
                  <Text style={styles.notificationTitle}>
                    {latestNotificationLoading ? 'Loading updates…' : announcementTitle}
                  </Text>
                </Animated.View>
              </View>

              <View style={styles.notificationChevron}>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#6366F1" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              {STATS_CARDS.map((stat, index) => renderStatCard(stat, index))}
            </View>
          </View>

          <View style={styles.actionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.carouselWrapper}>
              <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"
                snapToAlignment="start"
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX.current || scrollX } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                contentContainerStyle={styles.carouselContent}
              >
                {ACTION_CARDS.map((card, index) => renderCard(card, index))}
              </Animated.ScrollView>

              <View style={styles.paginationDots}>
                {ACTION_CARDS.map((card, index) => {
                  const inputRange = [
                    (index - 1) * (CARD_WIDTH + CARD_SPACING),
                    index * (CARD_WIDTH + CARD_SPACING),
                    (index + 1) * (CARD_WIDTH + CARD_SPACING),
                  ];

                  const width = scrollX.current?.interpolate
                    ? scrollX.current.interpolate({
                        inputRange,
                        outputRange: [8, 26, 8],
                        extrapolate: 'clamp',
                      })
                    : 8;

                  const opacity = scrollX.current?.interpolate
                    ? scrollX.current.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                      })
                    : 0.3;

                  return (
                    <Animated.View
                      key={card.id}
                      style={[styles.paginationDot, { width, opacity }]}
                    >
                      <LinearGradient
                        colors={card.gradientColors}
                        style={styles.dotGradient}
                      />
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        {sidebarOpen && (
          <TouchableOpacity
            style={styles.sidebarOverlay}
            activeOpacity={1}
            onPress={handleOverlayPress}
          >
            <TouchableOpacity
              style={styles.sidebarContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Sidebar
                isOpen={sidebarOpen}
                onMenuPress={handleSidebarMenuPress}
                variant="employee"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 15,
    marginTop: 15,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  sidebarContainer: {
    width: 280,
    height: '100%',
  },
  profileCardWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  profileCard: {
    padding: 15,
    borderRadius: 24,
  },
  profileCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 25,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    marginRight: -25,
    marginTop: -15,
  },
  profileDesignation: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginRight: 10,
    marginBottom: 16,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '85%',
  },
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  completionRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  completionRingInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionPercent: {
    fontSize: 20,
    fontWeight: '800',
    color: '#462556',
  },
  profileImageFull: {
    width: 170,
    height: 216,
    borderRadius: 28,
    resizeMode: 'cover',
  },
  notificationBarContainer: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  notificationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  notificationIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
    shadowColor: '#6366F1',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 14,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  notificationTextContainer: {
    flex: 1,
    paddingRight: 12,
    overflow: 'hidden',
  },
  notificationTextMarquee: {
    flexDirection: 'column',
    gap: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  notificationChevron: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F4FF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressMeta: {
    gap: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0B1C40',
  },
  progressValueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  progressHighlight: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  progressHighlightTime: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4338CA',
  },
  progressHighlightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  progressBarItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressBarTrack: {
    width: 16,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
    alignSelf: 'center',
  },
  progressBarFill: {
    width: '100%',
    backgroundColor: '#A5B4FC',
    borderRadius: 10,
  },
  progressBarFillActive: {
    backgroundColor: '#7C3AED',
  },
  progressDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  progressDayActive: {
    color: '#0B1C40',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F1F3',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667EEA',
  },
  carouselWrapper: {
    marginHorizontal: -20,
  },
  carouselContent: {
    paddingVertical: 12,
    paddingHorizontal: CARD_SPACING / 2,
  },
  carouselCard: {
    borderRadius: 24,
    marginHorizontal: CARD_SPACING / 2,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  cardHeader: {
    height: 140,
  },
  cardHeaderGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.2,
  },
  cardIconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 20,
    minHeight: 170,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
  },
  cardActions: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dotGradient: {
    flex: 1,
  },
});