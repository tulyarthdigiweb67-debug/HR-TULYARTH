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
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

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

export default function EmployeeDashboard({
  employeeName = 'John Doe',
  notificationsCount = 0,
  onCardAction,
  onAnnouncementsPress,
  onRequestSignOut,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const marqueeAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(-100)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(marqueeAnim, {
          toValue: -200,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(marqueeAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [marqueeAnim]);

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
            <Text style={styles.headerTitle}> Employee Dashboard</Text>
           
          </View>

          <Animated.View
            style={[
              styles.welcomeBanner,
              { transform: [{ translateY: slideInAnim }] },
            ]}
          >
            <LinearGradient
              colors={['#462556', '#6a3a7c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeGradient}
            >
              <View style={styles.welcomeTopDecor} />
              <View style={styles.welcomeContent}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={require('../../assests/images/avatar.jpg')}
                    style={styles.welcomeAvatar}
                  />
                  <View style={styles.statusIndicator} />
                </View>
                <View style={styles.welcomeTextBlock}>
                  <Text style={styles.welcomeGreeting}>
                    Welcome back,
                  </Text>
                  <Text style={styles.welcomeSubtitle}>
                   Here's what's happening with your workspace today
                  </Text>
                  <View style={styles.quickStatus}>
                 
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <TouchableOpacity
            style={styles.announcementBar}
            onPress={onAnnouncementsPress}
            activeOpacity={0.85}
          >
            <View style={styles.announcementContent}>
              <Animated.View
                style={[
                  styles.announcementIcon,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E72']}
                  style={styles.iconGradient}
                >
                  <MaterialCommunityIcons name="bell-badge-outline" size={20} color="#fff" />
                  {notificationsCount > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {notificationsCount > 99 ? '99+' : notificationsCount}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>

              <View style={styles.announcementText}>
                <Animated.View
                  style={[
                    { transform: [{ translateX: marqueeAnim }] },
                  ]}
                >
                  <Text style={styles.announcementTitle}>New Updates Available</Text>
                  <Text style={styles.announcementDesc}>
                    Check out the latest announcements from HR
                  </Text>
                </Animated.View>
              </View>

              <MaterialCommunityIcons name="chevron-right" size={24} color="#667EEA" />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
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
  welcomeBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  welcomeGradient: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeTopDecor: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  avatarContainer: {
    marginRight: 18,
    position: 'relative',
  },
  welcomeAvatar: {
    width: 70,
    height: 70,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  welcomeTextBlock: {
    flex: 1,
  },
  welcomeGreeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 10,
  },
  quickStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  announcementBar: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  announcementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#F0F1F3',
  },
  announcementIcon: {
    marginRight: 14,
  },
  iconGradient: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FBBF24',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  countText: {
    color: '#78350F',
    fontSize: 10,
    fontWeight: '800',
  },
  announcementText: {
    flex: 1,
    marginRight: 12,
    overflow: 'hidden',
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  announcementDesc: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
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