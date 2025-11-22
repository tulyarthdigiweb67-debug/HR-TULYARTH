import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SignInScreen({ onSignInSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  // Professional entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Staggered professional entrance animation
    Animated.sequence([
      // Logo appears first
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoScaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Then header and form
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, logoFadeAnim, logoScaleAnim]);

  const handleSignIn = () => {
    // Validation: Check if fields are empty
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Required Field',
        'Please fill in this field.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    // If validation passes, proceed with sign in via API
    console.log('[UI] Sign in clicked', { email });

    // No role in UI: thunk will try all roles automatically
    dispatch(login({ email, password }))
      .unwrap()
      .then((res) => {
        console.log('[UI] Login success (unwrapped):', res);
        if (onSignInSuccess) {
          onSignInSuccess();
        }
      })
      .catch((e) => {
        console.log('[UI] Login failed (unwrapped):', e);
        Alert.alert('Login Failed', e?.data?.message || e?.message || 'Please check your credentials');
      });
  };

  // Team photo for HR Management app
  const teamPhoto = require('../../assests/images/team.jpg');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

              {/* Team Photo at the top */}
              <Animated.View 
                style={[
                  styles.teamPhotoContainer,
                  {
                    opacity: logoFadeAnim,
                    transform: [{ scale: logoScaleAnim }]
                  }
                ]}
              >
                <Image 
                  source={teamPhoto} 
                  style={styles.teamPhoto} 
                  resizeMode="cover" 
                />
              </Animated.View>

              <Animated.View 
                style={[
                  styles.headerContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Login to your account</Text>
              </Animated.View>

              <Animated.View 
                style={[
                  styles.formContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                {/* Role selection removed: roles are tried automatically during login */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, { flex: 1, borderWidth: 0 }]}
                      placeholder="Password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Icon
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        style={styles.eyeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleSignIn} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                </TouchableOpacity>

                {!!error && (
                  <Text style={{ color: 'red', marginTop: 10 }}>
                    {error?.data?.message || error?.message || 'Login error'}
                  </Text>
                )}
              </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  teamPhotoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  teamPhoto: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '400',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#374151',
    fontWeight: '400',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  eyeButton: {
    padding: 5,
  },
  eyeIcon: {
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#FF7B3D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF7B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
