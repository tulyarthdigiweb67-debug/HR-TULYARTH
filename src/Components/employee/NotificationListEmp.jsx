import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotificationList } from '../../redux/slices/notificationListSlice';
import { SkeletonBlock } from '../common/Skeleton';
import NotificationCard from '../NotificationCard';

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 'All'];

const formatDate = (dateString) => {
  if (!dateString) {
    return '--';
  }
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const EmployeeNotificationList = ({ onBack, autoOpenLatest = false }) => {
  const dispatch = useDispatch();
  const { items: notifications, loading, error } = useSelector(
    (state) => state.notificationList
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'n_date', direction: 'desc' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [autoOpenHandled, setAutoOpenHandled] = useState(false);

  useEffect(() => {
    dispatch(fetchNotificationList());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  const filteredNotifications = useMemo(() => {
    let data = Array.isArray(notifications) ? [...notifications] : [];

    if (searchQuery.trim().length > 0) {
      const term = searchQuery.toLowerCase();
      data = data.filter((item) => {
        const subject = (item?.n_subject || '').toLowerCase();
        const date = (item?.n_date || '').toLowerCase();
        return subject.includes(term) || date.includes(term);
      });
    }

    if (sortConfig.key) {
      data.sort((a, b) => {
        // For numeric ids/dates, try to compare properly
        let aVal = a?.[sortConfig.key] ?? '';
        let bVal = b?.[sortConfig.key] ?? '';

        // If sorting by date, parse to timestamp
        if (sortConfig.key === 'n_date') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        } else {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        if (aVal === bVal) return 0;
        if (sortConfig.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
    }

    return data;
  }, [notifications, searchQuery, sortConfig]);

  const paginatedData = useMemo(() => {
    if (pageSize === 'All') {
      return filteredNotifications;
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredNotifications.slice(startIndex, endIndex);
  }, [filteredNotifications, currentPage, pageSize]);

  const totalEntries = filteredNotifications.length;
  const totalPages =
    pageSize === 'All' ? 1 : Math.max(1, Math.ceil(totalEntries / (pageSize || 1)));
  const startEntry =
    totalEntries === 0
      ? 0
      : pageSize === 'All'
      ? 1
      : (currentPage - 1) * pageSize + 1;
  const endEntry =
    totalEntries === 0
      ? 0
      : pageSize === 'All'
      ? totalEntries
      : Math.min(currentPage * pageSize, totalEntries);

  const handleSort = (key) => {
    // allow 'serial' header to map to 'n_id' if needed
    const mappedKey = key === 'serial' ? 'n_id' : key;
    setSortConfig((prev) => {
      if (prev.key === mappedKey) {
        return { key: mappedKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: mappedKey, direction: 'asc' };
    });
  };

  const handleView = (item) => {
    setSelectedNotification(item);
  };

  const closeDetailView = () => {
    setSelectedNotification(null);
  };

  const renderSortIndicator = (columnKey) => {
    const mapped = columnKey === 'serial' ? 'n_id' : columnKey;
    if (sortConfig.key !== mapped) {
      return (
        <View style={styles.sortIconStack}>
          <Icon name="keyboard-arrow-up" size={16} color="#CBD5F5" />
          <Icon name="keyboard-arrow-down" size={16} color="#CBD5F5" />
        </View>
      );
    }

    return (
      <Icon
        name={sortConfig.direction === 'asc' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
        size={18}
        color="#F97316"
      />
    );
  };

  const renderRow = ({ item, index }) => {
    const serial =
      pageSize === 'All'
        ? index + 1
        : (currentPage - 1) * (typeof pageSize === 'number' ? pageSize : 10) + index + 1;

    return (
      <View style={[styles.tableRow, index % 2 === 1 && styles.altRow]}>
        <View style={[styles.tableCell, styles.serialCell]}>
          <Text style={styles.cellText}>{serial}</Text>
        </View>

        <View style={[styles.tableCell, styles.actionCell]}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleView(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tableCell, styles.subjectCell]}>
          <Text style={styles.subjectText} numberOfLines={1}>
            {item?.n_subject || '--'}
          </Text>
        </View>

        <View style={[styles.tableCell, styles.dateCell]}>
          <Text style={styles.cellText}>{formatDate(item?.n_date)}</Text>
        </View>
      </View>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <>
          {[...Array(6)].map((_, idx) => (
            <View key={`sk-${idx}`} style={[styles.tableRow, idx % 2 === 1 && styles.altRow]}>
              {[70, 120, 250, 120].map((widthVal, innerIdx) => (
                <View
                  key={`sk-cell-${idx}-${innerIdx}`}
                  style={[styles.tableCell, { width: widthVal }]}
                >
                  <SkeletonBlock style={{ height: 16, width: '80%', borderRadius: 8 }} />
                </View>
              ))}
            </View>
          ))}
        </>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Icon name="error-outline" size={40} color="#F87171" />
          <Text style={styles.emptyTitle}>Unable to load notifications</Text>
          <Text style={styles.emptySubtitle}>Please pull to refresh or try again later.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchNotificationList())}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="notifications-off" size={40} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No notifications found</Text>
          <Text style={styles.emptySubtitle}>New announcements will appear here.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={paginatedData}
        keyExtractor={(item, idx) => String(item?.n_id ?? idx)}
        renderItem={renderRow}
        scrollEnabled={false}
      />
    );
  };

  useEffect(() => {
    if (autoOpenLatest && !autoOpenHandled && filteredNotifications.length > 0) {
      setSelectedNotification(filteredNotifications[0]);
      setAutoOpenHandled(true);
    }

    if (!autoOpenLatest && autoOpenHandled) {
      setAutoOpenHandled(false);
    }
  }, [autoOpenLatest, autoOpenHandled, filteredNotifications]);

  if (selectedNotification) {
    return (
      <View style={styles.cardScreen}>
        <NotificationCard
          notification={selectedNotification}
          notificationId={selectedNotification?.n_id}
          onBack={closeDetailView}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-back-ios" size={18} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.heading}>Notification List</Text>
          
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.controlsRow}>
          <View style={styles.entriesSelector}>
            <Text style={styles.controlLabel}>Show</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setDropdownOpen(true)}
              activeOpacity={0.9}
            >
              <Text style={styles.dropdownValue}>{pageSize}</Text>
              <Icon name="arrow-drop-down" size={20} color="#2563EB" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>entries</Text>
          </View>

          <View style={styles.searchWrapper}>
            <Icon name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search subject or date"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.tableWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <TouchableOpacity
                  style={[styles.headerCell, styles.serialCellHeader]}
                  onPress={() => handleSort('serial')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.headerText}>S. No</Text>
                  {renderSortIndicator('serial')}
                </TouchableOpacity>

                <View style={[styles.headerCell, styles.actionCellHeader]}>
                  <Text style={styles.headerText}>Action</Text>
                </View>

                <TouchableOpacity
                  style={[styles.headerCell, styles.subjectCellHeader]}
                  onPress={() => handleSort('n_subject')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.headerText}>Subject</Text>
                  {renderSortIndicator('n_subject')}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.headerCell, styles.dateCellHeader]}
                  onPress={() => handleSort('n_date')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.headerText}>Date</Text>
                  {renderSortIndicator('n_date')}
                </TouchableOpacity>
              </View>

              {renderBody()}
            </View>
          </ScrollView>
        </View>

        <View style={styles.paginationBar}>
          <Text style={styles.paginationText}>
            Showing {startEntry} to {endEntry} of {totalEntries} entries
          </Text>
          <View style={styles.paginationControls}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
              onPress={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <Text style={[styles.pageButtonText, currentPage === 1 && styles.disabledButtonText]}>
                «
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <Text style={[styles.pageButtonText, currentPage === 1 && styles.disabledButtonText]}>
                ‹
              </Text>
            </TouchableOpacity>

            {[...Array(totalPages)].map((_, idx) => {
              const pageNumber = idx + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - currentPage) <= 1
              ) {
                return (
                  <TouchableOpacity
                    key={pageNumber}
                    style={[
                      styles.pageNumber,
                      currentPage === pageNumber && styles.pageNumberActive,
                    ]}
                    onPress={() => setCurrentPage(pageNumber)}
                  >
                    <Text
                      style={[
                        styles.pageNumberText,
                        currentPage === pageNumber && styles.pageNumberTextActive,
                      ]}
                    >
                      {pageNumber}
                    </Text>
                  </TouchableOpacity>
                );
              }

              if (Math.abs(pageNumber - currentPage) === 2) {
                return (
                  <Text key={`ellipsis-${pageNumber}`} style={styles.ellipsis}>
                    ...
                  </Text>
                );
              }
              return null;
            })}

            <TouchableOpacity
              style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
              onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <Text
                style={[styles.pageButtonText, currentPage === totalPages && styles.disabledButtonText]}
              >
                ›
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
              onPress={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <Text
                style={[styles.pageButtonText, currentPage === totalPages && styles.disabledButtonText]}
              >
                »
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Entries dropdown modal */}
      <Modal
        animationType="fade"
        transparent
        visible={dropdownOpen}
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.dropdownPanel}>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={String(option)}
                style={[
                  styles.dropdownOption,
                  option === pageSize && styles.dropdownOptionActive,
                ]}
                onPress={() => {
                  setPageSize(option);
                  setDropdownOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    option === pageSize && styles.dropdownOptionTextActive,
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
  cardScreen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EEF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTexts: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B1220',
  },
  subHeading: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  entriesSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlLabel: {
    fontSize: 14,
    color: '#475569',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EEF8',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    backgroundColor: '#FBFDFF',
  },
  dropdownValue: {
    fontSize: 14,
    color: '#0B1220',
    fontWeight: '600',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    flex: 1,
    minWidth: 220,
    maxWidth: 420,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0B1220',
  },
  tableWrapper: {
    width: '100%',
    marginTop: 6,
    flex: 1,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    paddingBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FBFDFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    justifyContent: 'center',
    gap: 6,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0C1622',
    letterSpacing: 0.2,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F9',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 64,
  },
  altRow: {
    backgroundColor: '#FBFDFF',
  },
  tableCell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#0B1220',
    textAlign: 'center',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B1220',
    textAlign: 'center',
  },

  /* column widths */
  serialCell: { width: 70, alignItems: 'center', justifyContent: 'center' },
  actionCell: { width: 120, alignItems: 'center', justifyContent: 'center' },
  subjectCell: { width: 280, alignItems: 'center', justifyContent: 'center' },
  dateCell: { width: 150, alignItems: 'center', justifyContent: 'center' },

  serialCellHeader: { width: 70, alignItems: 'center', justifyContent: 'center' },
  actionCellHeader: { width: 120, alignItems: 'center', justifyContent: 'center' },
  subjectCellHeader: { width: 280, alignItems: 'center', justifyContent: 'center' },
  dateCellHeader: { width: 150, alignItems: 'center', justifyContent: 'center' },

  viewButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  paginationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  paginationText: {
    fontSize: 13,
    color: '#475569',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  pageButtonText: {
    fontSize: 16,
    color: '#0B1220',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.35,
  },
  disabledButtonText: {
    color: '#94A3B8',
  },
  pageNumber: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    backgroundColor: '#FFF',
  },
  pageNumberActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  pageNumberText: {
    fontSize: 13,
    color: '#0B1220',
    fontWeight: '700',
  },
  pageNumberTextActive: {
    color: '#FFFFFF',
  },
  ellipsis: {
    color: '#94A3B8',
    fontSize: 16,
    paddingHorizontal: 4,
  },
  sortIconStack: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1220',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  retryText: {
    color: '#2563EB',
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 28, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    width: 160,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#0B1220',
  },
  dropdownOptionTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

});

export default EmployeeNotificationList;
