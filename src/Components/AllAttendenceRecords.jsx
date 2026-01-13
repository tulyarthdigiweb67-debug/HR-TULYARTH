import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAttendanceRecords } from '../redux/slices/allAttendanceRecordSlice';

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
      >
        <Text
          style={value ? styles.dropdownValueText : styles.dropdownPlaceholderText}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#64748B" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdownCard}>
            <FlatList
              data={options}
              keyExtractor={(item, idx) => `${item.value}-${idx}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    value === item.value && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      value === item.value && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.dropdownSeparator} />}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Month Picker Component
const MonthPicker = ({ value, onChange, placeholder }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const formatMonth = (date) => {
    if (!date) return placeholder;
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${month}, ${year}`;
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleThisMonth = () => {
    const today = new Date();
    onChange(today);
    setShowPicker(false);
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const currentYear = tempDate.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <View>
      <TouchableOpacity
        style={styles.datePickerTrigger}
        activeOpacity={0.8}
        onPress={() => setShowPicker(true)}
      >
        <Text
          style={value ? styles.datePickerValueText : styles.datePickerPlaceholderText}
          numberOfLines={1}
        >
          {formatMonth(value)}
        </Text>
        <MaterialCommunityIcons name="calendar-month" size={20} color="#64748B" />
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.monthPickerBackdrop}>
          <View style={styles.monthPickerCard}>
            {/* Year Selector */}
            <View style={styles.yearSelector}>
              <TextInput
                style={styles.yearInput}
                value={String(tempDate.getFullYear())}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const year = parseInt(text) || currentYear;
                  const newDate = new Date(tempDate);
                  newDate.setFullYear(year);
                  setTempDate(newDate);
                }}
              />
            </View>

            {/* Month Grid */}
            <View style={styles.monthGrid}>
              {months.map((month, index) => {
                const isSelected = tempDate.getMonth() === index;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.monthButton,
                      isSelected && styles.monthButtonSelected,
                    ]}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setMonth(index);
                      setTempDate(newDate);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthButtonText,
                        isSelected && styles.monthButtonTextSelected,
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.monthPickerActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  onChange(null);
                  setShowPicker(false);
                }}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.thisMonthButton}
                onPress={handleThisMonth}
              >
                <Text style={styles.thisMonthButtonText}>This month</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const STATUS_META = {
  p: { label: 'Present', gradient: ['#10B981', '#059669'], icon: 'check-circle' },
  a: { label: 'Absent', gradient: ['#F97316', '#EA580C'], icon: 'alert-circle' },
  h: { label: 'Half Day', gradient: ['#FACC15', '#EAB308'], icon: 'clock-alert' },
  l: { label: 'On Leave', gradient: ['#60A5FA', '#2563EB'], icon: 'airplane' },
  default: { label: 'Not Marked', gradient: ['#94A3B8', '#64748B'], icon: 'help-circle' },
};

const getInitials = (value = '') => {
  const chunks = value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() || '');
  if (chunks.length === 0) return 'NA';
  if (chunks.length === 1) return chunks[0].slice(0, 2);
  return `${chunks[0]}${chunks[chunks.length - 1]}`;
};

