// App.js
import React, { useMemo, useState } from 'react';
import { StatusBar, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SignInScreen from './src/Components/auth/SignInScreen';
import DashboardScreen from './src/Components/DashboardScreen';
import EmployeeWorkspace from './src/Components/employee/EmployeeWorkspace';
import { useDispatch, useSelector } from 'react-redux';
import OnboardingSplash from './src/Components/OnboardingSplash';
import { signOut } from './src/redux/slices/authSlice';
import { detectRoleFromPayload } from './src/utils/roleUtils';

export default function App() {
  // Commented out sign-in logic to show dashboard directly
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [pendingSignOutContext, setPendingSignOutContext] = useState('admin');
  const dispatch = useDispatch();
  const { role, user } = useSelector((state) => state.auth);

  const derivedRole = useMemo(() => {
    if (role && typeof role === 'string') {
      return role;
    }
    return detectRoleFromPayload(user);
  }, [role, user]);

  const normalizedRole = (derivedRole || '').toString().toLowerCase();

  const employeeName = useMemo(() => {
    const combinedName = [
      user?.employee_first_name,
      user?.employee_last_name,
    ]
      .filter((part) => typeof part === 'string' && part.trim().length > 0)
      .join(' ')
      .trim();

    if (combinedName.length > 0) {
      return combinedName;
    }

    if (typeof user?.employee_full_name === 'string' && user.employee_full_name.trim().length > 0) {
      return user.employee_full_name.trim();
    }

    if (typeof user?.name === 'string' && user.name.trim().length > 0) {
      return user.name.trim();
    }

    if (typeof user?.employee_name === 'string' && user.employee_name.trim().length > 0) {
      return user.employee_name.trim();
    }

    if (typeof user?.employee_email === 'string' && user.employee_email.includes('@')) {
      return user.employee_email.split('@')[0];
    }

    return 'Employee';
  }, [user]);

  const notificationsCount = useMemo(() => {
    if (typeof user?.unread_notifications === 'number') {
      return user.unread_notifications;
    }
    if (Array.isArray(user?.notifications)) {
      return user.notifications.length;
    }
    return 0;
  }, [user]);

  const handleSignInSuccess = () => {
    setIsSignedIn(true);
  };

  const requestSignOut = (context = 'admin') => {
    setPendingSignOutContext(context);
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    setIsSignedIn(false);
    setPendingSignOutContext('admin');
    dispatch(signOut());
  };

  const handleCancelSignOut = () => {
    setShowSignOutModal(false);
    setPendingSignOutContext('admin');
  };

  const renderSignedInContent = () => {
    if (normalizedRole === 'employee') {
      return (
        <EmployeeWorkspace
          employeeName={employeeName}
          notificationsCount={notificationsCount}
          onRequestSignOut={() => requestSignOut('employee')}
          user={user}
        />
      );
    }

    return <DashboardScreen onSignOut={requestSignOut} userRole={normalizedRole || 'admin'} />;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: showSplash ? '#F36F21' : '#ffffff' }}
        edges={['top', 'left', 'right', 'bottom']}
      >
        {!showSplash && (
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
        )}
        <React.Fragment>
          {showSplash ? (
            <OnboardingSplash onFinish={() => setShowSplash(false)} />
          ) : isSignedIn ? (
            <>
              {renderSignedInContent()}
              <Modal
                visible={showSignOutModal}
                animationType="fade"
                transparent
                onRequestClose={handleCancelSignOut}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalCard}>
                    <View style={[styles.modalIconBadge, styles.modalIconBadgeWarning]}>
                      <Text style={styles.modalIconText}>!</Text>
                    </View>
                    <Text style={styles.modalTitle}>Are you sure?</Text>
                    <Text style={styles.modalMessage}>
                      {pendingSignOutContext === 'hr'
                        ? 'You are about to switch to the HR workspace.'
                        : 'You will be logged out of your session.'}
                    </Text>
                    <View style={styles.modalActionsRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.confirmButton]}
                        activeOpacity={0.9}
                        onPress={handleConfirmSignOut}
                      >
                        <Text style={styles.modalButtonText}>
                          {pendingSignOutContext === 'hr' ? 'Yes, continue' : 'Yes, logout'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        activeOpacity={0.9}
                        onPress={handleCancelSignOut}
                      >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </>
          ) : (
            <SignInScreen onSignInSuccess={handleSignInSuccess} />
          )}
        </React.Fragment>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 26, 40, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#F6B37D',
  },
  modalIconBadgeWarning: {
    backgroundColor: '#FFF3EC',
    borderColor: '#F6B37D',
  },
  modalIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F36F21',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#152238',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4F5D6E',
    textAlign: 'center',
    marginBottom: 22,
  },
  modalActionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginHorizontal: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#F36F21',
  },
  cancelButton: {
    backgroundColor: '#D62828',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
