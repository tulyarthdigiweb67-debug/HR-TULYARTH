import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Navbar({ onMenuPress, onOptionsPress }) {
  return (
    <>
      {/* ✅ Status Bar */}
      <StatusBar
        backgroundColor="#ffffff"
        barStyle="dark-content"
        translucent={false}
      />

      {/* ✅ Top Navbar */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          {/* Left: Hamburger Menu */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            activeOpacity={0.7}>
            <View style={styles.hamburger}>
              <View style={styles.line} />
              <View style={styles.line} />
              <View style={styles.line} />
            </View>
          </TouchableOpacity>

          {/* Center: Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assests/images/tly.jpg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Right: User Icon */}
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={onOptionsPress}
            activeOpacity={0.7}>
            <Icon name="account-circle" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E95420',
    paddingHorizontal: 8,
    height: 56,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
  },
  menuButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburger: {
    width: 22,
    height: 16,
    justifyContent: 'space-between',
  },
  line: {
    width: 22,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoImage: {
    width: 125, // ✅ Matches the uploaded screenshot look
    height: 40,
  },
  optionsButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
