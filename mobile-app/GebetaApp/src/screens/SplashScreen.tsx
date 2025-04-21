import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

// SVG Logo Component (Similar to the web version)
const GebetaLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <View style={styles.logoInner}>
        <View style={[styles.foodItem, { backgroundColor: '#C73030', left: 15, top: 15 }]} />
        <View style={[styles.foodItem, { backgroundColor: '#4CAF50', right: 15, top: 15 }]} />
        <View style={[styles.foodItem, { backgroundColor: '#8D6E63', bottom: 15 }]} />
      </View>
    </View>
  </View>
);

const SplashScreen = () => {
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.elastic(1),
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.bounce,
        }),
      ]),
    ]).start();
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#FFF9F2', '#F5E1C9']}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      <Animated.View style={[styles.content, { 
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          { rotate: spin }
        ] 
      }]}>
        <GebetaLogo />
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Gebeta</Text>
        <Text style={styles.subtitle}>Ethiopian Food Delivery</Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={styles.tagline}>Taste of Ethiopia at your doorstep</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#8B572A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E5A764',
    position: 'relative',
  },
  foodItem: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4F2D1F',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'DMSans-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#8B572A',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  tagline: {
    fontSize: 16,
    color: '#8B572A',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'DMSans-Regular',
  },
});

export default SplashScreen;