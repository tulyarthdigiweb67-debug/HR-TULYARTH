import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeList } from '../redux/slices/employeeListSlice';
import { fetchEmployeeLeaveList } from '../redux/slices/employeeLeaveListSlice';

const getInitials = (value = '') => {
  const sanitized = value.trim();
  if (!sanitized) return 'NA';
  const parts = sanitized.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatEmployeeName = employee => {
  const first = employee?.employee_first_name?.trim() || '';
  const last = employee?.employee_last_name?.trim() || '';
  const combined = `${first} ${last}`.trim();
  return combined || employee?.employee_name || 'Unknown';
};

const normalize = text => (text || '').trim().toLowerCase();

const buildEmployeeMeta = employee => ({
  id: String(employee?.employee_id ?? `${employee?.employee_first_name ?? 'emp'}-${employee?.employee_last_name ?? 'name'}`),
  name: formatEmployeeName(employee),
  designation: employee?.employee_designation || employee?.employee_title || '—',
  department: employee?.employee_department || employee?.employee_company || '—',
});

const buildLeaveMeta = (leave, index) => {
  const label = leave?.l_name?.trim() || 'Unknown Employee';
  return {
    id: String(leave?.l_id ?? `leave-${index}`),
    name: label,
    designation: leave?.l_designation || leave?.l_department || '—',
    reason: leave?.l_purpose || 'On Approved Leave',
    range: [leave?.l_from_date, leave?.l_to_date].filter(Boolean).join(' • '),
    normalizedName: normalize(label),
  };
};

export default function EmployeeAttendancePresentAbesent({ onBack }) {
  const dispatch = useDispatch();
  const {
    items: employeeItems = [],
    loading: employeeLoading = false,
  } = useSelector(state => state.employeeList || { items: [], loading: false });
  const {
    items: leaveItems = [],
    loading: leaveLoading = false,
  } = useSelector(state => state.employeeLeaveList || { items: [], loading: false });

  useEffect(() => {
    if (!employeeItems || employeeItems.length === 0) {
      dispatch(fetchEmployeeList());
    }
  }, [dispatch, employeeItems?.length]);

  useEffect(() => {
    if (!leaveItems || leaveItems.length === 0) {
      dispatch(fetchEmployeeLeaveList());
    }
  }, [dispatch, leaveItems?.length]);

  const today = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    return base;
  }, []);

  const employeesOnLeave = useMemo(() => {
    return (leaveItems || [])
      .filter(leave => {
        if (!leave?.l_from_date || !leave?.l_to_date) return false;
        try {
          const fromDate = new Date(leave.l_from_date);
          const toDate = new Date(leave.l_to_date);
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);
          return today >= fromDate && today <= toDate;
        } catch (error) {
          return false;
        }
      })
      .map(buildLeaveMeta);
  }, [leaveItems, today]);

  const presentEmployees = useMemo(() => {
    if (!employeeItems || employeeItems.length === 0) return [];
    const absentSet = new Set(employeesOnLeave.map(record => record.normalizedName));
    return employeeItems
      .map(buildEmployeeMeta)
      .filter(employee => !absentSet.has(normalize(employee.name)));
  }, [employeeItems, employeesOnLeave]);

  const absentEmployees = useMemo(() => employeesOnLeave, [employeesOnLeave]);

  const totalEmployees = employeeItems?.length || 0;
  const absentCount = employeesOnLeave.length;
  const presentCount = presentEmployees.length;
  const utilisation = totalEmployees === 0 ? 0 : Math.round((presentCount / totalEmployees) * 100);

  const safeTotal = totalEmployees || 1;
  const presentPercentage = totalEmployees === 0 ? 0 : Math.round((presentCount / safeTotal) * 100);
  const absentPercentage = totalEmployees === 0 ? 0 : Math.round((absentCount / safeTotal) * 100);

  const insightCards = useMemo(
    () => [
      {
        label: 'Total Staff',
        value: totalEmployees,
        subLabel: 'Active records',
        icon: 'account-group-outline',
        accent: '#475569',
        progress: 1,
      },
      {
        label: 'Present',
        value: presentCount,
        subLabel: `${presentPercentage}% of workforce`,
        icon: 'account-check-outline',
        accent: '#0EA5E9',
        progress: presentCount / safeTotal,
      },
      {
        label: 'Absent / Leave',
        value: absentCount,
        subLabel: `${absentPercentage}% away`,
        icon: 'account-alert-outline',
        accent: '#F97316',
        progress: absentCount / safeTotal,
      },
      {
        label: 'Utilisation',
        value: `${utilisation}%`,
        subLabel: 'Operational coverage',
        icon: 'progress-check',
        accent: '#10B981',
        progress: utilisation / 100,
      },
    ],
    [totalEmployees, presentCount, absentCount, utilisation, presentPercentage, absentPercentage, safeTotal]
  );

  const loading = employeeLoading || leaveLoading;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderEmployeeRow = (employee, variant = 'present') => (
    <View key={employee.id} style={styles.employeeRow}>
      <View style={[styles.employeeAvatar, variant === 'absent' && styles.employeeAvatarAbsent]}>
        <Text style={styles.employeeAvatarText}>{getInitials(employee.name)}</Text>
      </View>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{employee.name}</Text>
        <Text style={styles.employeeMeta}>
          {employee.designation}
          {employee.department && employee.department !== '—' ? ` • ${employee.department}` : ''}
        </Text>
        {variant === 'absent' && employee.range ? (
          <Text style={styles.employeeRange}>{employee.range}</Text>
        ) : null}
      </View>
      <View
        style={[
          styles.statusPill,
          variant === 'present' ? styles.statusPillPresent : styles.statusPillAbsent,
        ]}
      >
        <Text
          style={[
            styles.statusPillText,
            variant === 'present' ? styles.statusPillTextPresent : styles.statusPillTextAbsent,
          ]}
        >
          {variant === 'present' ? 'Present' : 'On leave'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#F0896B', '#E2533F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <MaterialCommunityIcons name="chevron-left" size={22} color="#33150F" />
            </TouchableOpacity>
            <View style={styles.heroStatus}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color="#FFD8C7" />
              <Text style={styles.heroStatusText}>Secure sync</Text>
            </View>
          </View>

          <View style={styles.heroTitleBlock}>
            <Text style={styles.heroEyebrow}>Operations</Text>
            <Text style={styles.heroTitle}>Employee Attendance</Text>
             <Text style={styles.heroSubtitle}>
              Track and monitor daily employee attendance
             </Text>
          </View>

          <View style={styles.heroInsightRow}>
            <View style={styles.heroInsightCard}>
              <Text style={styles.heroInsightLabel}>Present</Text>
              <Text style={styles.heroInsightValue}>{presentCount}</Text>
              <Text style={styles.heroInsightMeta}>{presentPercentage}% active</Text>
            </View>
            <View style={[styles.heroInsightCard, styles.heroInsightCardMuted]}>
              <Text style={styles.heroInsightLabel}>Absent</Text>
              <Text style={styles.heroInsightValue}>{absentCount}</Text>
              <Text style={styles.heroInsightMeta}>{absentPercentage}% away</Text>
            </View>
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.heroFooterRow}>
               <MaterialCommunityIcons name="calendar-today" size={16} color="#FFD0C0" />
              <Text style={styles.heroFooterText}>
                {today.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.heroFooterRow}>
               <MaterialCommunityIcons name="refresh" size={16} color="#FFD0C0" />
              <Text style={styles.heroFooterText}>Synced {timestamp}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          {insightCards.map(card => {
            const progress = Math.min(1, Math.max(0, card.progress || 0));
            return (
              <View key={card.label} style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <View style={[styles.statDot, { backgroundColor: card.accent }]} />
                  <Text style={styles.statLabel}>{card.label}</Text>
                  <MaterialCommunityIcons name={card.icon} size={18} color="#94A3B8" />
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statSubLabel}>{card.subLabel}</Text>
                <View style={styles.statProgress}>
                  <View style={[styles.statProgressFill, { flex: progress, backgroundColor: card.accent }]} />
                  <View style={{ flex: Math.max(0.0001, 1 - progress) }} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.segmentCard}>
          <View style={styles.segmentHeader}>
            <View>
              <Text style={styles.segmentTitle}>Headcount health</Text>
              <Text style={styles.segmentSubtitle}>Updated {timestamp}</Text>
            </View>
            <View style={styles.segmentBadge}>
              <MaterialCommunityIcons name="chart-line" size={14} color="#0F172A" />
              <Text style={styles.segmentBadgeText}>{utilisation}%</Text>
            </View>
          </View>
          <View style={styles.segmentMetrics}>
            <View style={styles.segmentMetric}>
              <Text style={styles.segmentMetricLabel}>Coverage</Text>
              <Text style={styles.segmentMetricValue}>{presentCount}</Text>
              <Text style={styles.segmentMetricMeta}>on site</Text>
            </View>
            <View style={styles.segmentMetricDivider} />
            <View style={styles.segmentMetric}>
              <Text style={styles.segmentMetricLabel}>Away today</Text>
              <Text style={styles.segmentMetricValue}>{absentCount}</Text>
              <Text style={styles.segmentMetricMeta}>planned or unplanned</Text>
            </View>
          </View>
          <View style={styles.segmentProgressBar}>
            <View style={[styles.segmentProgressPresent, { flex: presentCount || 0 }]} />
            <View style={[styles.segmentProgressAbsent, { flex: absentCount || 0 }]} />
          </View>
          <View style={styles.segmentLegendRow}>
            <View style={styles.segmentLegendItem}>
              <View style={[styles.segmentLegendDot, { backgroundColor: '#0EA5E9' }]} />
              <Text style={styles.segmentLegendText}>Present</Text>
            </View>
            <View style={styles.segmentLegendItem}>
              <View style={[styles.segmentLegendDot, { backgroundColor: '#F97316' }]} />
              <Text style={styles.segmentLegendText}>Absent</Text>
            </View>
          </View>
        </View>

        <View style={styles.listGrid}>
          <View style={[styles.listSection, styles.listSectionPresent]}>
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.listTitle}>Present Employees</Text>
                <Text style={styles.listSubtitle}>Checked-in roster</Text>
              </View>
              <View style={[styles.countBadge, styles.countBadgePresent]}>
                <Text style={styles.countBadgeText}>{presentCount}</Text>
              </View>
            </View>
            {loading ? (
              <Text style={styles.loadingText}>Fetching latest attendance...</Text>
            ) : presentEmployees.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="tray-alert" size={20} color="#94A3B8" />
                <Text style={styles.emptyStateText}>No employees marked present yet</Text>
              </View>
            ) : (
              presentEmployees.slice(0, 20).map(employee => renderEmployeeRow(employee, 'present'))
            )}
          </View>

          <View style={[styles.listSection, styles.listSectionAbsent]}>
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.listTitle}>Absent / On Leave</Text>
                <Text style={styles.listSubtitle}>Pulled from approved leave</Text>
              </View>
              <View style={[styles.countBadge, styles.countBadgeAbsent]}>
                <Text style={styles.countBadgeText}>{absentCount}</Text>
              </View>
            </View>
            {loading ? (
              <Text style={styles.loadingText}>Checking leave roster...</Text>
            ) : absentEmployees.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={20} color="#94A3B8" />
                <Text style={styles.emptyStateText}>Nobody is on leave today</Text>
              </View>
            ) : (
              absentEmployees.slice(0, 20).map(employee => renderEmployeeRow(employee, 'absent'))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4ECE7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F0B48A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(51, 21, 15, 0.25)',
    gap: 6,
  },
  heroStatusText: {
    color: '#FFE5D9',
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  heroTitleBlock: {
    marginBottom: 18,
  },
  heroEyebrow: {
    color: '#FFE1D2',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#200C08',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#3E1E17',
    lineHeight: 20,
  },
  heroInsightRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 18,
  },
  heroInsightCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFF6F1',
    borderWidth: 1,
    borderColor: '#F09D79',
  },
  heroInsightCardMuted: {
    backgroundColor: '#FDE8DD',
    borderColor: '#F2AB8A',
  },
  heroInsightLabel: {
    color: '#8C3A24',
    fontSize: 12,
    letterSpacing: 1,
  },
  heroInsightValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2A120C',
    marginVertical: 6,
  },
  heroInsightMeta: {
    fontSize: 13,
    color: '#7C3F2B',
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroFooterText: {
    fontSize: 13,
    color: '#FFE5D9',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexBasis: '48%',
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statLabel: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 13,
    color: '#8A5A45',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3B1C12',
  },
  statSubLabel: {
    fontSize: 13,
    color: '#A06C53',
    marginBottom: 12,
  },
  statProgress: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  statProgressFill: {
    borderRadius: 3,
  },
  segmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F5D8BF',
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  segmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B1C12',
  },
  segmentSubtitle: {
    fontSize: 13,
    color: '#A06C53',
  },
  segmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE9DA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  segmentBadgeText: {
    fontSize: 13,
    color: '#7A4127',
    fontWeight: '700',
  },
  segmentMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  segmentMetric: {
    flex: 1,
  },
  segmentMetricLabel: {
    fontSize: 13,
    color: '#B57A58',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  segmentMetricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B1C12',
    marginVertical: 6,
  },
  segmentMetricMeta: {
    fontSize: 13,
    color: '#8A5A45',
  },
  segmentMetricDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  segmentProgressBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  segmentProgressPresent: {
    backgroundColor: '#FF9F6E',
  },
  segmentProgressAbsent: {
    backgroundColor: '#F6C37C',
  },
  segmentLegendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segmentLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  segmentLegendText: {
    fontSize: 12,
    color: '#8A5A45',
  },
  listGrid: {
    gap: 18,
  },
  listSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listSectionPresent: {
    borderColor: 'rgba(255, 159, 110, 0.35)',
  },
  listSectionAbsent: {
    borderColor: 'rgba(246, 195, 124, 0.45)',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  listSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  countBadge: {
    minWidth: 44,
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgePresent: {
    backgroundColor: 'rgba(255, 159, 110, 0.2)',
  },
  countBadgeAbsent: {
    backgroundColor: 'rgba(246, 195, 124, 0.25)',
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 159, 110, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  employeeAvatarAbsent: {
    backgroundColor: 'rgba(246, 195, 124, 0.4)',
  },
  employeeAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  employeeMeta: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  employeeRange: {
    fontSize: 12,
    color: '#F97316',
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillPresent: {
    backgroundColor: '#ECFEFF',
  },
  statusPillAbsent: {
    backgroundColor: '#FFF7ED',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusPillTextPresent: {
    color: '#0E7490',
  },
  statusPillTextAbsent: {
    color: '#C2410C',
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});






