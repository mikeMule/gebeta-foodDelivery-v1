import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API } from '../utils/api';

// User data type
interface UserData {
  phoneNumber: string;
  fullName?: string;
  email?: string;
  location?: string;
  userType?: 'customer' | 'restaurant_owner' | 'delivery_partner' | 'admin';
}

// Auth context interface
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userData: UserData | null;
  login: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  loginWithSocial: (provider: 'telegram' | 'instagram', userData: UserData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userData: null,
  login: async () => false,
  verifyOtp: async () => false,
  loginWithSocial: async () => false,
  logout: async () => {},
  updateUserData: async () => false,
});

// Storage keys
const STORAGE_KEYS = {
  AUTH_STATUS: 'isAuthenticated',
  PHONE_NUMBER: 'phoneNumber',
  FULL_NAME: 'fullName',
  EMAIL: 'email',
  LOCATION: 'location',
  USER_TYPE: 'userType',
};

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Load auth state on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Get auth status
        const authStatus = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_STATUS);
        
        if (authStatus === 'true') {
          // Get user data
          const phoneNumber = await AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER) || '';
          const fullName = await AsyncStorage.getItem(STORAGE_KEYS.FULL_NAME) || undefined;
          const email = await AsyncStorage.getItem(STORAGE_KEYS.EMAIL) || undefined;
          const location = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION) || undefined;
          const userType = await AsyncStorage.getItem(STORAGE_KEYS.USER_TYPE) as UserData['userType'] || 'customer';
          
          setUserData({ phoneNumber, fullName, email, location, userType });
          setIsAuthenticated(true);
        } else {
          setUserData(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAuthState();
  }, []);
  
  // Login with phone number
  const login = async (phoneNumber: string): Promise<boolean> => {
    try {
      // In a real app, this would call the API
      // const response = await API.login(phoneNumber);
      
      // For now, we'll simulate a successful API call
      // Store the phone number for OTP verification
      await AsyncStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, phoneNumber);
      
      // Update state
      setUserData({ phoneNumber });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
      return false;
    }
  };
  
  // Verify OTP code
  const verifyOtp = async (otp: string): Promise<boolean> => {
    try {
      // Get stored phone number
      const phoneNumber = await AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER);
      
      if (!phoneNumber) {
        throw new Error('Phone number not found');
      }
      
      // In a real app, this would call the API
      // const response = await API.verifyOtp(phoneNumber, otp);
      
      // For testing, we'll check if OTP is 1234
      const isValid = otp === '1234';
      
      if (isValid) {
        // Set authenticated status
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'true');
        
        // Set default user data
        const userType = 'customer' as const;
        await AsyncStorage.setItem(STORAGE_KEYS.USER_TYPE, userType);
        
        // Set default location if not set
        const location = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
        if (!location) {
          await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, 'Addis Ababa, Ethiopia');
        }
        
        // Update state
        setUserData(prev => ({ 
          ...prev as UserData, 
          userType, 
          location: location || 'Addis Ababa, Ethiopia' 
        }));
        setIsAuthenticated(true);
        
        return true;
      } else {
        throw new Error('Invalid OTP code');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'An error occurred');
      return false;
    }
  };
  
  // Login with social media
  const loginWithSocial = async (
    provider: 'telegram' | 'instagram', 
    data: UserData
  ): Promise<boolean> => {
    try {
      // In a real app, this would call the API for social auth
      
      // Store user data
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, data.phoneNumber);
      
      if (data.fullName) {
        await AsyncStorage.setItem(STORAGE_KEYS.FULL_NAME, data.fullName);
      }
      
      if (data.email) {
        await AsyncStorage.setItem(STORAGE_KEYS.EMAIL, data.email);
      }
      
      if (data.location) {
        await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, data.location);
      }
      
      const userType = data.userType || 'customer';
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TYPE, userType);
      
      // Update state
      setUserData({ ...data, userType });
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
      return false;
    }
  };
  
  // Logout
  const logout = async (): Promise<void> => {
    try {
      // Clear auth status only
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'false');
      
      // Note: We keep the user data for convenience on re-login
      
      // Update state
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Update user data
  const updateUserData = async (data: Partial<UserData>): Promise<boolean> => {
    try {
      // In a real app, this would call the API
      // const response = await API.updateUserProfile(data);
      
      // Update storage
      if (data.fullName) {
        await AsyncStorage.setItem(STORAGE_KEYS.FULL_NAME, data.fullName);
      }
      
      if (data.email) {
        await AsyncStorage.setItem(STORAGE_KEYS.EMAIL, data.email);
      }
      
      if (data.location) {
        await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, data.location);
      }
      
      // Update state
      setUserData(prev => prev ? { ...prev, ...data } : null);
      
      return true;
    } catch (error) {
      console.error('Update user data error:', error);
      Alert.alert('Update Failed', error instanceof Error ? error.message : 'An error occurred');
      return false;
    }
  };
  
  // Create context value
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    userData,
    login,
    verifyOtp,
    loginWithSocial,
    logout,
    updateUserData,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for accessing auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};