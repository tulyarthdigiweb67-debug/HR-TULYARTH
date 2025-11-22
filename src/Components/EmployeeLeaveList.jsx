import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeLeaveList, deleteLeave, resetDeleteState, updateLeaveStatus } from '../redux/slices/employeeLeaveListSlice';
import { SkeletonBlock } from './common/Skeleton';

// Data will be fetched from API using Redux slice

const PAGE_SIZE_OPTIONS = [5, 10, 50, 100, 'All'];
const TABLE_COLUMNS = [
  { key: 'serial', label: 'S.no.', width: 60, align: 'center' },
  { key: 'action', label: 'Action', width: 360, align: 'left', paddingRight: 16 },
  { key: 'name', label: 'Name', width: 190, align: 'left', sortKey: 'name', paddingLeft: 35 },
  { key: 'empCode', label: 'Emp Code', width: 120, align: 'left', sortKey: 'empCode' },
  { key: 'company', label: 'Company', width: 180, align: 'left', sortKey: 'company' },
  { key: 'contact', label: 'Contact', width: 140, align: 'left', sortKey: 'contact' },
  { key: 'designation', label: 'Designation', width: 180, align: 'left', sortKey: 'designation' },
  { key: 'leaveFrom', label: 'Leave From', width: 140, align: 'left', sortKey: 'leaveFrom' },
  { key: 'leaveTo', label: 'Leave To', width: 140, align: 'left', sortKey: 'leaveTo' },
  { key: 'totalDays', label: 'Total Days', width: 110, align: 'center', sortKey: 'totalDays' },
  { key: 'addressOnLeave', label: 'Address on Leave', width: 220, align: 'left', sortKey: 'addressOnLeave', numberOfLines: 2 },
  { key: 'purpose', label: 'Purpose', width: 220, align: 'left', sortKey: 'purpose', numberOfLines: 2 },
];

const TABLE_MIN_WIDTH = TABLE_COLUMNS.reduce((acc, column) => acc + column.width, 0);

