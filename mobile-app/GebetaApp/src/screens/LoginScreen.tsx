import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('0916182957');
  const navigation = useNavigation();

  const handleLogin = async () => {
    // Store phone number in AsyncStorage (no need to set isAuthenticated yet)
    try {
      await AsyncStorage.setItem('phoneNumber', phoneNumber);
      
      // Navigate to OTP verification
      // @ts-ignore - Navigation typing issue
      navigation.navigate('OtpVerification');
    } catch (error) {
      console.error('Error saving phone number:', error);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    console.log(`Login with ${provider}`);
    
    try {
      // Store user data
      await AsyncStorage.setItem('phoneNumber', '0916182957');
      await AsyncStorage.setItem('fullName', `Test ${provider} User`);
      await AsyncStorage.setItem('userType', 'customer');
      
      // Mark as authenticated directly for social logins
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      // Reset navigation to Main
      // @ts-ignore - Navigation typing issue
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error with social login:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF9F2', '#FFF9F2']}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.logo}>
          <View style={styles.logoCircle}>
            <View style={styles.logoInner}>
              <View style={[styles.foodItem, { backgroundColor: '#C73030', left: 12, top: 12 }]} />
              <View style={[styles.foodItem, { backgroundColor: '#4CAF50', right: 12, top: 12 }]} />
              <View style={[styles.foodItem, { backgroundColor: '#8D6E63', bottom: 12 }]} />
            </View>
          </View>
        </View>
        
        <Text style={styles.title}>Welcome to Gebeta</Text>
        <Text style={styles.subtitle}>Sign in to enjoy authentic Ethiopian cuisine</Text>
        
        <View style={styles.formContainer}>
          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={text => setPhoneNumber(text)}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="phone" />}
            keyboardType="phone-pad"
            outlineColor="#E5A764"
            activeOutlineColor="#8B572A"
          />
          
          <Button 
            mode="contained" 
            onPress={handleLogin}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Continue
          </Button>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Telegram')}
            >
              <Ionicons name="paper-plane" size={24} color="#0088cc" />
              <Text style={styles.socialButtonText}>Telegram</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Instagram')}
            >
              <Ionicons name="logo-instagram" size={24} color="#E1306C" />
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
          </Text>
        </View>
      </View>
      
      <View style={styles.heroSection}>
        <View style={styles.heroImageContainer}>
          <View style={styles.heroOverlay} />
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Authentic Ethiopian Cuisine</Text>
            <Text style={styles.heroSubtitle}>Experience the rich flavors and traditions of Ethiopia delivered right to your door</Text>
            
            <View style={styles.heroFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#E5A764" />
                <Text style={styles.featureText}>Authentic ingredients and recipes</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#E5A764" />
                <Text style={styles.featureText}>Fast delivery across the city</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#E5A764" />
                <Text style={styles.featureText}>Support local Ethiopian restaurants</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 15,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#E5A764',
    position: 'relative',
  },
  foodItem: {
    width: 15,
    height: 15,
    borderRadius: 8,
    position: 'absolute',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginBottom: 8,
    fontFamily: 'DMSans-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B572A',
    marginBottom: 30,
    fontFamily: 'DMSans-Regular',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'white',
  },
  button: {
    paddingVertical: 8,
    backgroundColor: '#8B572A',
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    paddingVertical: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5A764',
    opacity: 0.3,
  },
  dividerText: {
    color: '#8B572A',
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 167, 100, 0.5)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  socialButtonText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#4F2D1F',
    fontFamily: 'DMSans-Medium',
  },
  signupText: {
    textAlign: 'center',
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  signupLink: {
    color: '#C73030',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
  },
  heroSection: {
    display: 'none', // Hide on mobile view, would be visible on tablet/larger screens
  },
  heroImageContainer: {
    flex: 1,
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  heroContent: {
    padding: 25,
    zIndex: 2,
    position: 'relative',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    fontFamily: 'DMSans-Bold',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    fontFamily: 'DMSans-Regular',
  },
  heroFeatures: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
  },
});

export default LoginScreen;