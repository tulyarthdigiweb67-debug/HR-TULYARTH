import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeList, deleteEmployee } from '../redux/slices/employeeListSlice';
import { SkeletonBlock, SkeletonCircle } from './common/Skeleton';

const DEFAULT_PAGE_SIZES = [5, 10, 50, 100, 'All'];

const DEFAULT_AVATAR = require('../assests/images/avatar.jpg');

export default function EmployeeList({ onView, onEdit }) {
  const dispatch = useDispatch();
  const {
    loading,
    items = [],
    error,
    deleteLoading,
    deleteError,
  } = useSelector((state) => state.employeeList || {});

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [openPageSize, setOpenPageSize] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const employeeCount = items.length;

  useEffect(() => {
    if (!employeeCount && !loading) {
      dispatch(fetchEmployeeList());
    }
  }, [dispatch, employeeCount, loading]);

  const mappedEmployees = useMemo(() => {
    return (items || []).map((e) => {
      const presentAddress = [
        e.employee_present_address1,
        e.employee_present_address2,
        e.employee_present_city,
        e.employee_present_state,
        e.employee_present_country,
        e.employee_present_postal,
      ]
        .filter(Boolean)
        .join(', ');

      const permanentAddress = [
        e.employee_permanent_address1,
        e.employee_permanent_address2,
        e.employee_permanent_city,
        e.employee_permanent_state,
        e.employee_permanent_country,
        e.employee_permanent_postal,
      ]
        .filter(Boolean)
        .join(', ');

      const photoSrc = e.employee_photo
        ? { uri: `https://hr.tulyarthdigiweb.com/uploads/${e.employee_photo}` }
        : DEFAULT_AVATAR;

      return {
        id: String(e.employee_id),
        photo: photoSrc,
        firstName: e.employee_first_name || '-',
        lastName: e.employee_last_name || '-',
        email: e.employee_email || '-',
        phone: e.employee_phone || '-',
        uan: e.employee_uan_number || '-',
        officialEmail: e.employee_official_email || '-',
        aadhaar: e.employee_aadhaar_number || '-',
        pan: e.employee_pan_number || '-',
        presentAddress: presentAddress || '-',
        permanentAddress: permanentAddress || '-',
        department: e.employee_department || '-',
        title: e.employee_title || '-',
        skillSet: e.employee_skills || '-',
        currentSalary: e.employee_current_salary || '-',
        experience: e.employee_experience || '-',
        location: e.employee_location || '-',
        sourceOfHire: e.employee_source_of_hire || '-',
        qualification: e.employee_qualification || '-',
        additionalInfo: e.employee_additional_info || 'N/A',
        offerLetter: e.employee_offer_letter || 'N/A',
        schoolName: e.employee_school_name || '-',
        degree: e.employee_degree || '-',
        fieldOfStudy: e.employee_field || '-',
        completionDate: e.employee_completion_date || '-',
        notes: e.employee_notes || 'N/A',
        occupation: e.employee_occupation || '-',
        company: e.employee_company || '-',
        summary: e.employee_summary || '-',
        duration: e.employee_duration || '-',
        currentlyHere: e.employee_currently_working || '-',
        role: e.employee_role || '-',
        designation: e.employee_designation || '-',
      };
    });
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mappedEmployees;
    return mappedEmployees.filter((e) =>
      [
        e.firstName,
        e.lastName,
        e.email,
        e.phone,
        e.department,
        e.title,
        e.skillSet,
      ]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [query, mappedEmployees]);

  const effectivePageSize = pageSize === 'All' ? (filtered.length === 0 ? 1 : filtered.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / effectivePageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * effectivePageSize;
  const pageData = filtered.slice(startIndex, startIndex + effectivePageSize);

  const renderHeaderCell = (label, width) => (
    <View style={[styles.th, { width }]}> 
      <Text style={styles.thText}>{label}</Text>
      <Icon name="unfold-more" size={16} color="#9AA0A6" />
    </View>
  );

  const renderRow = ({ item, index }) => (
    <View style={[styles.tr, index % 2 === 0 ? styles.trEven : styles.trOdd]}> 
      {/* S. No - width 70 */}
      <View style={[styles.td, { width: 70, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.tdText}>{startIndex + index + 1}</Text>
      </View>
      
      {/* Action Buttons - width 230 */}
      <View style={[styles.td, { width: 230, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}> 
        <TouchableOpacity 
          style={[styles.badge, { backgroundColor: '#FACC15' }]} 
          onPress={() => onView ? onView(item.id) : null}>
          <Text style={styles.badgeText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.badge, { backgroundColor: '#22C55E', marginLeft: 4 }]}
          onPress={() => onEdit ? onEdit(item) : null}>
          <Text style={styles.badgeText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.badge, { backgroundColor: '#EF4444', marginLeft: 4 }]}
          onPress={() => {
            setEmployeeToDelete(item);
            setDeleteModalVisible(true);
          }}>
          <Text style={styles.badgeText}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      {/* Photo - width 100 */}
      <View style={[styles.td, { width: 100, alignItems: 'center', justifyContent: 'center' }]}> 
        <Image source={item.photo} style={styles.avatar} />
      </View>
      
      {/* First Name - width 130 */}
      <View style={[styles.td, { width: 130 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.firstName}</Text>
      </View>
      
      {/* Last Name - width 130 */}
      <View style={[styles.td, { width: 130 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.lastName}</Text>
      </View>
      
      {/* Email - width 200 */}
      <View style={[styles.td, { width: 200 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.email}</Text>
      </View>
      
      {/* Phone - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.phone}</Text>
      </View>
      
      {/* UAN - width 100 */}
      <View style={[styles.td, { width: 100 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.uan || '-'}</Text>
      </View>
      
      {/* Official Email - width 200 */}
      <View style={[styles.td, { width: 200 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.officialEmail || '-'}</Text>
      </View>
      
      {/* Aadhaar - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.aadhaar || '-'}</Text>
      </View>
      
      {/* PAN - width 130 */}
      <View style={[styles.td, { width: 130 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.pan || '-'}</Text>
      </View>
      
      {/* Present Address - width 300 */}
      <View style={[styles.td, { width: 300 }]}>
        <Text style={styles.tdText} numberOfLines={2}>{item.presentAddress}</Text>
      </View>
      
      {/* Permanent Address - width 300 */}
      <View style={[styles.td, { width: 300 }]}>
        <Text style={styles.tdText} numberOfLines={2}>{item.permanentAddress}</Text>
      </View>
      
      {/* Department - width 120 */}
      <View style={[styles.td, { width: 120 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.department}</Text>
      </View>
      
      {/* Title - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.title || '-'}</Text>
      </View>
      
      {/* Skill Set - width 130 */}
      <View style={[styles.td, { width: 130 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.skillSet || '-'}</Text>
      </View>
      
      {/* Current Salary - width 140 */}
      <View style={[styles.td, { width: 140 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.currentSalary || '-'}</Text>
      </View>
      
      {/* Experience - width 120 */}
      <View style={[styles.td, { width: 120 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.experience || '-'}</Text>
      </View>
      
      {/* Location - width 130 */}
      <View style={[styles.td, { width: 130 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.location}</Text>
      </View>
      
      {/* Source of Hire - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.sourceOfHire}</Text>
      </View>
      
      {/* Qualification - width 130 */}
      <View style={[styles.td, { width: 130 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.qualification || '-'}</Text>
      </View>
      
      {/* Additional Info - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.additionalInfo}</Text>
      </View>
      
      {/* Offer Letter - width 130 */}
      <View style={[styles.td, { width: 130 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.offerLetter}</Text>
      </View>
      
      {/* School Name - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.schoolName || '-'}</Text>
      </View>
      
      {/* Degree - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.degree || '-'}</Text>
      </View>
      
      {/* Field of Study - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.fieldOfStudy || '-'}</Text>
      </View>
      
      {/* Completion Date - width 170 */}
      <View style={[styles.td, { width: 170 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.completionDate || '-'}</Text>
      </View>
      
      {/* Notes - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.notes}</Text>
      </View>
      
      {/* Occupation - width 140 */}
      <View style={[styles.td, { width: 140 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.occupation}</Text>
      </View>
      
      {/* Company - width 130 */}
      <View style={[styles.td, { width: 130 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.company}</Text>
      </View>
      
      {/* Summary - width 150 */}
      <View style={[styles.td, { width: 150 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.summary || '-'}</Text>
      </View>
      
      {/* Duration - width 120 */}
      <View style={[styles.td, { width: 120 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.duration || '-'}</Text>
      </View>
      
      {/* Currently Work Here - width 160 */}
      <View style={[styles.td, { width: 160 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.currentlyHere || '-'}</Text>
      </View>
      
      {/* Role - width 100 */}
      <View style={[styles.td, { width: 100 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.role}</Text>
      </View>
      
      {/* Designation - width 130 */}
      <View style={[styles.td, { width: 130 }]}>
        <Text style={styles.tdText} numberOfLines={1}>{item.designation || '-'}</Text>
      </View>
    </View>
  );

  const Header = () => (
    <View style={styles.headerBar}>
      <View style={styles.mainContainer}>
        <View style={styles.entriesContainer}>
        <TouchableOpacity
          style={styles.pageSizeDropdown}
          onPress={() => setOpenPageSize(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.pageSizeDropdownText}>{pageSize}</Text>
          <Icon name="keyboard-arrow-down" size={15} color="#6B7280" />
        </TouchableOpacity>
        <Text style={[styles.pageSizeLabel, { marginLeft: 5 }]}>entries per page</Text>
        {openPageSize && (
          <View style={styles.dropdownOverlay}>
            <View style={styles.dropdownMenu}>
              {DEFAULT_PAGE_SIZES.map((opt) => (
                <TouchableOpacity
                  key={`opt-${opt}`}
                  style={[styles.dropdownItem, pageSize === opt && styles.dropdownItemActive]}
                  onPress={() => {
                    setPageSize(opt);
                    setPage(1);
                    setOpenPageSize(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, pageSize === opt && styles.dropdownItemTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.dropdownCancel} onPress={() => setOpenPageSize(false)}>
                <Text style={styles.dropdownCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </View>

        <View style={styles.searchBox}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Search:"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setPage(1);
            }}
          />
        </View>
        </View>
      </View>
    </View>
  );

  const TableHeader = () => (
    <View style={styles.thead}>
      {renderHeaderCell('S. no', 70)}
      {renderHeaderCell('Action', 230)}
      {renderHeaderCell('Photo', 100)}
      {renderHeaderCell('First Name', 130)}
      {renderHeaderCell('Last Name', 130)}
      {renderHeaderCell('Email', 200)}
      {renderHeaderCell('Phone', 150)}
      {renderHeaderCell('UAN', 100)}
      {renderHeaderCell('Official Email', 200)}
      {renderHeaderCell('Aadhaar', 150)}
      {renderHeaderCell('PAN', 130)}
      {renderHeaderCell('Present Address', 300)}
      {renderHeaderCell('Permanent Address', 300)}
      {renderHeaderCell('Department', 120)}
      {renderHeaderCell('Title', 150)}
      {renderHeaderCell('Skill Set', 130)}
      {renderHeaderCell('Current Salary', 140)}
      {renderHeaderCell('Experience', 120)}
      {renderHeaderCell('Location', 130)}
      {renderHeaderCell('Source of Hire', 150)}
      {renderHeaderCell('Qualification', 130)}
      {renderHeaderCell('Additional Info', 150)}
      {renderHeaderCell('Offer Letter', 130)}
      {renderHeaderCell('School Name', 150)}
      {renderHeaderCell('Degree/Diploma', 150)}
      {renderHeaderCell('Field(s) of Study', 150)}
      {renderHeaderCell('Date of Completion', 170)}
      {renderHeaderCell('Additional Notes', 150)}
      {renderHeaderCell('Occupation', 140)}
      {renderHeaderCell('Company', 130)}
      {renderHeaderCell('Summary', 150)}
      {renderHeaderCell('Duration', 120)}
      {renderHeaderCell('Currently Work Here', 160)}
      {renderHeaderCell('Role', 100)}
      {renderHeaderCell('Designation', 130)}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee List</Text>

      <Header />

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            <TableHeader />
            {loading ? (
              <>
                {/* Header skeleton */}
                <View style={styles.thead}>
                  {[70, 230, 100, 130, 130, 200, 150, 100, 200, 150, 130, 300, 300, 120, 150, 130, 140, 120, 130, 150, 130, 150, 150, 150, 170, 150, 140, 130, 150, 120, 160, 100, 130].map((w, idx) => (
                    <View key={`emp-h-${idx}`} style={[styles.th, { width: w, alignItems: 'center', justifyContent: 'center' }]}>
                      <SkeletonBlock style={{ height: 16, width: '70%', borderRadius: 8 }} />
                    </View>
                  ))}
                </View>
                {/* Row skeletons */}
                {[...Array(8)].map((_, rIdx) => (
                  <View key={`emp-r-${rIdx}`} style={[styles.tr, rIdx % 2 === 0 ? styles.trEven : styles.trOdd]}>
                    {/* S no */}
                    <View style={[styles.td, { width: 70, alignItems: 'center', justifyContent: 'center' }]}>
                      <SkeletonBlock style={{ height: 14, width: 30, borderRadius: 6 }} />
                    </View>
                    {/* Actions */}
                    <View style={[styles.td, { width: 230, alignItems: 'center', justifyContent: 'center' }]}>
                      <SkeletonBlock style={{ height: 20, width: 60, borderRadius: 6 }} />
                    </View>
                    {/* Photo */}
                    <View style={[styles.td, { width: 100, alignItems: 'center', justifyContent: 'center' }]}>
                      <SkeletonCircle size={36} />
                    </View>
                    {/* The rest columns mimic widths */}
                    {[130,130,200,150,100,200,150,130,300,300,120,150,130,140,120,130,150,130,150,150,150,170,150,140,130,150,120,160,100,130].map((w, cIdx) => (
                      <View key={`emp-c-${rIdx}-${cIdx}`} style={[styles.td, { width: w, alignItems: 'center', justifyContent: 'center' }]}>
                        <SkeletonBlock style={{ height: 14, width: '80%', borderRadius: 6 }} />
                      </View>
                    ))}
                  </View>
                ))}
              </>
            ) : (
              <FlatList
                data={pageData}
                keyExtractor={(item) => item.id}
                renderItem={renderRow}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}> 
                    <Text style={styles.emptyText}>{error ? 'Failed to load employees' : 'No employees found.'}</Text>
                  </View>
                )}
              />
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.footerBar}>
        <Text style={styles.footerText}>
          {`Showing ${filtered.length === 0 ? 0 : startIndex + 1} to ${Math.min(
            startIndex + effectivePageSize,
            filtered.length,
          )} of ${filtered.length} entries`}
        </Text>

        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
            disabled={currentPage === 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Icon name="chevron-left" size={18} color={currentPage === 1 ? '#9CA3AF' : '#111827'} />
          </TouchableOpacity>
          <View style={[styles.pageNumber, styles.pageNumberActive]}>
            <Text style={styles.pageNumberText}>{currentPage}</Text>
          </View>
          <TouchableOpacity
            style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
            disabled={currentPage === totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <Icon name="chevron-right" size={18} color={currentPage === totalPages ? '#9CA3AF' : '#111827'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDeleteModalVisible(false)}>
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}>
            {/* Warning Icon */}
            <View style={styles.warningIconContainer}>
              <View style={styles.warningIconCircle}>
                <Text style={styles.warningIconText}>!</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Are you sure?</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>
              Do you really want to delete this employee?
            </Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.deleteButton, deleteLoading && styles.deleteButtonDisabled]}
                disabled={deleteLoading}
                onPress={async () => {
                  if (employeeToDelete) {
                    // Find the original employee data from items array
                    const originalEmployee = items.find((e) => String(e.employee_id) === employeeToDelete.id);
                    
                    if (originalEmployee) {
                      try {
                        await dispatch(deleteEmployee(originalEmployee)).unwrap();
                        // Refresh the employee list after successful deletion
                        dispatch(fetchEmployeeList());
                        setDeleteModalVisible(false);
                        setEmployeeToDelete(null);
                      } catch (error) {
                        console.error('Delete failed:', error);
                        // Error is handled by Redux state, modal will stay open
                      }
                    } else {
                      console.error('Employee data not found');
                      setDeleteModalVisible(false);
                      setEmployeeToDelete(null);
                    }
                  }
                }}>
                <Text style={styles.deleteButtonText}>
                  {deleteLoading ? 'Deleting...' : 'Yes, delete it!'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, deleteLoading && styles.cancelButtonDisabled]}
                disabled={deleteLoading}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setEmployeeToDelete(null);
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {deleteError && (
              <Text style={styles.errorText}>
                {deleteError.message || 'Failed to delete employee. Please try again.'}
              </Text>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 35,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 25,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageSizeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  pageSizeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 60,
    justifyContent: 'space-between',
  },
  pageSizeDropdownText: {
    fontSize: 12,
    color: '#111827',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  dropdownMenu: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 6,
    paddingVertical: 6,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  dropdownCancel: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 4,
  },
  dropdownCancelText: {
    color: '#6B7280',
    fontSize: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 35,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    width: 110,
    color: '#111827',
    paddingVertical: 6,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  thead: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  th: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  thText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
    marginRight: 4,
    textAlign: 'center',
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 60,
  },
  trEven: {
    backgroundColor: '#FFFFFF',
  },
  trOdd: {
    backgroundColor: '#F9FAFB',
  },
  td: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tdText: {
    color: '#111827',
    fontSize: 13,
    textAlign: 'center',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
  },
  footerBar: {
    marginHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageNumber: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pageNumberActive: {
    backgroundColor: '#F26A1B',
    borderColor: '#F26A1B',
  },
  pageNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Delete Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  warningIconText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E95420',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#E95420',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});