import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const OrderSuccessScreen = () => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  // Order details - would typically come from a context or prop
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const restaurantName = "Gusto Restaurant";
  const estimatedTime = "30-40 min";

  useEffect(() => {
    // Animate check mark
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      }),
      // Animate the rest of the content
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]),
    ]).start();
  }, []);

  const handleTrackOrder = () => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate('OrderTracking', { orderId });
  };

  const handleBackToHome = () => {
    // @ts-ignore - Navigation typing issue
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.successIconContainer}>
        <Animated.View
          style={[
            styles.checkmarkCircle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons name="checkmark" size={60} color="white" />
        </Animated.View>
      </View>
      
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Text style={styles.titleText}>Order Successful!</Text>
        <Text style={styles.subtitleText}>Your order has been placed successfully.</Text>
        
        <View style={styles.orderDetailsContainer}>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Order ID:</Text>
            <Text style={styles.orderDetailValue}>{orderId}</Text>
          </View>
          
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Restaurant:</Text>
            <Text style={styles.orderDetailValue}>{restaurantName}</Text>
          </View>
          
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Estimated Time:</Text>
            <Text style={styles.orderDetailValue}>{estimatedTime}</Text>
          </View>
        </View>
        
        <Text style={styles.messageText}>
          You can track the status of your order in real-time.
        </Text>
        
        <Button
          mode="contained"
          onPress={handleTrackOrder}
          style={styles.trackButton}
          labelStyle={styles.buttonText}
        >
          Track My Order
        </Button>
        
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleBackToHome}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIconContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
  },
  subtitleText: {
    fontSize: 16,
    color: '#8B572A',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
  },
  orderDetailsContainer: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDetailLabel: {
    fontSize: 16,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  orderDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F2D1F',
    fontFamily: 'DMSans-Medium',
  },
  messageText: {
    fontSize: 14,
    color: '#8B572A',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
  },
  trackButton: {
    backgroundColor: '#8B572A',
    paddingVertical: 8,
    width: '100%',
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
  },
  homeButton: {
    paddingVertical: 12,
  },
  homeButtonText: {
    fontSize: 16,
    color: '#8B572A',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
  },
});

export default OrderSuccessScreen;