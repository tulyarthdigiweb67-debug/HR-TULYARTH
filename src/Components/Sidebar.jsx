import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Sidebar({ isOpen, onMenuPress, employee, variant }) {
  const adminMenuConfig = [
    { type: 'item', id: 'dashboard', icon: 'space-dashboard', title: 'Dashboard' },
    {
      type: 'section',
      id: 'employee',
      icon: 'group',
      title: 'Employee',
      children: [
        { id: 'employee-add', icon: 'person-add', title: 'Add Employee' },
        { id: 'employee-list', icon: 'people', title: 'Employee List' },
      ],
    },
    {
      type: 'section',
      id: 'notification',
      icon: 'notifications-none',
      title: 'Notification',
      children: [
        { id: 'notification-add', icon: 'add-alert', title: 'Add Notification' },
        { id: 'notification-list', icon: 'list-alt', title: 'Notification List' },
      ],
    },
    {
      type: 'section',
      id: 'attendance',
      icon: 'event-available',
      title: 'Attendance',
      children: [
        { id: 'attendance-list', icon: 'assignment', title: 'Attendance List' },
        { id: 'attendance-all', icon: 'fact-check', title: 'All Attendance Record' },
      ],
    },
    {
      type: 'section',
      id: 'leave',
      icon: 'event-note',
      title: 'Leave',
      children: [{ id: 'leave-view', icon: 'description', title: 'View Leave' }],
    },
  ];

  // Employee sidebar – grouped like the provided UI, with more specific icons
  const employeeMenuConfig = [
    { type: 'item', id: 'dashboard', icon: 'space-dashboard', title: 'Dashboard' },
    { type: 'item', id: 'profile', icon: 'person', title: 'My Profile' },
    {
      type: 'section',
      id: 'attendance',
      icon: 'work-history',
      title: 'Attendance',
      children: [
        { id: 'attendance-add', icon: 'playlist-add-check', title: 'Add Attendance' },
        { id: 'attendance-my', icon: 'fact-check', title: 'My Attendance' },
      ],
    },
    {
      type: 'section',
      id: 'leave',
      icon: 'event-note',
      title: 'Leave',
      children: [
        { id: 'leave-apply', icon: 'post-add', title: 'Apply Leave' },
        { id: 'leave-view', icon: 'fact-check', title: 'View Leave' },
      ],
    },
    {
      type: 'section',
      id: 'notification',
      icon: 'notifications-none',
      title: 'Notification',
      children: [
        { id: 'notification-list', icon: 'list-alt', title: 'Notification List' },
      ],
    },
  ];

  const getInitialSections = (variantType) => ({
    employee: variantType !== 'employee',
    attendance: variantType === 'employee',
    leave: false,
    notification: false,
  });

  const [expandedSections, setExpandedSections] = useState(() => getInitialSections(variant));

  useEffect(() => {
    setExpandedSections((prev) => ({
      ...prev,
      ...getInitialSections(variant),
    }));
  }, [variant]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Get employee name
  const employeeName = employee
    ? `${employee.employee_first_name || ''} ${employee.employee_last_name || ''}`.trim() || 'Employee'
    : null;

  if (!isOpen) return null;

  const isEmployeeVariant = variant === 'employee';

  const currentMenuConfig = isEmployeeVariant ? employeeMenuConfig : adminMenuConfig;

  const renderMenu = () =>
    currentMenuConfig.map((item) => {
      if (item.type === 'item') {
        return (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => onMenuPress(item)}>
            <Icon name={item.icon} size={24} color="#f18f01" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        );
      }

      const expanded = expandedSections[item.id];

      return (
        <View key={item.id} style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.menuItem, expanded && styles.menuItemExpanded]}
            onPress={() => toggleSection(item.id)}
            activeOpacity={0.8}
          >
            <Icon name={item.icon} size={24} color="#f18f01" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.title}</Text>
            <Icon
              name={expanded ? 'expand-less' : 'expand-more'}
              size={22}
              color="#95A5A6"
              style={styles.expandIcon}
            />
          </TouchableOpacity>

          {expanded &&
            item.children?.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={styles.subMenuItem}
                onPress={() => onMenuPress(child)}
                activeOpacity={0.8}
              >
                <Icon name={child.icon} size={20} color="#f18f01" style={styles.subMenuIcon} />
                <Text style={styles.subMenuText}>{child.title}</Text>
              </TouchableOpacity>
            ))}
        </View>
      );
    });

  return (
    <View style={styles.sidebar}>
      <ScrollView
        style={styles.sidebarScroll}
        contentContainerStyle={styles.sidebarContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Employee Name Section */}
        {employeeName && (
          <View style={styles.employeeNameSection}>
            <Icon name="person" size={20} color="#F37438" style={styles.employeeIcon} />
            <Text style={styles.employeeName} numberOfLines={1}>{employeeName}</Text>
          </View>
        )}
        
        <Text style={styles.sidebarTitle}>MAIN MENU</Text>

        {renderMenu()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderColor: '#F1F1F1',
    borderWidth: 1,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarContent: {
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sidebarTitle: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 20,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  sectionContainer: {
    marginBottom: 4,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  menuItemExpanded: {
    backgroundColor: '#FFF9F4',
    borderColor: '#FBCFAA',
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 32,
    paddingRight: 18,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E5D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
    elevation: 1,
  },
  subMenuIcon: {
    marginRight: 12,
  },
  subMenuText: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
  employeeNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#F37438',
  },
  employeeIcon: {
    marginRight: 10,
  },
  employeeName: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
  },
});
