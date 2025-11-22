import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotificationList, deleteNotification, resetDeleteState } from '../redux/slices/notificationListSlice';
import { SkeletonBlock } from './common/Skeleton';

const PAGE_SIZE_OPTIONS = [5, 10, 50, 100, 'All'];

const NotificationList = ({ onEdit, onView }) => {
  const dispatch = useDispatch();
  const { 
    items: notifications, 
    loading, 
    error,
    deleting,
    deleteError,
    deleteResult
  } = useSelector(state => state.notificationList);

  useEffect(() => {
    console.log('[NOTIFICATION_LIST] Dispatch fetchNotificationList');
    dispatch(fetchNotificationList());
  }, [dispatch]);

  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = Array.isArray(notifications) ? [...notifications] : [];

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      data = data.filter(
        (item) =>
          (item.n_subject || '').toLowerCase().includes(searchLower) ||
          (item.n_description || '').toLowerCase().includes(searchLower) ||
          (item.n_date || '').includes(searchText)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (sortConfig.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return data;
  }, [searchText, sortConfig, notifications]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (pageSize === 'All') {
      return filteredData;
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = pageSize === 'All' ? 1 : Math.ceil(filteredData.length / pageSize);
  const startEntry =
    filteredData.length === 0
      ? 0
      : pageSize === 'All'
      ? 1
      : (currentPage - 1) * pageSize + 1;
  const endEntry =
    filteredData.length === 0
      ? 0
      : pageSize === 'All'
      ? filteredData.length
      : Math.min(currentPage * pageSize, filteredData.length);
  const totalEntries = filteredData.length;

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

  // Handle delete notification
  const handleDeleteNotification = (item) => {
    setNotificationToDelete(item);
    console.log('[NOTIFICATION_LIST] Deleting notification:', item);
    
    // Call API to delete notification
    dispatch(deleteNotification({
      n_id: item.n_id,
      n_subject: item.n_subject || '',
      n_date: item.n_date || '',
      n_description: item.n_description || ''
    }));
  };

  // Handle delete success/error
  useEffect(() => {
    if (deleteResult) {
      console.log('[NOTIFICATION_LIST] Delete success:', deleteResult);
      // Show success modal
      setSuccessModalVisible(true);
      setNotificationToDelete(null);
      // Refetch notification list
      dispatch(fetchNotificationList());
      // Reset delete state after a delay to prevent re-triggering
      setTimeout(() => {
        dispatch(resetDeleteState());
      }, 100);
    }
    if (deleteError) {
      console.log('[NOTIFICATION_LIST] Delete error:', deleteError);
      const errorMessage = deleteError?.message || deleteError?.data?.message || 'Failed to delete notification';
      Alert.alert('Error', errorMessage, [
        {
          text: 'OK',
          onPress: () => {
            setNotificationToDelete(null);
            dispatch(resetDeleteState());
          },
        },
      ]);
    }
  }, [deleteResult, deleteError, dispatch]);

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
    // Calculate serial number based on current page and index
    const serialNumber = pageSize === 'All' 
      ? index + 1 
      : (currentPage - 1) * (typeof pageSize === 'number' ? pageSize : 10) + index + 1;

    return (
      <View style={rowStyle}>
        {/* S. No - width 70 */}
        <View style={[styles.tableCell, { width: 70, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={styles.cellText}>{serialNumber}</Text>
        </View>
        
        {/* Action Buttons - width 250 */}
        <View style={[styles.tableCell, { width: 250, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              console.log('[NOTIFICATION_LIST] Edit pressed for:', item);
              if (onEdit) {
                onEdit(item);
              }
            }}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, { marginLeft: 4 }]}
            onPress={() => {
              console.log('[NOTIFICATION_LIST] View pressed for:', item);
              if (onView) {
                onView(item);
              }
            }}
          >
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.deleteButton, 
              { marginLeft: 4 },
              deleting && styles.deleteButtonDisabled
            ]}
            onPress={() => {
              console.log('[NOTIFICATION_LIST] Delete pressed for:', item);
              handleDeleteNotification(item);
            }}
            disabled={deleting}>
            <Text style={styles.buttonText}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Subject - width 150 */}
        <View style={[styles.tableCell, { width: 150, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={styles.cellText} numberOfLines={1}>{item.n_subject}</Text>
        </View>
        
        {/* Date - width 120 */}
        <View style={[styles.tableCell, { width: 120, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={styles.cellText}>{item.n_date}</Text>
        </View>
        
        {/* Description - width 300 */}
        <View style={[styles.tableCell, { width: 300, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={styles.cellText} numberOfLines={2}>
            {item.n_description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notification List</Text>
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
                  setCurrentPage(1);
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

      {/* Table */}
      <View style={styles.tableWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {/* S. No - width 70 */}
            <TouchableOpacity
              style={[styles.tableHeaderCell, { width: 70, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => handleSort('sNo')}
            >
              <Text style={styles.headerText}>S.no.</Text>
              {renderSortIcon('sNo')}
            </TouchableOpacity>

            {/* Action - width 250 */}
            <View style={[styles.tableHeaderCell, { width: 250, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={styles.headerText}>Action</Text>
            </View>

            {/* Subject - width 150 */}
            <TouchableOpacity
              style={[styles.tableHeaderCell, { width: 150, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => handleSort('n_subject')}
            >
              <Text style={styles.headerText}>Subject</Text>
              {renderSortIcon('n_subject')}
            </TouchableOpacity>

            {/* Date - width 120 */}
            <TouchableOpacity
              style={[styles.tableHeaderCell, { width: 120, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => handleSort('n_date')}
            >
              <Text style={styles.headerText}>Date</Text>
              {renderSortIcon('n_date')}
            </TouchableOpacity>

            {/* Description - width 300 */}
            <TouchableOpacity
              style={[styles.tableHeaderCell, { width: 300, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => handleSort('n_description')}
            >
              <Text style={styles.headerText}>Description</Text>
              {renderSortIcon('n_description')}
            </TouchableOpacity>
          </View>

          {/* Table Body */}
          {loading ? (
            <>
              {/* Header Skeleton */}
              <View style={styles.tableHeader}>
                {[70, 200, 150, 120, 300].map((w, idx) => (
                  <View key={`hdr-sk-${idx}`} style={[styles.tableHeaderCell, { width: w, alignItems: 'center', justifyContent: 'center' }]}>
                    <SkeletonBlock style={{ height: 16, width: '70%', borderRadius: 8 }} />
                  </View>
                ))}
              </View>
              {/* Row Skeletons */}
              {[...Array(8)].map((_, rowIdx) => (
                <View key={`row-sk-${rowIdx}`} style={rowIdx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  {[70, 200, 150, 120, 300].map((w, cIdx) => (
                    <View key={`cell-sk-${rowIdx}-${cIdx}`} style={[styles.tableCell, { width: w, alignItems: 'center', justifyContent: 'center' }]}>
                      <SkeletonBlock style={{ height: 14, width: cIdx === 1 ? '90%' : '80%', borderRadius: 6 }} />
                    </View>
                  ))}
                </View>
              ))}
            </>
          ) : error ? (
            <View style={styles.emptyRowContainer}>
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>Failed to load notifications</Text>
              </View>
            </View>
          ) : paginatedData.length === 0 ? (
            <View style={styles.emptyRowContainer}>
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No notifications found</Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={paginatedData}
              keyExtractor={(item) => `${item.n_id}`}
              renderItem={renderRow}
              scrollEnabled={false}
            />
          )}
          </View>
        </ScrollView>
      </View>

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          Showing {startEntry} to {endEntry} of {totalEntries} entry
          {totalEntries !== 1 ? 'ies' : ''}
        </Text>

        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <Text
              style={[
                styles.paginationIconText,
                currentPage === 1 && styles.paginationIconTextDisabled,
              ]}
            >
              «
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Text
              style={[
                styles.paginationIconText,
                currentPage === 1 && styles.paginationIconTextDisabled,
              ]}
            >
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
                (currentPage === totalPages || totalPages === 0) &&
                  styles.paginationIconTextDisabled,
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
                (currentPage === totalPages || totalPages === 0) &&
                  styles.paginationIconTextDisabled,
              ]}
            >
              »
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}>
        <TouchableOpacity
          style={styles.successModalOverlay}
          activeOpacity={1}
          onPress={() => setSuccessModalVisible(false)}>
          <TouchableOpacity
            style={styles.successModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Icon name="check" size={48} color="#10B981" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.successModalTitle}>Success!</Text>

            {/* Message */}
            <Text style={styles.successModalMessage}>
              Notification deleted successfully.
            </Text>

            {/* OK Button */}
            <TouchableOpacity
              style={styles.successOkButton}
              onPress={() => {
                setSuccessModalVisible(false);
                // Reset delete state when modal is closed
                dispatch(resetDeleteState());
              }}>
              <Text style={styles.successOkButtonText}>OK</Text>
            </TouchableOpacity>
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
    fontSize: 26,
    fontWeight: '700',
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
  },
  entriesLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    marginRight: 55,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#60A5FA',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    marginLeft: -2,
    marginTop: 12,
    top: 15,
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
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  tableWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  tableContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    width: '100%',
  },
  tableHeaderCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    justifyContent: 'center',
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
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 60,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 60,
  },
  tableCell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#111827',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyRowContainer: {
    width: '100%',
  },
  emptyRow: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
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
  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 28,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  successOkButton: {
    backgroundColor: '#F37438',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    shadowColor: '#F37438',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  successOkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default NotificationList;