const EmployeeLeaveList = ({ onEdit, onView }) => {
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const swipeThreshold = 60;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        // Horizontal intent and not a tiny move
        return Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) + 8;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (dx <= -swipeThreshold) {
          // Swipe left: next page (if exists)
          if (!isAllSelected) {
            setCurrentPage((prev) => Math.min(totalPages, prev + 1));
          }
        } else if (dx >= swipeThreshold) {
          // Swipe right: previous page (if exists)
          if (!isAllSelected) {
            setCurrentPage((prev) => Math.max(1, prev - 1));
          }
        }
      },
    })
  ).current;

  const dispatch = useDispatch();
  const { 
    items = [], 
    loading = false, 
    deleting = false, 
    deleteError = null, 
    deleteResult = null,
    updatingStatus = false,
    updateStatusError = null,
    updateStatusResult = null,
  } = useSelector((state) => state.employeeLeaveList || { items: [], loading: false });

  useEffect(() => {
    dispatch(fetchEmployeeLeaveList());
  }, [dispatch]);

  // Map API data to UI-friendly fields
  const apiData = useMemo(() => {
    return (items || []).map((r, index) => ({
      id: `${r?.l_id ?? 'leave'}-${index}`,
      name: r?.l_name ?? '',
      empCode: r?.l_emp_code ?? '',
      company: r?.l_company ?? r?.l_company_main ?? '',
      contact: r?.l_contact_number ?? '',
      designation: r?.l_designation ?? '',
      leaveFrom: r?.l_from_date ?? '',
      leaveTo: r?.l_to_date ?? '',
      totalDays: r?.l_total_days ?? '',
      addressOnLeave: r?.l_address_on_leave ?? '',
      purpose: r?.l_purpose ?? '',
      raw: r,
    }));
  }, [items]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...apiData];

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.empCode.toLowerCase().includes(searchLower) ||
          item.company.toLowerCase().includes(searchLower) ||
          item.designation.toLowerCase().includes(searchLower) ||
          item.contact.includes(searchText)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal === undefined || aVal === null) aVal = '';
        if (bVal === undefined || bVal === null) bVal = '';

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
        }
        if (typeof bVal === 'string') {
          bVal = bVal.toLowerCase();
        }

        if (sortConfig.direction === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      });
    }

    return data;
  }, [searchText, sortConfig, apiData]);

  // Paginate data
  const isAllSelected = pageSize === 'All';

  const paginatedData = useMemo(() => {
    if (isAllSelected) {
      return filteredData;
    }
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, isAllSelected]);

  const totalEntries = filteredData.length;
  const totalPages = isAllSelected ? 1 : Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = isAllSelected ? 0 : (currentPage - 1) * pageSize;
  const startEntry = totalEntries === 0 ? 0 : startIndex + 1;
  const endEntry = totalEntries === 0 ? 0 : startIndex + paginatedData.length;

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Render sort icon
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <View style={styles.sortIconContainer}>
          <Icon name="arrow-upward" size={14} color="#BBB" />
          <Icon name="arrow-downward" size={14} color="#BBB" />
        </View>
      );
    }
    return (
      <Icon
        name={sortConfig.direction === 'asc' ? 'arrow-upward' : 'arrow-downward'}
        size={16}
        color="#F37438"
      />
    );
  };

  // Render table row
  const renderRow = ({ item, index }) => {
    const rowStyle = index % 2 === 0 ? styles.tableRow : styles.tableRowAlt;
    const serialNumber = startIndex + index + 1;

    return (
      <View style={rowStyle}>
        {TABLE_COLUMNS.map((column) => {
          const columnStyles = [
            styles.tableCell,
            column.align === 'center' ? styles.alignCenter : styles.alignLeft,
            { width: column.width, minWidth: column.width, maxWidth: column.width },
            column.key === 'action' && styles.actionCell,
            { paddingLeft: column.paddingLeft ?? 10, paddingRight: column.paddingRight ?? 10 },
          ];

          if (column.key === 'serial') {
            return (
              <View key={column.key} style={columnStyles}>
                <Text style={[styles.cellText, styles.textCenter]}>{serialNumber}</Text>
              </View>
            );
          }

          if (column.key === 'action') {
            return (
              <View key={column.key} style={columnStyles}>
                <TouchableOpacity
                  style={[styles.badgeButton, styles.badgeEdit]}
                  onPress={() => onEdit && onEdit(item.raw)}
                >
                  <Text style={styles.badgeText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.badgeButton, styles.badgeView]}
                  onPress={() => onView && onView(item.raw)}
                >
                  <Text style={styles.badgeText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.badgeButton, styles.badgeDelete]}
                  onPress={() => {
                    setLeaveToDelete(item.raw);
                    setDeleteModalVisible(true);
                    console.log('[EMPLOYEE_LEAVE_LIST] Delete button clicked for leave:', item.raw);
                  }}
                >
                  <Text style={styles.badgeText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.badgeButton, styles.badgeStatus]}
                  onPress={() => {
                    setStatusTarget(item.raw);
                    setStatusModalVisible(true);
                  }}
                >
                  <Text style={styles.badgeText} numberOfLines={1}>
                    Change Status
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }

          const value = item[column.key] ?? '-';
          return (
            <View key={column.key} style={columnStyles}>
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

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchText, items.length]);

  useEffect(() => {
    if (isAllSelected) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
      return;
    }

    const maxPages = Math.max(1, Math.ceil(totalEntries / pageSize));
    if (currentPage > maxPages) {
      setCurrentPage(maxPages);
    }
  }, [isAllSelected, totalEntries, pageSize, currentPage]);

  // Handle delete success/error
  useEffect(() => {
    if (deleteResult) {
      console.log('[EMPLOYEE_LEAVE_LIST] Delete success:', deleteResult);
      // Refresh the leave list after successful deletion
      dispatch(fetchEmployeeLeaveList());
      setDeleteModalVisible(false);
      setLeaveToDelete(null);
      // Reset delete state after a delay to prevent re-triggering
      setTimeout(() => {
        dispatch(resetDeleteState());
      }, 100);
    }
    if (deleteError) {
      console.log('[EMPLOYEE_LEAVE_LIST] Delete error:', deleteError);
      // Error will be shown in modal, don't close it automatically
    }
  }, [deleteResult, deleteError, dispatch]);

  // Handle status update results
  useEffect(() => {
    if (updateStatusResult) {
      console.log('[EMPLOYEE_LEAVE_LIST] Status update success:', updateStatusResult);
      setStatusModalVisible(false);
      setStatusTarget(null);
      // Refresh the list to reflect updated status
      dispatch(fetchEmployeeLeaveList());
    }
    if (updateStatusError) {
      console.log('[EMPLOYEE_LEAVE_LIST] Status update error:', updateStatusError);
    }
  }, [updateStatusResult, updateStatusError, dispatch]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Employee Leaves List</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Entries per page */}
        <View style={styles.entriesContainer}>
          <Text style={styles.entriesLabel}>Show</Text>
          <TouchableOpacity
            style={styles.dropdown}
            activeOpacity={0.8}
            onPress={() => setDropdownOpen(true)}
          >
            <Text style={styles.dropdownText}>{pageSize}</Text>
            <Icon name="arrow-drop-down" size={18} color="#60A5FA" />
          </TouchableOpacity>
          <Text style={styles.entriesLabel}>entries per page</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder=""
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.dropdownModal}>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownOption,
                  pageSize === option && styles.dropdownOptionSelected,
                ]}
                onPress={() => {
                  setPageSize(option);
                  setCurrentPage(1); // Reset to first page when changing page size
                  setDropdownOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    pageSize === option && styles.dropdownOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.statusModalOverlay}>
          <View style={styles.statusModalContent}>
            <View style={styles.warningIconContainer}>
              <View style={styles.warningIconCircle}>
                <Text style={styles.warningIconText}>?</Text>
              </View>
            </View>
            <Text style={styles.statusModalTitle}>Change Leave Status</Text>
            <Text style={styles.statusModalMessage}>Select status below</Text>
            <View style={styles.statusButtonsRow}>
              <TouchableOpacity
                style={[styles.statusButton, styles.statusApprove, updatingStatus && styles.deleteButtonDisabled]}
                disabled={updatingStatus}
                onPress={() => {
                  if (!statusTarget) return;
                  console.log('[STATUS_MODAL] Approve pressed for l_id:', statusTarget?.l_id);
                  dispatch(updateLeaveStatus({ l_id: statusTarget?.l_id, status: 'approve' }));
                }}
              >
                <Text style={styles.statusButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.statusReject, updatingStatus && styles.deleteButtonDisabled]}
                disabled={updatingStatus}
                onPress={() => {
                  if (!statusTarget) return;
                  console.log('[STATUS_MODAL] Reject pressed for l_id:', statusTarget?.l_id);
                  dispatch(updateLeaveStatus({ l_id: statusTarget?.l_id, status: 'reject' }));
                }}
              >
                <Text style={styles.statusButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.statusCancel, updatingStatus && styles.deleteButtonDisabled]}
                disabled={updatingStatus}
                onPress={() => {
                  if (!statusTarget) return;
                  console.log('[STATUS_MODAL] Cancel pressed for l_id:', statusTarget?.l_id);
                  dispatch(updateLeaveStatus({ l_id: statusTarget?.l_id, status: 'cancel' }));
                }}
              >
                <Text style={styles.statusButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {updateStatusError && (
              <Text style={styles.deleteErrorText}>
                {`${
                  updateStatusError?.message || 'Failed to update status'
                }${
                  updateStatusError?.status ? ` (status ${updateStatusError.status})` : ''
                }${
                  updateStatusError?.data ? `: ${JSON.stringify(updateStatusError.data)}` : ''
                }`}
              </Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {TABLE_COLUMNS.map((column) => {
              const baseStyles = [
                styles.tableHeaderCell,
                column.align === 'center' ? styles.alignCenter : styles.alignLeft,
                { width: column.width, minWidth: column.width, maxWidth: column.width },
                column.key === 'action' && styles.actionHeaderCell,
                { paddingLeft: column.paddingLeft ?? 10, paddingRight: column.paddingRight ?? 10 },
              ];

              if (column.sortKey) {
                return (
                  <TouchableOpacity
                    key={column.key}
                    style={baseStyles}
                    onPress={() => handleSort(column.sortKey)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.headerText}>{column.label}</Text>
                    {renderSortIcon(column.sortKey)}
                  </TouchableOpacity>
                );
              }

              return (
                <View key={column.key} style={baseStyles}>
                  <Text style={styles.headerText}>{column.label}</Text>
                </View>
              );
            })}
          </View>

        {/* Table Body */}
        {loading ? (
          <>
            {/* Header Skeleton */}
            <View style={styles.tableHeader}>
              {TABLE_COLUMNS.map((column) => (
                <View
                  key={column.key}
                  style={[
                    styles.tableHeaderCell,
                    column.align === 'center' ? styles.alignCenter : styles.alignLeft,
                    { width: column.width, minWidth: column.width, maxWidth: column.width },
                    column.key === 'action' && styles.actionHeaderCell,
                    { paddingLeft: column.paddingLeft ?? 10, paddingRight: column.paddingRight ?? 10 },
                  ]}
                >
                  <SkeletonBlock style={{ height: 16, width: '70%', borderRadius: 8 }} />
                </View>
              ))}
            </View>
            {/* Body Skeleton Rows */}
            {[...Array(8)].map((_, rowIdx) => (
              <View key={`sk-row-${rowIdx}`} style={rowIdx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                {TABLE_COLUMNS.map((column) => (
                  <View
                    key={`${column.key}-${rowIdx}`}
                    style={[
                      styles.tableCell,
                      column.align === 'center' ? styles.alignCenter : styles.alignLeft,
                      { width: column.width, minWidth: column.width, maxWidth: column.width },
                      column.key === 'action' && styles.actionCell,
                      { paddingLeft: column.paddingLeft ?? 10, paddingRight: column.paddingRight ?? 10 },
                    ]}
                  >
                    <SkeletonBlock
                      style={{
                        height: 14,
                        width: column.key === 'action' ? '90%' : '80%',
                        borderRadius: 7,
                      }}
                    />
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : paginatedData.length === 0 ? (
          <View style={styles.emptyRowContainer}>
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No Leave Applications Found</Text>
            </View>
          </View>
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

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          Showing {startEntry} to {endEntry} of {totalEntries} entry
          {totalEntries !== 1 ? 'ies' : ''}
        </Text>

        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <Text style={[styles.paginationIconText, currentPage === 1 && styles.paginationIconTextDisabled]}>
              «
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Text style={[styles.paginationIconText, currentPage === 1 && styles.paginationIconTextDisabled]}>
              ‹
            </Text>
          </TouchableOpacity>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <TouchableOpacity
                  key={pageNum}
                  style={[
                    styles.paginationButton,
                    styles.paginationPageButton,
                    currentPage === pageNum && styles.paginationButtonActive,
                  ]}
                  onPress={() => setCurrentPage(pageNum)}
                >
                  <Text
                    style={[
                      styles.paginationPageText,
                      currentPage === pageNum && styles.paginationPageTextActive,
                    ]}
                  >
                    {pageNum}
                  </Text>
                </TouchableOpacity>
              );
            } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return (
                <Text key={pageNum} style={styles.paginationEllipsis}>
                  ...
                </Text>
              );
            }
            return null;
          })}

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <Text
              style={[
                styles.paginationIconText,
                (currentPage === totalPages || totalPages === 0) && styles.paginationIconTextDisabled,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <Text
              style={[
                styles.paginationIconText,
                (currentPage === totalPages || totalPages === 0) && styles.paginationIconTextDisabled,
              ]}
            >
              »
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.deleteModalOverlay}
          activeOpacity={1}
          onPress={() => setDeleteModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.deleteModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <View style={styles.warningIconContainer}>
              <View style={styles.warningIconCircle}>
                <Text style={styles.warningIconText}>!</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.deleteModalTitle}>Are you sure?</Text>

            {/* Message */}
            <Text style={styles.deleteModalMessage}>
              This leave record will be deleted!
            </Text>

            {/* Buttons */}
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, deleting && styles.deleteButtonDisabled]}
                disabled={deleting}
                onPress={async () => {
                  if (leaveToDelete) {
                    try {
                      await dispatch(deleteLeave(leaveToDelete)).unwrap();
                      console.log('[EMPLOYEE_LEAVE_LIST] Leave deleted successfully');
                    } catch (error) {
                      console.error('[EMPLOYEE_LEAVE_LIST] Delete failed:', error);
                      // Error is handled by Redux state, modal will stay open
                    }
                  }
                }}
              >
                <Text style={styles.deleteConfirmButtonText}>
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteCancelButton, deleting && styles.deleteButtonDisabled]}
                disabled={deleting}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setLeaveToDelete(null);
                  dispatch(resetDeleteState());
                }}
              >
                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {deleteError && (
              <Text style={styles.deleteErrorText}>
                {deleteError?.message || deleteError?.data?.message || 'Failed to delete leave record. Please try again.'}
              </Text>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  entriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  entriesLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#60A5FA',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    minWidth: 35,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 2,
    marginTop: 0,
  },
  searchLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 135,
    paddingLeft: 20,
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    minWidth: 90,
    maxWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  dropdownOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
    minWidth: TABLE_MIN_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableHeaderCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    gap: 4,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
    letterSpacing: 0.3,
  },
  sortIconContainer: {
    flexDirection: 'column',
    marginLeft: 4,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableRowPlaceholder: {
    opacity: 0.6,
  },
  tableCell: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCell: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  badgeEdit: {
    backgroundColor: '#22C55E',
  },
  badgeView: {
    backgroundColor: '#F59E0B',
  },
  badgeDelete: {
    backgroundColor: '#EF4444',
  },
  badgeStatus: {
    backgroundColor: '#F37438',
  },
  cellText: {
    fontSize: 13,
    color: '#333',
    flexWrap: 'wrap',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  placeholderText: {
    color: 'transparent',
  },
  actionButton: {
    padding: 4,
  },
  placeholderBadge: {
    backgroundColor: '#E5E7EB',
  },
  emptyRowContainer: {
    width: '100%',
  },
  emptyRow: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    width: TABLE_MIN_WIDTH,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    flexWrap: 'wrap',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  paginationText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paginationButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    backgroundColor: '#FFF',
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonActive: {
    backgroundColor: '#F37438',
    borderColor: '#F37438',
  },
  paginationPageButton: {
    minWidth: 32,
  },
  paginationPageText: {
    fontSize: 14,
    color: '#333',
  },
  paginationPageTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  paginationEllipsis: {
    paddingHorizontal: 4,
    fontSize: 14,
    color: '#666',
  },
  paginationIconText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  paginationIconTextDisabled: {
    color: '#CCC',
  },
  alignCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignLeft: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  actionHeaderCell: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  // Status Modal Styles
  statusModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    width: '85%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statusModalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusModalMessage: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 22,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusApprove: {
    backgroundColor: '#F37438', // orange
  },
  statusReject: {
    backgroundColor: '#F05252', // red-ish
  },
  statusCancel: {
    backgroundColor: '#DC2626', // deep red
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  warningIconContainer: {
    marginBottom: 20,
  },
  warningIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFE0B2',
  },
  warningIconText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FF6B35',
  },
  deleteModalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteCancelButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteErrorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
});

export default EmployeeLeaveList;
