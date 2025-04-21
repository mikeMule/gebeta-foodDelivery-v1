import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

// Import our screens (we'll create these next)
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OtpVerificationScreen from './src/screens/OtpVerificationScreen';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import CartScreen from './src/screens/CartScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';

// Create our navigation stacks/tabs
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Define our custom theme
const gebetaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#8B572A',
    accent: '#E5A764',
    background: '#FFF9F2',
    text: '#4F2D1F',
    surface: '#FFFFFF',
    error: '#C73030',
  },
};

// Bottom Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: gebetaTheme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load custom fonts
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'DMSans-Regular': require('./src/assets/fonts/DMSans-Regular.ttf'),
        'DMSans-Medium': require('./src/assets/fonts/DMSans-Medium.ttf'),
        'DMSans-Bold': require('./src/assets/fonts/DMSans-Bold.ttf'),
      }).catch(err => console.error('Error loading fonts:', err));
      
      setFontsLoaded(true);
    }
    
    loadFonts();
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const value = await AsyncStorage.getItem('isAuthenticated');
        if (value === 'true') {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Failed to load auth state');
      } finally {
        // Simulate a splash screen delay (3 seconds)
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      }
    };

    checkAuth();
  }, []);

  if (isLoading || !fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={gebetaTheme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              // Auth Screens
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
              </>
            ) : (
              // App Screens
              <>
                <Stack.Screen name="Main" component={MainTabNavigator} />
                <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
                <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
                <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}