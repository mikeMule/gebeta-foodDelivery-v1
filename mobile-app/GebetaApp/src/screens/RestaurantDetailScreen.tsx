import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { Chip, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

// Types
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

// Food Item Component
const MenuItem = ({ item, isRestaurantOpen }: { item: FoodItem; isRestaurantOpen: boolean }) => {
  const handleAddToCart = () => {
    if (!isRestaurantOpen) return;
    // In a real app, this would add the item to a cart context
    console.log('Added to cart:', item.name);
  };

  return (
    <View style={styles.menuItem}>
      <Image 
        source={{ uri: item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop' }} 
        style={styles.menuItemImage}
        resizeMode="cover"
      />
      
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.menuItemFooter}>
          <Text style={styles.menuItemPrice}>{item.price} ETB</Text>
          <Button 
            mode="contained"
            onPress={handleAddToCart}
            disabled={!isRestaurantOpen}
            style={[styles.addButton, !isRestaurantOpen && styles.disabledButton]}
            labelStyle={styles.addButtonLabel}
            compact
          >
            Add
          </Button>
        </View>
      </View>
    </View>
  );
};

// Restaurant Detail Screen
const RestaurantDetailScreen = () => {
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const route = useRoute();
  const navigation = useNavigation();
  // @ts-ignore - Navigation params typing issue
  const { restaurantId } = route.params;

  // Fetch restaurant and menu data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchRestaurant = async () => {
      // Sample restaurant data for ID 1
      const sampleRestaurant: Restaurant = {
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
      };

      // Sample menu items for restaurant ID 1
      const sampleMenuItems: FoodItem[] = [
        {
          id: 1,
          restaurantId: 1,
          name: 'Doro Wat',
          description: 'Spicy chicken stew served with injera, perfectly spiced with berbere and niter kibbeh.',
          price: 250,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
          category: 'Main Dishes',
        },
        {
          id: 2,
          restaurantId: 1,
          name: 'Tibs',
          description: 'Sautéed meat with vegetables, seasoned with Ethiopian spices.',
          price: 220,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
          category: 'Main Dishes',
        },
        {
          id: 3,
          restaurantId: 1,
          name: 'Shiro',
          description: 'Powdered chickpeas stew with Ethiopian spices, perfect for vegetarians.',
          price: 180,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
          category: 'Vegetarian',
        },
        {
          id: 4,
          restaurantId: 1,
          name: 'Kitfo',
          description: 'Minced raw beef marinated in chili powder and butter sauce.',
          price: 270,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
          category: 'Specials',
        },
      ];

      setRestaurant(sampleRestaurant);
      setMenuItems(sampleMenuItems);
      setLoading(false);
    };

    fetchRestaurant();
  }, [restaurantId]);

  // Get unique categories for the menu
  const categories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : [];

  // Filter menu items by category if selected
  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  const handleViewCart = () => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate('Cart');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B572A" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: restaurant.coverImage }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverOverlay} />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: restaurant.logo }} 
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          
          <View style={styles.tagRow}>
            {restaurant.categories.map((category, index) => (
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
              <Text style={styles.infoText}>{restaurant.rating.toFixed(1)} ({restaurant.numRatings})</Text>
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
          
          <Text style={styles.description}>{restaurant.description}</Text>
          
          <View style={styles.detailBox}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={18} color="#8B572A" />
              <Text style={styles.detailText}>{restaurant.address}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={18} color="#8B572A" />
              <Text style={styles.detailText}>{restaurant.openingHours} - {restaurant.closingHours}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={18} color="#8B572A" />
              <Text style={styles.detailText}>{restaurant.contactPhone}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.menuTitle}>Menu</Text>
          <Text style={styles.menuSubtitle}>Min. order: {restaurant.minOrder} ETB</Text>
          
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
            {categories.map((category, index) => (
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
          
          <View style={styles.menuContainer}>
            {filteredMenuItems.map((item) => (
              <MenuItem 
                key={item.id} 
                item={item} 
                isRestaurantOpen={restaurant.isOpen} 
              />
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomBar}>
        <Button 
          mode="contained" 
          onPress={handleViewCart}
          style={styles.cartButton}
          labelStyle={styles.cartButtonLabel}
        >
          View Cart
        </Button>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F2',
  },
  errorText: {
    fontSize: 18,
    color: '#C73030',
    fontFamily: 'DMSans-Medium',
  },
  coverContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 45,
    left: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginBottom: 8,
    fontFamily: 'DMSans-Bold',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: 'rgba(229, 167, 100, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  infoText: {
    fontSize: 13,
    color: '#8B572A',
    marginLeft: 4,
    fontFamily: 'DMSans-Regular',
  },
  description: {
    fontSize: 14,
    color: '#4F2D1F',
    lineHeight: 22,
    marginBottom: 15,
    fontFamily: 'DMSans-Regular',
  },
  detailBox: {
    backgroundColor: 'rgba(229, 167, 100, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4F2D1F',
    marginLeft: 10,
    fontFamily: 'DMSans-Regular',
  },
  divider: {
    backgroundColor: 'rgba(229, 167, 100, 0.3)',
    height: 1,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginBottom: 5,
    fontFamily: 'DMSans-Bold',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#8B572A',
    marginBottom: 15,
    fontFamily: 'DMSans-Regular',
  },
  categoryScroll: {
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
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItemImage: {
    width: 100,
    height: 100,
  },
  menuItemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F2D1F',
    marginBottom: 4,
    fontFamily: 'DMSans-Medium',
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#8B572A',
    marginBottom: 10,
    fontFamily: 'DMSans-Regular',
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C73030',
    fontFamily: 'DMSans-Medium',
  },
  addButton: {
    backgroundColor: '#8B572A',
    minWidth: 60,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  addButtonLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cartButton: {
    backgroundColor: '#8B572A',
    paddingVertical: 5,
  },
  cartButtonLabel: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    paddingVertical: 2,
  },
});

export default RestaurantDetailScreen;