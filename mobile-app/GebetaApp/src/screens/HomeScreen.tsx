import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Searchbar, ActivityIndicator, Chip } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Restaurant type definition
interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  restaurantId: number;
}

interface Restaurant {
  id: number;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: string[];
  openingHours: string;
  closingHours: string;
  rating: number;
  numRatings: number;
  isOpen: boolean;
  deliveryFee: number;
  minOrder: number;
  estimatedDeliveryTime: string;
  contactPhone: string;
  contactEmail: string;
  ownerId: number;
}

// Restaurant Card Component
const RestaurantCard = ({ restaurant, onPress }: { restaurant: Restaurant, onPress: () => void }) => (
  <TouchableOpacity style={styles.restaurantCard} onPress={onPress}>
    <Image 
      source={{ uri: restaurant.coverImage || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' }}
      style={styles.restaurantImage}
      resizeMode="cover"
    />
    
    <View style={styles.restaurantInfo}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: restaurant.logo || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' }}
          style={styles.logo}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        
        <View style={styles.tagRow}>
          {restaurant.categories.slice(0, 2).map((category, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{category}</Text>
            </View>
          ))}
          <View style={[styles.tag, restaurant.isOpen ? styles.openTag : styles.closedTag]}>
            <Text style={styles.tagText}>{restaurant.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.infoText}>{restaurant.rating.toFixed(1)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#8B572A" />
            <Text style={styles.infoText}>{restaurant.estimatedDeliveryTime}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="bicycle-outline" size={16} color="#8B572A" />
            <Text style={styles.infoText}>{restaurant.deliveryFee} ETB</Text>
          </View>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// Featured Item Component
const FeaturedItem = ({ item, onPress }: { item: FoodItem & { restaurantName?: string }, onPress: () => void }) => (
  <TouchableOpacity style={styles.featuredItem} onPress={onPress}>
    <Image 
      source={{ uri: item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' }}
      style={styles.featuredImage}
      resizeMode="cover"
    />
    <View style={styles.featuredInfo}>
      <Text style={styles.featuredTitle}>{item.name}</Text>
      <Text style={styles.featuredRestaurant}>{item.restaurantName}</Text>
      <Text style={styles.featuredPrice}>{item.price} ETB</Text>
    </View>
  </TouchableOpacity>
);

// Main Home Screen
const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('Guest');
  const [userLocation, setUserLocation] = useState<string>('Locating...');
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [featuredItems, setFeaturedItems] = useState<(FoodItem & { restaurantName?: string })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  const navigation = useNavigation();

  // Sample categories for filter
  const sampleCategories = [
    'Ethiopian', 'Fast Food', 'Burgers', 'Pizza', 'Vegetarian', 'Coffee',
  ];
  
  // Fetch user name from AsyncStorage
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const fullName = await AsyncStorage.getItem('fullName');
        if (fullName) {
          // Extract first name
          const firstName = fullName.split(' ')[0];
          setUserName(firstName);
        }
        
        const location = await AsyncStorage.getItem('location');
        if (location) {
          setUserLocation(location);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    getUserInfo();
  }, []);

  // Get user's location
  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setUserLocation('Addis Ababa, Ethiopia');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        let address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address[0]) {
          const { city, region, street } = address[0];
          let locationStr = '';
          
          if (street) {
            locationStr += street;
          }
          
          if (city) {
            locationStr += locationStr ? `, ${city}` : city;
          } else if (region) {
            locationStr += locationStr ? `, ${region}` : region;
          }
          
          if (locationStr) {
            setUserLocation(locationStr);
            await AsyncStorage.setItem('location', locationStr);
          } else {
            setUserLocation('Addis Ababa, Ethiopia');
          }
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setUserLocation('Addis Ababa, Ethiopia');
      }
    };

    if (userLocation === 'Locating...') {
      getLocation();
    }
  }, [userLocation]);

  // Fetch sample restaurant data
  useEffect(() => {
    // In a real app, this would be an API call
    const sampleRestaurants: Restaurant[] = [
      {
        id: 1,
        name: 'Gusto Restaurant',
        description: 'Authentic Ethiopian cuisine in a warm, inviting setting.',
        logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        address: 'Bole, Addis Ababa',
        latitude: 9.005401,
        longitude: 38.763611,
        categories: ['Ethiopian', 'Traditional'],
        openingHours: '09:00',
        closingHours: '22:00',
        rating: 4.7,
        numRatings: 128,
        isOpen: true,
        deliveryFee: 50,
        minOrder: 150,
        estimatedDeliveryTime: '25-35 min',
        contactPhone: '0116612344',
        contactEmail: 'gusto@example.com',
        ownerId: 2
      },
      {
        id: 2,
        name: 'Yod Abyssinia',
        description: 'Traditional Ethiopian dishes with cultural performances.',
        logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        address: 'Bole, Addis Ababa',
        latitude: 9.005401,
        longitude: 38.763611,
        categories: ['Ethiopian', 'Cultural'],
        openingHours: '11:00',
        closingHours: '23:00',
        rating: 4.9,
        numRatings: 356,
        isOpen: true,
        deliveryFee: 70,
        minOrder: 200,
        estimatedDeliveryTime: '30-45 min',
        contactPhone: '0116789012',
        contactEmail: 'yod@example.com',
        ownerId: 3
      },
      {
        id: 3,
        name: 'Burger House',
        description: 'Delicious burgers with a variety of toppings.',
        logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        address: 'Kazanchis, Addis Ababa',
        latitude: 9.010722,
        longitude: 38.761667,
        categories: ['Fast Food', 'Burgers'],
        openingHours: '10:00',
        closingHours: '22:00',
        rating: 4.2,
        numRatings: 85,
        isOpen: false,
        deliveryFee: 40,
        minOrder: 100,
        estimatedDeliveryTime: '15-25 min',
        contactPhone: '0113456789',
        contactEmail: 'burger@example.com',
        ownerId: 4
      }
    ];

    // Sample food items with restaurant name
    const sampleFoodItems: (FoodItem & { restaurantName?: string })[] = [
      {
        id: 1,
        restaurantId: 1,
        name: 'Doro Wat',
        description: 'Spicy chicken stew served with injera.',
        price: 250,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        category: 'Ethiopian',
        restaurantName: 'Gusto Restaurant'
      },
      {
        id: 2,
        restaurantId: 1,
        name: 'Tibs',
        description: 'Sautéed meat with vegetables.',
        price: 220,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        category: 'Ethiopian',
        restaurantName: 'Gusto Restaurant'
      },
      {
        id: 5,
        restaurantId: 2,
        name: 'Beyaynetu',
        description: 'Assortment of vegetarian dishes.',
        price: 180,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        category: 'Vegetarian',
        restaurantName: 'Yod Abyssinia'
      },
      {
        id: 7,
        restaurantId: 3,
        name: 'Classic Burger',
        description: 'Beef patty with lettuce, tomato, and special sauce.',
        price: 150,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        category: 'Burgers',
        restaurantName: 'Burger House'
      }
    ];

    setRestaurants(sampleRestaurants);
    setFeaturedItems(sampleFoodItems);
    setCategories(Array.from(new Set(sampleRestaurants.flatMap(r => r.categories))));
    setLoading(false);
  }, []);

  const handleRestaurantPress = (restaurantId: number) => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate('RestaurantDetail', { restaurantId });
  };

  const handleFeaturedItemPress = (restaurantId: number) => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate('RestaurantDetail', { restaurantId });
  };

  const filteredRestaurants = selectedCategory 
    ? restaurants.filter(r => r.categories.includes(selectedCategory))
    : restaurants;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B572A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color="#8B572A" />
              <Text style={styles.locationText}>{userLocation}</Text>
              <Ionicons name="chevron-down" size={16} color="#8B572A" />
            </View>
            
            <TouchableOpacity style={styles.userAvatar}>
              <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.greeting}>Hello, {userName}!</Text>
          <Text style={styles.subtitle}>Hungry for authentic Ethiopian cuisine?</Text>
          
          <Searchbar
            placeholder="Search restaurants or dishes"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#8B572A"
          />
        </View>
        
        <View style={styles.promotionContainer}>
          <View style={styles.promotionContent}>
            <View style={styles.promotionTextContainer}>
              <Text style={styles.promotionTitle}>Discover Real Ethiopian Taste</Text>
              <Text style={styles.promotionSubtitle}>Try our authentic Doro Wat today!</Text>
              <TouchableOpacity style={styles.promotionButton}>
                <Text style={styles.promotionButtonText}>Order Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promotionImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop' }}
                style={styles.promotionImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <Chip
              mode="flat"
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
              style={[styles.categoryChip, selectedCategory === null && styles.selectedChip]}
              textStyle={[styles.categoryChipText, selectedCategory === null && styles.selectedChipText]}
            >
              All
            </Chip>
            {sampleCategories.map((category, index) => (
              <Chip
                key={index}
                mode="flat"
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryChip, selectedCategory === category && styles.selectedChip]}
                textStyle={[styles.categoryChipText, selectedCategory === category && styles.selectedChipText]}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Featured Items</Text>
          <FlatList
            data={featuredItems}
            renderItem={({ item }) => (
              <FeaturedItem 
                item={item} 
                onPress={() => handleFeaturedItemPress(item.restaurantId)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredList}
          />
        </View>
        
        <View style={styles.restaurantsContainer}>
          <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => handleRestaurantPress(restaurant.id)}
            />
          ))}
        </View>
        
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F2',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#4F2D1F',
    marginHorizontal: 5,
    fontFamily: 'DMSans-Regular',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B572A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginBottom: 5,
    fontFamily: 'DMSans-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B572A',
    marginBottom: 15,
    fontFamily: 'DMSans-Regular',
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  promotionContainer: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  promotionContent: {
    backgroundColor: '#8B572A',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  promotionTextContainer: {
    flex: 3,
    justifyContent: 'center',
  },
  promotionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'DMSans-Bold',
  },
  promotionSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'DMSans-Regular',
  },
  promotionButton: {
    backgroundColor: '#E5A764',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  promotionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },
  promotionImageContainer: {
    flex: 2,
    overflow: 'hidden',
  },
  promotionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  categoryContainer: {
    marginTop: 5,
    paddingLeft: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginBottom: 10,
    fontFamily: 'DMSans-Bold',
  },
  categoryScroll: {
    paddingRight: 20,
    marginBottom: 15,
  },
  categoryChip: {
    marginRight: 10,
    backgroundColor: 'white',
    borderColor: '#E5A764',
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: '#8B572A',
  },
  categoryChipText: {
    color: '#8B572A',
    fontFamily: 'DMSans-Medium',
  },
  selectedChipText: {
    color: 'white',
  },
  featuredContainer: {
    paddingLeft: 20,
    marginBottom: 15,
  },
  featuredList: {
    paddingRight: 10,
  },
  featuredItem: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featuredImage: {
    width: '100%',
    height: 120,
  },
  featuredInfo: {
    padding: 10,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F2D1F',
    marginBottom: 2,
    fontFamily: 'DMSans-Medium',
  },
  featuredRestaurant: {
    fontSize: 12,
    color: '#8B572A',
    marginBottom: 5,
    fontFamily: 'DMSans-Regular',
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C73030',
    fontFamily: 'DMSans-Medium',
  },
  restaurantsContainer: {
    paddingHorizontal: 20,
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    width: '100%',
    height: 130,
  },
  restaurantInfo: {
    flexDirection: 'row',
    padding: 12,
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
    marginTop: -30,
  },
  detailsContainer: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginBottom: 5,
    fontFamily: 'DMSans-Bold',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: 'rgba(229, 167, 100, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 8,
  },
  openTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  closedTag: {
    backgroundColor: 'rgba(199, 48, 48, 0.2)',
  },
  tagText: {
    fontSize: 12,
    color: '#4F2D1F',
    fontFamily: 'DMSans-Regular',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#8B572A',
    marginLeft: 3,
    fontFamily: 'DMSans-Regular',
  },
  footer: {
    height: 20,
  },
});

export default HomeScreen;