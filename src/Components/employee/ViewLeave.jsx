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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeLeaveList } from '../../redux/slices/employeeLeaveListSlice';
import { SkeletonBlock } from '../common/Skeleton';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 'All'];

const TABLE_COLUMNS = [
  { key: 'serial', label: 'S.no.', width: 70, align: 'center' },
  { key: 'action', label: 'Action', width: 160, align: 'center' },
  { key: 'name', label: 'Name', width: 190, align: 'left' },
  { key: 'empCode', label: 'Emp Code', width: 140, align: 'left' },
  { key: 'company', label: 'Company', width: 190, align: 'left' },
  { key: 'contact', label: 'Contact', width: 150, align: 'left' },
  { key: 'designation', label: 'Designation', width: 190, align: 'left' },
  { key: 'leaveFrom', label: 'Leave From', width: 150, align: 'left' },
  { key: 'leaveTo', label: 'Leave To', width: 150, align: 'left' },
  { key: 'totalDays', label: 'Total Days', width: 120, align: 'center' },
  { key: 'addressOnLeave', label: 'Address on Leave', width: 240, align: 'left', numberOfLines: 2 },
  { key: 'purpose', label: 'Purpose', width: 240, align: 'left', numberOfLines: 2 },
];

const TABLE_MIN_WIDTH = TABLE_COLUMNS.reduce((sum, column) => sum + column.width, 0);

const statCardsFactory = (stats) => [
  {
    key: 'total',
    label: 'Total Leaves',
    icon: 'event-note',
    value: stats.total || 0,
    accent: '#6366F1',
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: 'check-circle',
    value: stats.approved || 0,
    accent: '#22C55E',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: 'pending-actions',
    value: stats.pending || 0,
    accent: '#F97316',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    icon: 'cancel',
    value: stats.rejected || 0,
    accent: '#EF4444',
  },
];

const resolveUserObject = (userProp, authUser) => {
  if (userProp && typeof userProp === 'object' && Object.keys(userProp).length > 0) {
    return userProp;
  }
  if (authUser && typeof authUser === 'object') {
    if (Array.isArray(authUser)) {
      return authUser[0] || {};
    }
    if (Array.isArray(authUser?.data)) {
      return authUser.data[0] || {};
    }
    return authUser.data || authUser;
  }
  return {};
};

const pickFirstValue = (sources = [], keys = []) => {
  for (const source of sources) {
    if (!source || typeof source !== 'object') {
      continue;
    }
    for (const key of keys) {
      if (source[key]) {
        return String(source[key]).trim();
      }
    }
  }
  return '';
};

