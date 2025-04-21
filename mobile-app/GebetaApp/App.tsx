import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';

// Create an authentication context for the app
export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  userPhoneNumber: string | null;
  setUserPhoneNumber: (value: string | null) => void;
}>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  userPhoneNumber: null,
  setUserPhoneNumber: () => {},
});

// Create custom theme based on Ethiopian colors
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#8B572A',
    accent: '#E5A764',
    background: '#FFF9F2',
    surface: '#FFFFFF',
    text: '#4F2D1F',
    error: '#C73030',
  },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const authStatus = await AsyncStorage.getItem('isAuthenticated');
        const phoneNumber = await AsyncStorage.getItem('phoneNumber');
        
        setIsAuthenticated(authStatus === 'true');
        setUserPhoneNumber(phoneNumber);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load fonts
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'DMSans-Regular': require('./assets/fonts/DMSans-Regular.ttf'),
          'DMSans-Medium': require('./assets/fonts/DMSans-Medium.ttf'),
          'DMSans-Bold': require('./assets/fonts/DMSans-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Continue even if fonts fail to load
        setFontsLoaded(true);
      }
    }

    // Wait for both operations
    const initializeApp = async () => {
      await Promise.all([checkAuthentication(), loadFonts()]);
    };

    initializeApp();
  }, []);

  // Show loading screen while initializing
  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B572A" />
        <Text style={styles.loadingText}>Gebeta Food Delivery</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <PaperProvider theme={theme}>
        <AuthContext.Provider
          value={{
            isAuthenticated,
            setIsAuthenticated,
            userPhoneNumber,
            setUserPhoneNumber,
          }}
        >
          <AppNavigator />
        </AuthContext.Provider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F2',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#4F2D1F',
    fontWeight: '500',
  },
});