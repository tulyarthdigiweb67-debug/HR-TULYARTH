import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const defaultProfile = {
  name: 'Alex Morgan',
  role: 'Administrator',
  email: 'admin@hrms.com',
  phone: '+91 98765 43210',
  department: 'People Operations',
  avatar: null,
  stats: [
    { label: 'Teams Managed', value: 6, icon: 'group' },
    { label: 'Active Employees', value: 128, icon: 'supervisor-account' },
    { label: 'Pending Approvals', value: 12, icon: 'pending-actions' },
  ],
};

const actionItems = [
  {
    key: 'switch-to-hr',
    title: 'Switch to HR Login',
    subtitle: 'Login as HR to manage colleagues, shifts and leave.',
    icon: 'sync',
    actionKey: 'onSwitchToHr',
  },
  {
    key: 'admin-dashboard',
    title: 'Back to Admin Dashboard',
    subtitle: 'Return to the overview of the entire organisation.',
    icon: 'dashboard',
    actionKey: 'onBack',
  },
  {
    key: 'logout',
    title: 'Logout as Admin',
    subtitle: 'Securely sign out of the admin workspace.',
    icon: 'logout',
    actionKey: 'onSignOut',
    destructive: true,
  },
];

export default function ProfileScreen({
  profile = defaultProfile,
  onBack,
  onSignOut,
  onSwitchToHr,
}) {
  const handleAction = (item) => {
    switch (item.actionKey) {
      case 'onBack':
        onBack?.();
        break;
      case 'onSignOut':
        onSignOut?.();
        break;
      case 'onSwitchToHr':
        onSwitchToHr?.();
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.75}
            onPress={onBack}
          >
            <Icon name="arrow-back-ios" size={22} color="#1B2430" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerIconPlaceholder} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={profile.avatar} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {profile.name
                    .split(' ')
                    .map((word) => word[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.role}>{profile.role}</Text>

          <View style={styles.divider} />

          <View style={styles.infoList}>
            <View style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <Icon name="email" size={18} color="#E95420" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{profile.email}</Text>
              </View>
            </View>
            <View style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <Icon name="call" size={18} color="#E95420" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{profile.phone}</Text>
              </View>
            </View>
            <View style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <Icon name="apartment" size={18} color="#E95420" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Department</Text>
                <Text style={styles.contactValue}>{profile.department}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            {profile.stats?.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Icon name={stat.icon} size={22} color="#E95420" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionList}>
            {actionItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.actionCard,
                  item.destructive && styles.actionCardDestructive,
                ]}
                activeOpacity={0.8}
                onPress={() => handleAction(item)}
              >
                <View style={styles.actionIcon}>
                  <Icon
                    name={item.icon}
                    size={24}
                    color={item.destructive ? '#C03528' : '#1B2430'}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[
                      styles.actionTitle,
                      item.destructive && styles.actionTitleDestructive,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={24}
                  color={item.destructive ? '#C03528' : '#8692A6'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  headerIconPlaceholder: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B2430',
  },
  profileCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0F1828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 16,
    backgroundColor: '#FCEDEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FDE2D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E95420',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B2430',
  },
  role: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#8692A6',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EEF1F6',
    marginVertical: 16,
  },
  infoList: {
    width: '100%',
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEDE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    color: '#7A8798',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  contactValue: {
    color: '#2F3A4A',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    marginHorizontal: 24,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1B2430',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 108,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0F1828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B2430',
    marginTop: 4,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 13,
    textAlign: 'center',
    color: '#5C6D82',
  },
  actionList: {
    marginHorizontal: 18,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#0F1828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  actionCardDestructive: {
    backgroundColor: '#FDECEA',
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6F9',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B2430',
  },
  actionTitleDestructive: {
    color: '#C03528',
  },
  actionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#5C6D82',
    lineHeight: 18,
  },
});


