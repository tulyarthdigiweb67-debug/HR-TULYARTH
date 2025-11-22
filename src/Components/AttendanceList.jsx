import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchEmployeeList } from '../redux/slices/employeeListSlice';
import { SkeletonBlock, SkeletonCircle } from './common/Skeleton';

const DEFAULT_AVATAR = require('../assests/images/avatar.jpg');

export default function AttendanceList({ onViewAttendance }) {
  const dispatch = useDispatch();
  const { items = [], loading } = useSelector((s) => s.employeeList || { items: [] });

  useEffect(() => {
    dispatch(fetchEmployeeList());
  }, [dispatch]);

  const cards = useMemo(() => {
    return (items || []).map((e) => ({
      id: String(e.employee_id || ''),
      name: `${e.employee_first_name || ''} ${e.employee_last_name || ''}`.trim() || '—',
      status: 'Active',
      photo: e.employee_photo
        ? { uri: `https://hr.tulyarthdigiweb.com/uploads/${e.employee_photo}` }
        : DEFAULT_AVATAR,
      employeeData: e, // Store full employee data for navigation
    }));
  }, [items]);

  const handleViewAttendance = (employee) => {
    if (onViewAttendance) {
      onViewAttendance(employee);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Icon name="groups" size={30} color="#F26A1B" />
          <Text style={styles.title}>Employee Directory</Text>
        </View>

        <View style={styles.subHeaderRow}>
          <View style={styles.fullWidthCounter}>
            <Icon name="people" size={20} color="#FFFFFF" />
            <Text style={styles.fullWidthCounterText}>{cards.length} Employees</Text>
          </View>
        </View>
      </View>

      {/* Cards Section */}
      <View style={styles.gridWrapper}>
        {loading && (
          <View style={styles.grid}>
            {[...Array(6)].map((_, idx) => (
              <View key={`card-sk-${idx}`} style={styles.card}>
                <View style={styles.avatarWrapper}>
                  <SkeletonCircle size={70} />
                </View>
                <SkeletonBlock style={{ height: 16, width: '60%', borderRadius: 8, alignSelf: 'center' }} />
                <View style={[styles.metaRow, { marginTop: 10, alignSelf: 'center' }]}>
                  <SkeletonBlock style={{ height: 12, width: 90, borderRadius: 6 }} />
                </View>
                <View style={[styles.statusPillRow, { backgroundColor: 'transparent' }]}>
                  <SkeletonBlock style={{ height: 18, width: 100, borderRadius: 999 }} />
                </View>
                <SkeletonBlock style={{ height: 36, width: '90%', borderRadius: 10, alignSelf: 'center', marginTop: 12 }} />
              </View>
            ))}
          </View>
        )}
        {!loading && cards.length === 0 && <Text style={styles.loadingText}>No employees found.</Text>}

        <View style={styles.grid}>
          {cards.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.avatarWrapper}>
                <Image source={c.photo} style={styles.avatar} />
                <View style={styles.statusDot} />
              </View>

              <Text style={styles.name} numberOfLines={1}>
                {c.name}
              </Text>

              <View style={styles.metaRow}>
                <Icon name="badge" size={14} color="#6B7280" />
                <Text style={styles.metaText}>ID: {c.id}</Text>
              </View>

              <View style={styles.statusPillRow}>
                <Icon name="verified" size={14} color="#10B981" />
                <Text style={styles.statusText}>{c.status}</Text>
              </View>

              <TouchableOpacity 
                style={styles.ctaBtn} 
                activeOpacity={0.9}
                onPress={() => handleViewAttendance(c.employeeData)}
              >
                <Icon name="visibility" size={16} color="#FFFFFF" />
                <Text style={styles.ctaText}>View Attendance</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const CARD_BG = '#FFFFFF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    alignItems: 'flex-start', // shifted left
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10,
  },
  subHeaderRow: {
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
  },
  fullWidthCounter: {
    width: '90%',
    backgroundColor: '#F26A1B',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fullWidthCounterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  gridWrapper: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16, // Added gap between rows
    columnGap: 12, // Added horizontal gap between cards
  },
  card: {
    width: '47%',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  statusDot: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 6,
  },
  metaText: {
    marginLeft: 4,
    color: '#4B5563',
    fontSize: 12,
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAFBF3',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 10,
  },
  statusText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  ctaBtn: {
    backgroundColor: '#F26A1B',
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 12,
  },
});
