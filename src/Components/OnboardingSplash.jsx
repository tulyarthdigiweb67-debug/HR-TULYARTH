import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Text,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function OnboardingSplash({ onFinish, fadeInMs = 1200 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;
  const [currentSlide, setCurrentSlide] = useState(0);
  const swipeThreshold = 50;

  const slides = useMemo(
    () => [
      require('../assests/images/main2.jpg'),
      require('../assests/images/hr.jpg'),
      
    ],
    [],
  );

  useEffect(() => {
    opacity.setValue(0);
    quoteAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: fadeInMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(quoteAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, quoteAnim, fadeInMs, currentSlide]);

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onFinish?.();
      return;
    }
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const handlePrevious = () => {
    if (isFirstSlide) {
      return;
    }
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (dx <= -swipeThreshold) {
          handleNext();
        } else if (dx >= swipeThreshold) {
          handlePrevious();
        }
      },
    })
  ).current;

  const isHrImage = currentSlide === 1;

  const quoteTranslateY = quoteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Animated.View style={[styles.imageWrapper, { opacity }]}>
        {isHrImage ? (
          // Special layout for hr.jpg - image at top
          <View style={styles.hrImageContainer} {...panResponder.panHandlers}>
            <Animated.View style={[styles.hrImageWrapper, { opacity }]}>
              <ImageBackground
                source={slides[currentSlide]}
                style={styles.hrImage}
                imageStyle={styles.hrImageInner}
                resizeMode="contain"
              >
                <View style={styles.hrImageOverlay} />
              </ImageBackground>
            </Animated.View>
            <View style={styles.hrContent}>
              {/* Progress Bar */}
              <View style={styles.progressBar}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDotSpacing,
                      styles.progressDot,
                      index === currentSlide && styles.progressDotActive,
                    ]}
                  />
                ))}
              </View>
              
              {/* Quote for HR image */}
              <Animated.View 
                style={[
                  styles.hrQuoteContainer,
                  {
                    opacity: quoteAnim,
                    transform: [{ translateY: quoteTranslateY }],
                  },
                ]}
              >
                <View style={styles.welcomeBackContainer}>
                  <Text style={styles.hrQuoteTitle}>Welcome Back</Text>
                  <View style={styles.titleUnderline} />
                </View>
                <Text style={styles.hrQuoteText}>
                  "Teamwork makes the dream work"
                </Text>
                <Text style={styles.hrQuoteSubtext}>
                  Manage your workforce efficiently
                </Text>
              </Animated.View>
              
              {/* Navigation Buttons */}
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePrevious}
                  disabled={isFirstSlide}
                  style={[styles.navButton, isFirstSlide && styles.navButtonDisabled]}
                >
                  <Text style={[styles.navButtonText, isFirstSlide && styles.navButtonTextDisabled]}>
                    Previous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleNext}
                  style={[styles.ctaButton, isLastSlide && styles.ctaButtonPrimary]}
                >
                  <Text style={[styles.ctaText, isLastSlide && styles.ctaTextPrimary]}>
                    {isLastSlide ? 'Continue' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // Original layout for other images
          <ImageBackground
            source={slides[currentSlide]}
            style={styles.image}
            imageStyle={styles.imageInner}
            resizeMode="contain"
            {...panResponder.panHandlers}
          >
            {/* Overlay */}
            <View style={styles.scrim} />
            
            <View style={styles.content}>
              {/* Progress Bar */}
              <View style={styles.progressBar}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDotSpacing,
                      styles.progressDot,
                      index === currentSlide && styles.progressDotActive,
                    ]}
                  />
                ))}
              </View>
              
              {/* Navigation Buttons */}
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePrevious}
                  disabled={isFirstSlide}
                  style={[styles.navButton, isFirstSlide && styles.navButtonDisabled]}
                >
                  <Text style={[styles.navButtonText, isFirstSlide && styles.navButtonTextDisabled]}>
                    Previous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleNext}
                  style={[styles.ctaButton, isLastSlide && styles.ctaButtonPrimary]}
                >
                  <Text style={[styles.ctaText, isLastSlide && styles.ctaTextPrimary]}>
                    {isLastSlide ? 'Continue' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageWrapper: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageInner: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  
  // Top Quote Container (Only for main3)
  topQuoteContainer: {
    position: 'absolute',
    top: 80,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  quoteCard: {
    // backgroundColor: 'rgba(243, 111, 33, 0.95)',
    borderRadius: 20,
    padding: 24,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quoteIcon: {
    fontSize: 60,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: 'bold',
    lineHeight: 50,
    marginBottom: -10,
  },
  topQuoteText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  
  // Bottom Quote Container (Only for main3)
  bottomQuoteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  bottomQuoteText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  // Progress Bar
  progressBar: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressDotActive: {
    width: 24,
    borderRadius: 12,
    backgroundColor: '#F36F21',
  },
  progressDotSpacing: {
    marginHorizontal: 5,
  },
  
  // Navigation Buttons
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F36F21',
    borderWidth: 1,
    borderColor: '#F36F21',
    marginRight: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#ffffff',
  },
  ctaButton: {
    flex: 1,
    backgroundColor: '#F36F21',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F36F21',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  ctaButtonPrimary: {
    backgroundColor: '#F36F21',
    borderColor: '#F36F21',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaTextPrimary: {
    color: '#ffffff',
  },
  
  // HR Image Layout Styles
  hrImageContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  hrImageWrapper: {
    height: height * 0.5,
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  hrImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hrImageInner: {
    width: '100%',
    height: '100%',
  },
  hrImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  hrContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
  },
  hrQuoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeBackContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  hrQuoteTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: '#F36F21',
    borderRadius: 2,
    marginTop: 4,
  },
  hrQuoteText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  hrQuoteSubtext: {
    fontSize: 15,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
});