const ViewLeave = ({ user = {}, onBack }) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user);
  const { items = [], loading = false } = useSelector(
    (state) => state.employeeLeaveList || { items: [], loading: false }
  );

  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeModalVisible, setPageSizeModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployeeLeaveList());
  }, [dispatch]);

  const resolvedUser = useMemo(() => resolveUserObject(user, authUser), [user, authUser]);

  const employeeCode = useMemo(
    () =>
      pickFirstValue(
        [resolvedUser, resolvedUser?.employee, resolvedUser?.profile],
        ['employee_code', 'employee_emp_code', 'employee_id', 'emp_code', 'employeeCode']
      ).toLowerCase(),
    [resolvedUser]
  );

  const employeeName = useMemo(
    () =>
      pickFirstValue(
        [resolvedUser, resolvedUser?.employee, resolvedUser?.profile],
        ['employee_full_name', 'employee_name', 'employeeFirstName', 'employee_first_name']
      ),
    [resolvedUser]
  );

  const mappedData = useMemo(() => {
    return (items || []).map((record, index) => {
      const statusKey = (record?.l_status || record?.status || 'pending').toString().toLowerCase();
      return {
        id: record?.l_id ? String(record.l_id) : `leave-${index}`,
        name: record?.l_name || '',
        empCode: record?.l_emp_code || record?.employee_code || '',
        company: record?.l_company || record?.l_company_main || '',
        contact: record?.l_contact_number || '',
        designation: record?.l_designation || '',
        leaveFrom: record?.l_from_date || '',
        leaveTo: record?.l_to_date || '',
        totalDays: record?.l_total_days || '',
        addressOnLeave: record?.l_address_on_leave || '',
        purpose: record?.l_purpose || '',
        status: statusKey,
        appliedOn: record?.l_applied_date || record?.created_at || '',
        raw: record,
      };
    });
  }, [items]);

  const employeeSpecificData = useMemo(() => {
    if (!employeeCode && !employeeName) {
      return mappedData;
    }
    return mappedData.filter((record) => {
      const recordCode = (record.empCode || '').toLowerCase();
      const recordName = (record.name || '').toLowerCase();
      if (employeeCode && recordCode.includes(employeeCode)) {
        return true;
      }
      if (employeeName && recordName.includes(employeeName.toLowerCase())) {
        return true;
      }
      return false;
    });
  }, [mappedData, employeeCode, employeeName]);

  const filteredData = useMemo(() => {
    if (!searchText) {
      return employeeSpecificData;
    }
    const lower = searchText.toLowerCase();
    return employeeSpecificData.filter((record) =>
      [
        record.name,
        record.empCode,
        record.company,
        record.designation,
        record.contact,
        record.purpose,
        record.addressOnLeave,
      ]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(lower))
    );
  }, [searchText, employeeSpecificData]);

  const isAll = pageSize === 'All';
  const totalEntries = filteredData.length;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = isAll ? 0 : (currentPage - 1) * pageSize;
  const paginatedData = useMemo(() => {
    if (isAll) {
      return filteredData;
    }
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, startIndex, pageSize, isAll]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, pageSize, totalEntries]);

  const stats = useMemo(() => {
    return employeeSpecificData.reduce(
      (acc, record) => {
        acc.total += 1;
        if (record.status.includes('approve')) {
          acc.approved += 1;
        } else if (record.status.includes('reject')) {
          acc.rejected += 1;
        } else if (record.status.includes('cancel')) {
          acc.cancelled += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0, cancelled: 0 }
    );
  }, [employeeSpecificData]);

  const statsCards = statCardsFactory(stats);
  const startEntry = totalEntries === 0 ? 0 : startIndex + 1;
  const endEntry = totalEntries === 0 ? 0 : startIndex + paginatedData.length;
  const showPlaceholderState = loading && totalEntries === 0;
  const showEmptyState = !loading && paginatedData.length === 0;

  const detailSections = useMemo(() => {
    if (!selectedLeave) {
      return [];
    }
    return [
      {
        title: 'Employee Details',
        fields: [
          { label: 'Applicant', value: selectedLeave.name || '—' },
          { label: 'Employee Code', value: selectedLeave.empCode || '—' },
          { label: 'Designation', value: selectedLeave.designation || '—' },
          { label: 'Company', value: selectedLeave.company || '—' },
        ],
      },
      {
        title: 'Leave Window',
        fields: [
          { label: 'Leave From', value: selectedLeave.leaveFrom || '—' },
          { label: 'Leave To', value: selectedLeave.leaveTo || '—' },
          { label: 'Total Days', value: selectedLeave.totalDays || '—' },
          { label: 'Applied On', value: selectedLeave.appliedOn || '—' },
        ],
      },
      {
        title: 'Contact & Purpose',
        fields: [
          { label: 'Contact Number', value: selectedLeave.contact || '—' },
          { label: 'Purpose', value: selectedLeave.purpose || '—' },
          { label: 'Address on Leave', value: selectedLeave.addressOnLeave || '—' },
        ],
      },
    ];
  }, [selectedLeave]);

  const renderRow = ({ item, index }) => {
    const rowStyle = index % 2 === 0 ? styles.tableRow : styles.tableRowAlt;
    const serialNumber = startIndex + index + 1;

    return (
      <View style={rowStyle}>
        {TABLE_COLUMNS.map((column) => {
          const columnStyle = [
            styles.tableCell,
            column.align === 'center' ? styles.alignCenter : styles.alignLeft,
            { width: column.width, minWidth: column.width, maxWidth: column.width },
          ];

          if (column.key === 'serial') {
            return (
              <View key={column.key} style={columnStyle}>
                <Text style={[styles.cellText, styles.textCenter]}>{serialNumber}</Text>
              </View>
            );
          }

          if (column.key === 'action') {
            return (
              <View key={column.key} style={[columnStyle, styles.actionCell]}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => setSelectedLeave(item)}
                  activeOpacity={0.85}
                >
                  <Icon name="visibility" size={16} color="#FFFFFF" />
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            );
          }

          const value = item[column.key] ?? '-';
          return (
            <View key={column.key} style={columnStyle}>
              <Text
                style={[
                  styles.cellText,
                  column.align === 'center' ? styles.textCenter : styles.textLeft,
                ]}
                numberOfLines={column.numberOfLines}
              >
                {value}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Employee Leaves List</Text>
          <Text style={styles.headerSubtitle}>
           
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.statRow}>
          {statsCards.map((card) => (
            <View key={card.key} style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: `${card.accent}22` }]}>
                <Icon name={card.icon} size={22} color={card.accent} />
              </View>
              <Text style={styles.statLabel}>{card.label}</Text>
              <Text style={[styles.statValue, { color: card.accent }]}>{card.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.controlsCard}>
          <View style={styles.entriesControl}>
            <Text style={styles.controlLabel}>Show</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setPageSizeModalVisible(true)}
            >
              <Text style={styles.dropdownText}>{pageSize}</Text>
              <Icon name="arrow-drop-down" size={20} color="#4338CA" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>entries</Text>
          </View>

          <View style={styles.searchControl}>
            <Icon name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search leaves"
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeader}>
              {TABLE_COLUMNS.map((column) => (
                <View
                  key={column.key}
                  style={[
                    styles.tableHeaderCell,
                    column.align === 'center' ? styles.alignCenter : styles.alignLeft,
                    { width: column.width, minWidth: column.width, maxWidth: column.width },
                  ]}
                >
                  <Text style={styles.headerText}>{column.label}</Text>
                </View>
              ))}
            </View>

            {showPlaceholderState || showEmptyState ? (
              <View style={styles.emptyState}>
                <Icon name="event-busy" size={36} color="#9CA3AF" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>
                  {showPlaceholderState ? 'Fetching your leave history…' : 'No Leave Applications Found'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {showPlaceholderState
                    ? 'We will list your requests as soon as the server shares them.'
                    : 'Submit a leave request to see it listed here.'}
                </Text>
              </View>
            ) : loading ? (
              <>
                {[...Array(6)].map((_, idx) => (
                  <View key={`sk-row-${idx}`} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    {TABLE_COLUMNS.map((column) => (
                      <View
                        key={`${column.key}-${idx}`}
                        style={[
                          styles.tableCell,
                          column.align === 'center' ? styles.alignCenter : styles.alignLeft,
                          { width: column.width, minWidth: column.width, maxWidth: column.width },
                        ]}
                      >
                        <SkeletonBlock style={{ height: 14, width: '80%', borderRadius: 6 }} />
                      </View>
                    ))}
                  </View>
                ))}
              </>
            ) : (
              <FlatList
                data={paginatedData}
                keyExtractor={(item) => item.id}
                renderItem={renderRow}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.paginationBar}>
          <Text style={styles.paginationText}>
            Showing {startEntry} to {endEntry} of {totalEntries} entries
          </Text>

          <View style={styles.paginationControls}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageButtonText}>«</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageButtonText}>‹</Text>
            </TouchableOpacity>

            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <TouchableOpacity
                    key={pageNum}
                    style={[
                      styles.pageButton,
                      styles.pageNumberButton,
                      currentPage === pageNum && styles.pageButtonActive,
                    ]}
                    onPress={() => setCurrentPage(pageNum)}
                  >
                    <Text
                      style={[
                        styles.pageNumberText,
                        currentPage === pageNum && styles.pageNumberTextActive,
                      ]}
                    >
                      {pageNum}
                    </Text>
                  </TouchableOpacity>
                );
              }
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <Text key={`ellipsis-${pageNum}`} style={styles.paginationEllipsis}>
                    ...
                  </Text>
                );
              }
              return null;
            })}

            <TouchableOpacity
              style={[
                styles.pageButton,
                (currentPage === totalPages || totalPages === 0) && styles.pageButtonDisabled,
              ]}
              onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <Text style={styles.pageButtonText}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pageButton,
                (currentPage === totalPages || totalPages === 0) && styles.pageButtonDisabled,
              ]}
              onPress={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <Text style={styles.pageButtonText}>»</Text>
            </TouchableOpacity>
          </View>
        </View>

        {selectedLeave && (
          <View style={styles.detailCard}>
            <LinearGradient
              colors={['#4338CA', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.detailHero}
            >
              <View>
                <Text style={styles.detailHeroTitle}>Leave Snapshot</Text>
                <Text style={styles.detailHeroSubtitle}>
                  {(selectedLeave.leaveFrom || '—') + '  →  ' + (selectedLeave.leaveTo || '—')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedLeave(null)} style={styles.detailHeroClose}>
                <Icon name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.detailSectionsWrapper}>
              {detailSections.map((section) => (
                <View key={section.title} style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>{section.title}</Text>
                  {section.fields.map((field, fieldIndex) => (
                    <View
                      key={`${section.title}-${field.label}`}
                      style={[
                        styles.detailRow,
                        fieldIndex === section.fields.length - 1 && styles.detailRowLast,
                      ]}
                    >
                      <Text style={styles.detailRowLabel}>{field.label}</Text>
                      <Text style={styles.detailRowValue}>{field.value}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={pageSizeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPageSizeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPageSizeModalVisible(false)}
        >
          <View style={styles.modalCard}>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  pageSize === option && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setPageSize(option);
                  setPageSizeModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    pageSize === option && styles.modalOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flexBasis: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  controlsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  entriesControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
  },
  dropdownText: {
    fontSize: 14,
    color: '#4338CA',
    fontWeight: '600',
  },
  searchControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
    marginTop: 10,
    maxWidth: 320,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  tableWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: TABLE_MIN_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderCell: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#374151',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#4338CA',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  paginationBar: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  paginationText: {
    fontSize: 13,
    color: '#4B5563',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageButton: {
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 14,
    color: '#1F2937',
  },
  pageNumberButton: {
    paddingHorizontal: 12,
  },
  pageButtonActive: {
    backgroundColor: '#4338CA',
    borderColor: '#4338CA',
  },
  pageNumberText: {
    fontSize: 14,
    color: '#1F2937',
  },
  pageNumberTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  paginationEllipsis: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 4,
  },
  detailCard: {
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  detailHero: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailHeroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  detailHeroSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  detailHeroClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  detailSectionsWrapper: {
    padding: 20,
    gap: 16,
  },
  detailSection: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailRowLabel: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    paddingRight: 12,
  },
  detailRowValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalCard: {
    width: '100%',
    maxWidth: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  modalOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#4338CA',
    fontWeight: '700',
  },
});

export default ViewLeave;

