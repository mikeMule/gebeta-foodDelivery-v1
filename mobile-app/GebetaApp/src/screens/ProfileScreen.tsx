import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { TextInput, Button, Switch, Divider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  
  // User profile state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedFullName = await AsyncStorage.getItem('fullName');
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        const storedEmail = await AsyncStorage.getItem('email');
        const storedLocation = await AsyncStorage.getItem('location');
        const storedNotifications = await AsyncStorage.getItem('notificationsEnabled');
        
        if (storedFullName) setFullName(storedFullName);
        if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
        if (storedEmail) setEmail(storedEmail);
        if (storedLocation) setLocation(storedLocation);
        if (storedNotifications) setNotificationsEnabled(storedNotifications === 'true');
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);
  
  // Save user data to AsyncStorage
  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem('fullName', fullName);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('location', location);
      await AsyncStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
      
      // Phone number is readonly after initial setup
      setIsEditing(false);
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('isAuthenticated', 'false');
              
              // @ts-ignore - Navigation typing issue
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Save changes
      saveUserData();
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };
  
  // Handle notification toggle
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={toggleEditMode}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>
              {fullName ? fullName.charAt(0).toUpperCase() : 'G'}
            </Text>
          </View>
          
          {isEditing && (
            <TouchableOpacity style={styles.changePictureButton}>
              <Text style={styles.changePictureText}>Change Picture</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            disabled={!isEditing}
            mode="outlined"
            outlineColor="#E5A764"
            activeOutlineColor="#8B572A"
            left={<TextInput.Icon icon="account" />}
          />
          
          <TextInput
            label="Phone Number"
            value={phoneNumber}
            style={styles.input}
            disabled={true} // Always readonly after initial setup
            mode="outlined"
            outlineColor="#E5A764"
            activeOutlineColor="#8B572A"
            left={<TextInput.Icon icon="phone" />}
          />
          
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            disabled={!isEditing}
            mode="outlined"
            outlineColor="#E5A764"
            activeOutlineColor="#8B572A"
            left={<TextInput.Icon icon="email" />}
            keyboardType="email-address"
          />
          
          <TextInput
            label="Delivery Address"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
            disabled={!isEditing}
            mode="outlined"
            outlineColor="#E5A764"
            activeOutlineColor="#8B572A"
            left={<TextInput.Icon icon="map-marker" />}
          />
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Ionicons name="notifications-outline" size={24} color="#8B572A" />
              <Text style={styles.switchLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              color="#8B572A"
              disabled={!isEditing}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#C73030" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={24} color="#8B572A" />
            <Text style={styles.actionText}>Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={24} color="#8B572A" />
            <Text style={styles.actionText}>Terms & Conditions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="shield-outline" size={24} color="#8B572A" />
            <Text style={styles.actionText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <View style={styles.appVersionContainer}>
            <Text style={styles.appVersionText}>App Version: 1.0.0</Text>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFF9F2',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 167, 100, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F2D1F',
    fontFamily: 'DMSans-Bold',
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(229, 167, 100, 0.2)',
  },
  editButtonText: {
    color: '#8B572A',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B572A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileInitial: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
  },
  changePictureButton: {
    padding: 5,
  },
  changePictureText: {
    color: '#8B572A',
    fontFamily: 'DMSans-Medium',
  },
  formContainer: {
    flex: 1,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F2D1F',
    marginBottom: 15,
    fontFamily: 'DMSans-SemiBold',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  divider: {
    backgroundColor: 'rgba(229, 167, 100, 0.3)',
    height: 1,
    marginVertical: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#4F2D1F',
    marginLeft: 10,
    fontFamily: 'DMSans-Regular',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 167, 100, 0.2)',
  },
  actionText: {
    fontSize: 16,
    color: '#4F2D1F',
    marginLeft: 10,
    fontFamily: 'DMSans-Regular',
  },
  logoutText: {
    fontSize: 16,
    color: '#C73030',
    marginLeft: 10,
    fontFamily: 'DMSans-Regular',
  },
  appVersionContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  appVersionText: {
    fontSize: 14,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
});

export default ProfileScreen;