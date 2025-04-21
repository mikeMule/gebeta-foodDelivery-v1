import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Order status step type
interface OrderStep {
  id: number;
  title: string;
  description: string;
  time: string;
  completed: boolean;
  icon: string;
}

// Driver information type
interface DriverInfo {
  name: string;
  phone: string;
  photo: string;
  vehicleType: string;
  vehicleInfo: string;
  rating: number;
}

// Order tracking screen
const OrderTrackingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // @ts-ignore - Navigation params typing issue
  const { orderId } = route.params;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedDelivery, setEstimatedDelivery] = useState('8:45 PM');
  
  // Mock locations
  const restaurantLocation = {
    latitude: 9.005401,
    longitude: 38.763611,
  };
  
  const userLocation = {
    latitude: 9.015401,
    longitude: 38.773611,
  };
  
  const [driverLocation, setDriverLocation] = useState({
    latitude: 9.007401,
    longitude: 38.765611,
  });
  
  // Order steps
  const orderSteps: OrderStep[] = [
    {
      id: 1,
      title: 'Order Confirmed',
      description: 'Your order has been received',
      time: '8:05 PM',
      completed: true,
      icon: 'checkmark-circle',
    },
    {
      id: 2,
      title: 'Preparing',
      description: 'Restaurant is preparing your food',
      time: '8:10 PM',
      completed: currentStep >= 2,
      icon: 'restaurant',
    },
    {
      id: 3,
      title: 'Ready for Pickup',
      description: 'Your order is ready to be picked up',
      time: '8:25 PM',
      completed: currentStep >= 3,
      icon: 'fast-food',
    },
    {
      id: 4,
      title: 'On the Way',
      description: 'Driver is on the way to your location',
      time: '8:30 PM',
      completed: currentStep >= 4,
      icon: 'bicycle',
    },
    {
      id: 5,
      title: 'Delivered',
      description: 'Enjoy your meal!',
      time: '8:45 PM',
      completed: currentStep >= 5,
      icon: 'home',
    },
  ];
  
  // Driver information
  const driver: DriverInfo = {
    name: 'Abebe Kebede',
    phone: '0911223344',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    vehicleType: 'Motorcycle',
    vehicleInfo: 'Red Honda',
    rating: 4.8,
  };
  
  // Simulate order progress
  useEffect(() => {
    if (currentStep < 5) {
      const timer = setTimeout(() => {
        setCurrentStep(prevStep => prevStep + 1);
        
        // Update driver location to simulate movement
        if (currentStep >= 3) {
          setDriverLocation(prev => ({
            latitude: prev.latitude + (userLocation.latitude - restaurantLocation.latitude) * 0.3,
            longitude: prev.longitude + (userLocation.longitude - restaurantLocation.longitude) * 0.3,
          }));
        }
      }, 15000); // Update every 15 seconds
      
      return () => clearTimeout(timer);
    }
  }, [currentStep]);
  
  // Call driver handler
  const handleCallDriver = () => {
    console.log('Calling driver:', driver.phone);
  };
  
  // Cancel order handler
  const handleCancelOrder = () => {
    console.log('Cancel order:', orderId);
    // @ts-ignore - Navigation typing issue
    navigation.navigate('Main');
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#4F2D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: (restaurantLocation.latitude + userLocation.latitude) / 2,
              longitude: (restaurantLocation.longitude + userLocation.longitude) / 2,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
          >
            {/* Restaurant marker */}
            <Marker
              coordinate={restaurantLocation}
              title="Restaurant"
              description="Gusto Restaurant"
            >
              <View style={[styles.markerContainer, styles.restaurantMarker]}>
                <Ionicons name="restaurant" size={18} color="white" />
              </View>
            </Marker>
            
            {/* User marker */}
            <Marker
              coordinate={userLocation}
              title="Your Location"
              description="Delivery Address"
            >
              <View style={[styles.markerContainer, styles.userMarker]}>
                <Ionicons name="home" size={18} color="white" />
              </View>
            </Marker>
            
            {/* Driver marker (visible only if driver is on the way) */}
            {currentStep >= 3 && (
              <Marker
                coordinate={driverLocation}
                title="Driver"
                description={`${driver.name} is on the way`}
              >
                <View style={[styles.markerContainer, styles.driverMarker]}>
                  <Ionicons name="bicycle" size={18} color="white" />
                </View>
              </Marker>
            )}
          </MapView>
          
          <View style={styles.estimatedTimeContainer}>
            <Text style={styles.estimatedTimeLabel}>Estimated Delivery</Text>
            <Text style={styles.estimatedTimeValue}>{estimatedDelivery}</Text>
          </View>
        </View>
        
        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderId}>Order #{orderId}</Text>
          <Text style={styles.orderFrom}>Gusto Restaurant</Text>
        </View>
        
        <View style={styles.stepsContainer}>
          {orderSteps.map((step, index) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={[
                styles.stepIconContainer,
                step.completed ? styles.completedStepIcon : styles.pendingStepIcon
              ]}>
                <Ionicons 
                  name={step.icon as any} 
                  size={20} 
                  color={step.completed ? 'white' : '#8B572A'} 
                />
              </View>
              
              <View style={styles.stepContentContainer}>
                <View style={styles.stepHeaderRow}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepTime}>{step.time}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
              
              {index < orderSteps.length - 1 && (
                <View style={[
                  styles.stepConnector,
                  step.completed && orderSteps[index + 1].completed ? styles.completedConnector : styles.pendingConnector
                ]} />
              )}
            </View>
          ))}
        </View>
        
        {currentStep >= 3 && (
          <View style={styles.driverContainer}>
            <Text style={styles.driverTitle}>Your Delivery Partner</Text>
            
            <View style={styles.driverCard}>
              <Image 
                source={{ uri: driver.photo }} 
                style={styles.driverPhoto}
              />
              
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                
                <View style={styles.driverRatingContainer}>
                  <Ionicons name="star" size={16} color="#FFC107" />
                  <Text style={styles.driverRating}>{driver.rating}</Text>
                </View>
                
                <Text style={styles.vehicleInfo}>
                  {driver.vehicleType} • {driver.vehicleInfo}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.callButton}
                onPress={handleCallDriver}
              >
                <Ionicons name="call" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelOrder}
          disabled={currentStep >= 3}
        >
          <Text style={[
            styles.cancelButtonText,
            currentStep >= 3 && styles.disabledCancelText
          ]}>
            {currentStep >= 3 ? 'Cannot cancel at this stage' : 'Cancel Order'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F2D1F',
    fontFamily: 'DMSans-Bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  restaurantMarker: {
    backgroundColor: '#8B572A',
  },
  userMarker: {
    backgroundColor: '#4F2D1F',
  },
  driverMarker: {
    backgroundColor: '#E5A764',
  },
  estimatedTimeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  estimatedTimeLabel: {
    fontSize: 12,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  estimatedTimeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F2D1F',
    fontFamily: 'DMSans-Bold',
  },
  orderInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F2D1F',
    marginBottom: 5,
    fontFamily: 'DMSans-SemiBold',
  },
  orderFrom: {
    fontSize: 14,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  stepsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  stepRow: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 20,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    zIndex: 2,
  },
  completedStepIcon: {
    backgroundColor: '#4CAF50',
  },
  pendingStepIcon: {
    backgroundColor: 'rgba(229, 167, 100, 0.2)',
    borderWidth: 1,
    borderColor: '#8B572A',
  },
  stepContentContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F2D1F',
    fontFamily: 'DMSans-Medium',
  },
  stepTime: {
    fontSize: 14,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  stepDescription: {
    fontSize: 14,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  stepConnector: {
    position: 'absolute',
    left: 20,
    top: 40,
    width: 2,
    height: '100%',
    zIndex: 1,
  },
  completedConnector: {
    backgroundColor: '#4CAF50',
  },
  pendingConnector: {
    backgroundColor: 'rgba(229, 167, 100, 0.3)',
  },
  driverContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  driverTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F2D1F',
    marginBottom: 15,
    fontFamily: 'DMSans-SemiBold',
  },
  driverCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F2D1F',
    marginBottom: 5,
    fontFamily: 'DMSans-Medium',
  },
  driverRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  driverRating: {
    fontSize: 14,
    color: '#4F2D1F',
    marginLeft: 5,
    fontFamily: 'DMSans-Regular',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B572A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#C73030',
    fontFamily: 'DMSans-Medium',
  },
  disabledCancelText: {
    color: '#AAAAAA',
  },
  spacer: {
    height: 30,
  },
});

export default OrderTrackingScreen;