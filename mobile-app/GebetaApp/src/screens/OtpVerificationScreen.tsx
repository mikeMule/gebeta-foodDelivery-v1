import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const navigation = useNavigation();
  
  const inputRefs = [
    useRef<RNTextInput>(null),
    useRef<RNTextInput>(null),
    useRef<RNTextInput>(null),
    useRef<RNTextInput>(null),
  ];

  // Get the phone number from AsyncStorage
  useEffect(() => {
    const getPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.error('Error fetching phone number:', error);
      }
    };

    getPhoneNumber();
  }, []);

  const handleChange = (text: string, index: number) => {
    if (isNaN(Number(text))) return;
    
    const newOtp = [...otp];
    newOtp[index] = text.substring(text.length - 1);
    setOtp(newOtp);
    
    // Auto focus next input
    if (text && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    try {
      // In a real app, this would validate the OTP with an API
      // For now, just mark as authenticated and continue
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      // If no location is set, add a default one
      const location = await AsyncStorage.getItem('location');
      if (!location) {
        await AsyncStorage.setItem('location', 'Bole, Addis Ababa');
      }
      
      // Reset navigation to Main
      // @ts-ignore - Navigation typing issue
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error during OTP verification:', error);
    }
  };

  const handleBackToLogin = () => {
    // @ts-ignore - Navigation typing issue
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackToLogin}
      >
        <Ionicons name="chevron-back" size={24} color="#4F2D1F" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="phone-portrait-outline" size={32} color="white" />
        </View>
        
        <Text style={styles.title}>Verify your phone</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to
        </Text>
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <RNTextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              ref={inputRefs[index]}
            />
          ))}
        </View>
        
        <Button 
          mode="contained" 
          onPress={handleVerify}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Verify and Continue
        </Button>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Didn't receive code? <Text style={styles.resendText}>Resend</Text>
          </Text>
          <Text style={styles.testText}>
            For testing, use code: 1234
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backText: {
    color: '#4F2D1F',
    fontSize: 16,
    marginLeft: 5,
    fontFamily: 'DMSans-Medium',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8B572A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginBottom: 10,
    fontFamily: 'DMSans-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B572A',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
  },
  phoneNumber: {
    fontSize: 18,
    color: '#4F2D1F',
    fontWeight: '500',
    marginBottom: 30,
    fontFamily: 'DMSans-Medium',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  otpInput: {
    width: 60,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(229, 167, 100, 0.5)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: 'white',
    color: '#4F2D1F',
  },
  button: {
    paddingVertical: 8,
    backgroundColor: '#8B572A',
    width: '80%',
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    paddingVertical: 2,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#8B572A',
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'DMSans-Regular',
  },
  resendText: {
    color: '#C73030',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
  },
  testText: {
    color: 'rgba(139, 87, 42, 0.7)',
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
  },
});

export default OtpVerificationScreen;