const parseRecordDate = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export default function AllAttendenceRecords() {
  const dispatch = useDispatch();
  const {
    items: apiItems = [],
    loading,
    error,
  } = useSelector((state) => state.allAttendanceRecords || {});

  const [attendanceStatus, setAttendanceStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [specificDate, setSpecificDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSpecificDate, setTempSpecificDate] = useState(new Date());
  const [appliedFilters, setAppliedFilters] = useState({
    attendanceStatus: 'all',
    month: null,
    specificDate: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  useEffect(() => {
    dispatch(fetchAllAttendanceRecords());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAllAttendanceRecords());
  };

  const attendanceStatusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Present', value: 'p' },
    { label: 'Absent', value: 'a' },
    { label: 'On Leave', value: 'l' },
    { label: 'Half Day', value: 'h' },
  ];

  const normalizedRecords = useMemo(() => {
    if (!Array.isArray(apiItems)) return [];
    return apiItems.map((item, index) => {
      const recordDate = parseRecordDate(item?.date);
      const statusCode = (item?.a_status || '').toLowerCase();
      const statusInfo = STATUS_META[statusCode] || STATUS_META.default;
      return {
        id: `${item?.employee_id || 'emp'}-${item?.date || index}`,
        sno: index + 1,
        employee: item?.name || 'Unknown Employee',
        initials: getInitials(item?.name || 'Unknown'),
        designation: item?.designation || '-',
        department: item?.department || '-',
        date: item?.date || '',
        recordDate,
        checkIn: item?.a_time_in || '-',
        checkOut: item?.a_time_out || '-',
        statusCode,
        statusLabel: statusInfo.label,
        statusGradient: statusInfo.gradient,
        statusIcon: statusInfo.icon,
        employeeId: item?.employee_id ?? '--',
      };
    });
  }, [apiItems]);

  const filteredRecords = useMemo(() => {
    return normalizedRecords.filter((record) => {
      const matchesStatus =
        appliedFilters.attendanceStatus === 'all' ||
        record.statusCode === appliedFilters.attendanceStatus;

      const matchesMonth = !appliedFilters.month
        ? true
        : record.recordDate &&
          record.recordDate.getMonth() === appliedFilters.month.getMonth() &&
          record.recordDate.getFullYear() === appliedFilters.month.getFullYear();

      const matchesDate = !appliedFilters.specificDate
        ? true
        : record.recordDate &&
          record.recordDate.toDateString() === appliedFilters.specificDate.toDateString();

      return matchesStatus && matchesMonth && matchesDate;
    });
  }, [normalizedRecords, appliedFilters]);

  const totalRecords = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);
  const disablePrev = currentPage === 1 || totalRecords === 0;
  const disableNext = currentPage === totalPages || totalRecords === 0;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const summaryStats = useMemo(() => {
    return apiItems.reduce(
      (acc, item) => {
        const code = (item?.a_status || '').toLowerCase();
        acc.total += 1;
        if (code === 'p') acc.present += 1;
        else if (code === 'a') acc.absent += 1;
        else if (code === 'h') acc.halfDay += 1;
        else if (code === 'l') acc.onLeave += 1;
        else acc.other += 1;
        return acc;
      },
      { total: 0, present: 0, absent: 0, halfDay: 0, onLeave: 0, other: 0 }
    );
  }, [apiItems]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatSpecificDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setSpecificDate(selectedDate);
      }
    } else {
      // iOS
      if (selectedDate) {
        setTempSpecificDate(selectedDate);
        setSpecificDate(selectedDate);
      }
    }
  };

  const handleConfirmDate = () => {
    setSpecificDate(tempSpecificDate);
    setShowDatePicker(false);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      attendanceStatus,
      month: selectedMonth,
      specificDate,
    });
    setCurrentPage(1);
  };

  const handleResetAll = () => {
    setAttendanceStatus('all');
    setSelectedMonth(null);
    setSpecificDate(null);
    setAppliedFilters({
      attendanceStatus: 'all',
      month: null,
      specificDate: null,
    });
    setCurrentPage(1);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - Enhanced */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Decorative circles */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <MaterialCommunityIcons
                    name="chart-box"
                    size={36}
                    color="#667EEA"
                  />
                </View>
              </View>
              
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>All Attendance Records</Text>
                <View style={styles.subtitleContainer}>
                  <View style={styles.subtitleDot} />
                  <Text style={styles.headerSubtitle}>
                    Filter and view employee attendance data
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Filter Options Section */}
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <View style={styles.filterHeaderLeft}>
              <View style={styles.filterHeaderAccent} />
              <MaterialCommunityIcons
                name="filter-variant"
                size={20}
                color="#667EEA"
              />
              <Text style={styles.filterTitle}>Filter Options</Text>
            </View>
          </View>

          <View style={styles.filterContent}>
            {/* Attendance Status Filter */}
            <View style={styles.filterField}>
              <View style={styles.filterLabelContainer}>
                <View style={styles.filterLabelBullet} />
                <Text style={styles.filterLabel}>Attendance Status</Text>
              </View>
              <CustomDropdown
                value={attendanceStatus}
                onChange={setAttendanceStatus}
                placeholder="All Status"
                options={attendanceStatusOptions}
              />
            </View>

            {/* Select Month Filter */}
            <View style={styles.filterField}>
              <View style={styles.filterLabelContainer}>
                <View style={styles.filterLabelBullet} />
                <Text style={styles.filterLabel}>Select Month</Text>
              </View>
              <MonthPicker
                value={selectedMonth}
                onChange={setSelectedMonth}
                placeholder="--------, ----"
              />
            </View>

            {/* Specific Date Filter */}
            <View style={styles.filterField}>
              <View style={styles.filterLabelContainer}>
                <View style={styles.filterLabelBullet} />
                <Text style={styles.filterLabel}>Specific Date</Text>
              </View>
              <TouchableOpacity
                style={styles.datePickerTrigger}
                activeOpacity={0.8}
                onPress={() => {
                  setTempSpecificDate(specificDate || new Date());
                  setShowDatePicker(true);
                }}
              >
                <Text
                  style={
                    specificDate
                      ? styles.datePickerValueText
                      : styles.datePickerPlaceholderText
                  }
                >
                  {specificDate ? formatSpecificDate(specificDate) : 'dd-mm-yyyy'}
                </Text>
                <MaterialCommunityIcons name="calendar" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.applyButton}
                activeOpacity={0.8}
                onPress={handleApplyFilters}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.applyButtonGradient}
                >
                  <MaterialCommunityIcons
                    name="magnify"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                activeOpacity={0.8}
                onPress={handleResetAll}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={18}
                  color="#667EEA"
                />
                <Text style={styles.resetButtonText}>Reset All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Results Summary Section */}
        <View style={styles.resultsCard}>
          <View style={styles.resultsContent}>
            {loading ? (
              <>
                <ActivityIndicator color="#667EEA" size="small" />
                <Text style={styles.resultsText}>Loading attendance records...</Text>
              </>
            ) : (
              <>
                <Text style={styles.resultsText}>
                  {totalRecords > 0
                    ? `Showing ${totalRecords} record${totalRecords === 1 ? '' : 's'}`
                    : 'No records match your filters'}
                </Text>
                <Text style={styles.resultsCount}>
                  {summaryStats.total} total entr{summaryStats.total === 1 ? 'y' : 'ies'}
                </Text>
              </>
            )}
            {!loading && error && (
              <Text style={styles.resultsError}>Unable to refresh data. Please try again.</Text>
            )}
          </View>
          <TouchableOpacity style={styles.refreshButton} activeOpacity={0.85} onPress={handleRefresh}>
            <MaterialCommunityIcons name="reload" size={18} color="#667EEA" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Attendance Records Table */}
        <View style={styles.tableCard}>
          {/* Table Header with Stats */}
          <View style={styles.tableTopBar}>
            <View style={styles.tableTopLeft}>
              <MaterialCommunityIcons name="table" size={22} color="#667EEA" />
              <Text style={styles.tableTopTitle}>Attendance Records</Text>
            </View>
            <View style={styles.tableStatsRow}>
              <View style={[styles.statBadge, styles.presentStatBadge]}>
                <MaterialCommunityIcons name="account-check" size={16} color="#10B981" />
                <Text style={[styles.statText, styles.presentStatText]}>
                  {summaryStats.present} Present
                </Text>
              </View>
              <View style={[styles.statBadge, styles.absentStatBadge]}>
                <MaterialCommunityIcons name="account-cancel" size={16} color="#EF4444" />
                <Text style={[styles.statText, styles.absentStatText]}>
                  {summaryStats.absent} Absent
                </Text>
              </View>
              <View style={[styles.statBadge, styles.halfDayStatBadge]}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#F97316" />
                <Text style={[styles.statText, styles.halfDayStatText]}>
                  {summaryStats.halfDay} Half Day
                </Text>
              </View>
            </View>
          </View>

          {/* Horizontal Scrollable Table */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={styles.tableScrollView}
            contentContainerStyle={styles.tableScrollContent}
            nestedScrollEnabled={true}
          >
            <View style={styles.tableContainer}>
              {/* Enhanced Table Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableHeaderCell, styles.snoColumn]}>
                  <MaterialCommunityIcons name="pound" size={14} color="#667EEA" />
                  <Text style={styles.tableHeaderText}>NO</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.employeeColumn]}>
                  <MaterialCommunityIcons name="account" size={14} color="#667EEA" />
                  <Text style={styles.tableHeaderText}>EMPLOYEE</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.designationColumn]}>
                  <MaterialCommunityIcons name="briefcase" size={14} color="#667EEA" />
                  <Text style={styles.tableHeaderText}>DESIGNATION</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.departmentColumn]}>
                  <MaterialCommunityIcons name="office-building" size={14} color="#667EEA" />
                  <Text style={styles.tableHeaderText}>DEPARTMENT</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.dateColumn]}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#667EEA" />
                  <Text style={styles.tableHeaderText}>DATE</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.timeColumn]}>
                  <MaterialCommunityIcons name="login" size={14} color="#667EEA" />
                  <Text style={styles.tableHeaderText}>CHECK IN</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.timeColumn]}>
                  <MaterialCommunityIcons name="logout" size={14} color="#667EEA" />
                  <Text style={styles.tableHeaderText}>CHECK OUT</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.statusColumn]}>
                  <MaterialCommunityIcons name="clipboard-check" size={14} color="#667EEA" />
                  <Text style={styles.tableHeaderText}>STATUS</Text>
                </View>
              </View>

              {/* Enhanced Table Rows - Scrollable */}
              <ScrollView 
                style={styles.tableRowsContainer}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {currentRecords.length === 0 ? (
                  <View style={styles.tableEmptyState}>
                    {loading ? (
                      <>
                        <ActivityIndicator color="#667EEA" size="small" />
                        <Text style={styles.tableEmptyText}>Loading attendance records...</Text>
                      </>
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="clipboard-alert-outline"
                          size={32}
                          color="#94A3B8"
                        />
                        <Text style={styles.tableEmptyText}>
                          {error
                            ? 'Unable to load attendance records. Please refresh.'
                            : 'No records match the selected filters.'}
                        </Text>
                        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                          <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                ) : (
                  currentRecords.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.tableCell, styles.snoColumn]}>
                      <View style={styles.snoCircle}>
                        <Text style={styles.snoText}>{item.sno}</Text>
                      </View>
                    </View>
                    
                    <View style={[styles.tableCell, styles.employeeColumn]}>
                      <View style={styles.employeeContent}>
                        <LinearGradient
                          colors={['#8B5CF6', '#667EEA']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.avatarContainer}
                        >
                            <Text style={styles.avatarText}>{item.initials}</Text>
                        </LinearGradient>
                        <View style={styles.employeeInfo}>
                          <Text style={styles.employeeName}>{item.employee}</Text>
                            <Text style={styles.employeeSubtext}>
                              {item.employeeId !== '--'
                                ? `ID: EMP${String(item.employeeId).padStart(3, '0')}`
                                : 'ID: N/A'}
                            </Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.tableCell, styles.designationColumn]}>
                      <View style={styles.designationBadge}>
                        <Text style={styles.designationText}>{item.designation}</Text>
                      </View>
                    </View>
                    
                    <View style={[styles.tableCell, styles.departmentColumn]}>
                      <View style={styles.departmentTag}>
                        <Text style={styles.departmentText}>{item.department}</Text>
                      </View>
                    </View>
                    
                    <View style={[styles.tableCell, styles.dateColumn]}>
                      <View style={styles.dateContainer}>
                          <Text style={styles.dateText}>
                            {item.date ? item.date.split('-')[2] : '--'}
                          </Text>
                        <Text style={styles.dateSubtext}>
                            {item.date
                              ? new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '--'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.tableCell, styles.timeColumn]}>
                      <View style={styles.timeBox}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#10B981" />
                          <Text style={[styles.timeText, { color: '#10B981' }]}>
                            {item.checkIn}
                          </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.tableCell, styles.timeColumn]}>
                      <View style={styles.timeBox}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#EF4444" />
                          <Text style={[styles.timeText, { color: '#EF4444' }]}>
                            {item.checkOut}
                          </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.tableCell, styles.statusColumn]}>
                      <LinearGradient
                          colors={item.statusGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.statusBadge}
                      >
                          <MaterialCommunityIcons name={item.statusIcon} size={14} color="#FFFFFF" />
                          <Text style={styles.statusText}>{item.statusLabel}</Text>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Table Footer with Pagination */}
          <View style={styles.tableFooter}>
            <Text style={styles.footerText}>
              {totalRecords === 0
                ? 'No records to display'
                : `Showing ${startIndex + 1}-${Math.min(endIndex, totalRecords)} of ${totalRecords} records`}
            </Text>
            <View style={styles.paginationControls}>
              <TouchableOpacity 
                style={[
                  styles.paginationButton,
                  (disablePrev) && styles.paginationButtonDisabled,
                ]}
                onPress={handlePrevPage}
                disabled={disablePrev}
              >
                <MaterialCommunityIcons 
                  name="chevron-left" 
                  size={20} 
                  color={disablePrev ? '#CBD5E1' : '#667EEA'} 
                />
              </TouchableOpacity>
              
              <View style={styles.paginationDots}>
                {[...Array(totalPages)].map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setCurrentPage(i + 1)}
                    style={[
                      styles.paginationDot,
                      currentPage === i + 1 && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.paginationButton,
                  (disableNext) && styles.paginationButtonDisabled,
                ]}
                onPress={handleNextPage}
                disabled={disableNext}
              >
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={20} 
                  color={disableNext ? '#CBD5E1' : '#667EEA'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <>
          {Platform.OS === 'ios' && (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.datePickerBackdrop}>
                <View style={styles.datePickerCard}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.datePickerCancelButton}
                    >
                      <Text style={styles.datePickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleConfirmDate}
                      style={styles.datePickerConfirmButton}
                    >
                      <Text style={styles.datePickerConfirmText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempSpecificDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    style={styles.datePickerIOS}
                  />
                </View>
              </View>
            </Modal>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={tempSpecificDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Enhanced Header Styles
  headerSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -30,
    right: -30,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -20,
    left: -20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.2,
  },
  // Filter Card Styles
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterHeader: {
    marginBottom: 20,
  },
  filterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterHeaderAccent: {
    width: 4,
    height: 20,
    backgroundColor: '#667EEA',
    borderRadius: 2,
    marginRight: 12,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  filterContent: {
    gap: 20,
  },
  filterField: {
    marginBottom: 4,
  },
  filterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabelBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#667EEA',
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667EEA',
  },
  // Dropdown Styles
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownValueText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
  dropdownPlaceholderText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#94A3B8',
    flex: 1,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '85%',
    maxHeight: 300,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  dropdownItemSelected: {
    backgroundColor: '#667EEA',
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  dropdownItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
  },
  // Date Picker Styles
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePickerValueText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
  datePickerPlaceholderText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#94A3B8',
    flex: 1,
  },
  // Month Picker Styles
  monthPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  yearSelector: {
    marginBottom: 20,
    alignItems: 'center',
  },
  yearInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#667EEA',
    paddingBottom: 8,
    minWidth: 100,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthButton: {
    width: '23%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthButtonSelected: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  monthButtonTextSelected: {
    color: '#FFFFFF',
  },
  monthPickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  thisMonthButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#667EEA',
    alignItems: 'center',
  },
  thisMonthButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Action Buttons
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#667EEA',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667EEA',
  },
  // Results Section
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  resultsContent: {
    flex: 1,
  },
  resultsText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667EEA',
  },
  resultsError: {
    marginTop: 6,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  // Date Picker Modal Styles
  datePickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  datePickerCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  datePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  datePickerConfirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  datePickerIOS: {
    height: 200,
  },
  // Table Styles
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  tableTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tableTopTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  tableStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  presentStatBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  presentStatText: {
    color: '#047857',
  },
  absentStatBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  absentStatText: {
    color: '#B91C1C',
  },
  halfDayStatBadge: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  halfDayStatText: {
    color: '#C2410C',
  },
  tableScrollView: {
    flex: 1,
  },
  tableScrollContent: {
    paddingBottom: 10,
  },
  tableContainer: {
    minWidth: '100%',
  },
  tableRowsContainer: {
    maxHeight: 600,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderCell: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#667EEA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: 70,
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  // Column Widths
  snoColumn: {
    width: 70,
    alignItems: 'center',
  },
  employeeColumn: {
    width: 240,
  },
  designationColumn: {
    width: 130,
    alignItems: 'center',
  },
  departmentColumn: {
    width: 130,
    alignItems: 'center',
  },
  dateColumn: {
    width: 130,
    alignItems: 'center',
  },
  timeColumn: {
    width: 120,
    alignItems: 'center',
  },
  statusColumn: {
    width: 130,
    alignItems: 'center',
  },
  // S.No Circle
  snoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  snoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667EEA',
  },
  // Employee Styles
  employeeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  employeeSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  // Designation Badge
  designationBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  designationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  // Department Tag
  departmentTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  departmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
  },
  // Date Container
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  dateSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  // Time Box
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Table Footer
  tableEmptyState: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  tableEmptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4C1D95',
  },
  tableFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 2,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paginationButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paginationButtonDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  paginationDots: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  paginationDotActive: {
    backgroundColor: '#667EEA',
    width: 24,
  },
});