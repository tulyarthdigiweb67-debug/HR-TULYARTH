import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Sidebar({ isOpen, onMenuPress, employee, variant }) {
  // Default (admin/HR) flat menu
  const adminMenuItems = [
    { id: 1, icon: 'dashboard', title: 'Dashboard' },
    { id: 2, icon: 'person-add', title: 'Add Employee' },
    { id: 3, icon: 'people', title: 'Employee List' },
    { id: 7, icon: 'add-alert', title: 'Add Notification' },
    { id: 4, icon: 'notifications', title: 'Notification List' },
    { id: 5, icon: 'access-time', title: 'Add Attendance' },
    { id: 6, icon: 'event-busy', title: 'Leave Application' },
    { id: 8, icon: 'event-note', title: 'Employee Leave List' },
    { id: 9, icon: 'groups', title: 'Attendance List' },
    { id: 10, icon: 'calendar-today', title: 'My Attendance' },
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

  const [expandedSections, setExpandedSections] = useState({
    attendance: true,
    leave: false,
    notification: false,
  });

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

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarContent}>
        {/* Employee Name Section */}
        {employeeName && (
          <View style={styles.employeeNameSection}>
            <Icon name="person" size={20} color="#F37438" style={styles.employeeIcon} />
            <Text style={styles.employeeName} numberOfLines={1}>{employeeName}</Text>
          </View>
        )}
        
        <Text style={styles.sidebarTitle}>MAIN MENU</Text>

        {isEmployeeVariant ? (
          <>
            {employeeMenuConfig.map((item) => {
              if (item.type === 'item') {
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => onMenuPress(item)}
                  >
                    <Icon name={item.icon} size={24} color="#F37438" style={styles.menuIcon} />
                    <Text style={styles.menuText}>{item.title}</Text>
                  </TouchableOpacity>
                );
              }

              const expanded = expandedSections[item.id];

              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      expanded && styles.menuItemExpanded,
                    ]}
                    onPress={() => toggleSection(item.id)}
                  >
                    <Icon name={item.icon} size={24} color="#F37438" style={styles.menuIcon} />
                    <Text style={styles.menuText}>{item.title}</Text>
                    <Icon
                      name={expanded ? 'expand-less' : 'expand-more'}
                      size={22}
                      color="#7F8C8D"
                      style={styles.expandIcon}
                    />
                  </TouchableOpacity>

                  {expanded && item.children?.map((child) => (
                    <TouchableOpacity
                      key={child.id}
                      style={styles.subMenuItem}
                      onPress={() => onMenuPress(child)}
                    >
                      <Icon
                        name={child.icon}
                        size={22}
                        color="#F37438"
                        style={styles.subMenuIcon}
                      />
                      <Text style={styles.subMenuText}>{child.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
          </>
        ) : (
          adminMenuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => onMenuPress(item)}
            >
              <Icon name={item.icon} size={24} color="#F37438" style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: '#fff',
    paddingTop: 0,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  sidebarContent: {
    paddingTop: 30,
    paddingHorizontal: 16,
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
    backgroundColor: '#F9F9F9',
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
    backgroundColor: '#FFF7F2',
    borderWidth: 1,
    borderColor: '#FCD9C2',
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
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: '#FFF7F2',
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
