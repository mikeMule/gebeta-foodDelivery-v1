import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// Order type definition
interface Order {
  id: string;
  restaurantName: string;
  restaurantLogo: string;
  date: string;
  time: string;
  status: 'completed' | 'active' | 'canceled';
  items: string[];
  itemCount: number;
  totalPrice: number;
}

const MyOrdersScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Sample order data
  const sampleOrders: Order[] = [
    {
      id: 'ORD-123456',
      restaurantName: 'Gusto Restaurant',
      restaurantLogo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
      date: 'Today',
      time: '2:30 PM',
      status: 'active',
      items: ['Doro Wat', 'Tibs'],
      itemCount: 3,
      totalPrice: 720,
    },
    {
      id: 'ORD-123455',
      restaurantName: 'Abyssinia Kitchen',
      restaurantLogo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
      date: 'Yesterday',
      time: '7:15 PM',
      status: 'completed',
      items: ['Beyaynetu', 'Kitfo'],
      itemCount: 2,
      totalPrice: 450,
    },
    {
      id: 'ORD-123454',
      restaurantName: 'Burger House',
      restaurantLogo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
      date: '21 Apr 2025',
      time: '12:45 PM',
      status: 'completed',
      items: ['Classic Burger', 'Cheeseburger', 'Fries'],
      itemCount: 4,
      totalPrice: 520,
    },
    {
      id: 'ORD-123453',
      restaurantName: 'Gusto Restaurant',
      restaurantLogo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
      date: '20 Apr 2025',
      time: '8:30 PM',
      status: 'canceled',
      items: ['Doro Wat'],
      itemCount: 1,
      totalPrice: 250,
    },
  ];
  
  // Filter orders based on active tab
  useEffect(() => {
    if (activeTab === 'active') {
      setOrders(sampleOrders.filter(order => order.status === 'active'));
    } else {
      setOrders(sampleOrders.filter(order => order.status === 'completed' || order.status === 'canceled'));
    }
  }, [activeTab]);
  
  // Navigate to order tracking
  const handleTrackOrder = (orderId: string) => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate('OrderTracking', { orderId });
  };
  
  // Navigate to restaurant details
  const handleViewRestaurant = (restaurantId: number) => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate('RestaurantDetail', { restaurantId });
  };
  
  // Render order item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => item.status === 'active' ? handleTrackOrder(item.id) : null}
    >
      <View style={styles.orderHeader}>
        <Image 
          source={{ uri: item.restaurantLogo }} 
          style={styles.restaurantLogo}
        />
        
        <View style={styles.orderInfo}>
          <Text style={styles.restaurantName}>{item.restaurantName}</Text>
          <Text style={styles.orderDate}>{item.date} • {item.time}</Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          item.status === 'active' ? styles.activeBadge : 
          item.status === 'completed' ? styles.completedBadge : styles.canceledBadge
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'In Progress' : 
             item.status === 'completed' ? 'Completed' : 'Canceled'}
          </Text>
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.orderItems}>
        <Text style={styles.orderItemText}>
          {item.items.join(', ')}
          {item.itemCount > item.items.length ? ` + ${item.itemCount - item.items.length} more` : ''}
        </Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>{item.totalPrice} ETB</Text>
        
        {item.status === 'active' ? (
          <Button 
            mode="contained" 
            onPress={() => handleTrackOrder(item.id)}
            style={styles.trackButton}
            labelStyle={styles.trackButtonLabel}
          >
            Track Order
          </Button>
        ) : item.status === 'completed' ? (
          <Button 
            mode="outlined" 
            onPress={() => handleViewRestaurant(1)}
            style={styles.reorderButton}
            labelStyle={styles.reorderButtonLabel}
          >
            Reorder
          </Button>
        ) : null}
      </View>
    </TouchableOpacity>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#E5A764" />
      <Text style={styles.emptyText}>
        {activeTab === 'active' ? 'No active orders' : 'No order history'}
      </Text>
      <Text style={styles.emptySubtext}>
        {activeTab === 'active' ? 'Your current orders will appear here' : 'Your past orders will appear here'}
      </Text>
      <Button 
        mode="contained" 
        onPress={() => {
          // @ts-ignore - Navigation typing issue
          navigation.navigate('Main');
        }}
        style={styles.orderNowButton}
        labelStyle={styles.orderNowButtonLabel}
      >
        Order Now
      </Button>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  header: {
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF9F2',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#8B572A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B572A',
    opacity: 0.7,
    fontFamily: 'DMSans-Medium',
  },
  activeTabText: {
    opacity: 1,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  orderInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F2D1F',
    marginBottom: 5,
    fontFamily: 'DMSans-Medium',
  },
  orderDate: {
    fontSize: 14,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  activeBadge: {
    backgroundColor: 'rgba(229, 167, 100, 0.2)',
  },
  completedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  canceledBadge: {
    backgroundColor: 'rgba(199, 48, 48, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F2D1F',
    fontFamily: 'DMSans-Medium',
  },
  divider: {
    backgroundColor: 'rgba(229, 167, 100, 0.2)',
  },
  orderItems: {
    padding: 15,
  },
  orderItemText: {
    fontSize: 14,
    color: '#4F2D1F',
    fontFamily: 'DMSans-Regular',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 0,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C73030',
    fontFamily: 'DMSans-SemiBold',
  },
  trackButton: {
    backgroundColor: '#8B572A',
    paddingHorizontal: 15,
    height: 35,
  },
  trackButtonLabel: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    marginVertical: 0,
    lineHeight: 16,
  },
  reorderButton: {
    borderColor: '#8B572A',
    paddingHorizontal: 15,
    height: 35,
  },
  reorderButtonLabel: {
    fontSize: 14,
    color: '#8B572A',
    fontFamily: 'DMSans-Bold',
    marginVertical: 0,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'DMSans-Bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B572A',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'DMSans-Regular',
  },
  orderNowButton: {
    backgroundColor: '#8B572A',
    paddingHorizontal: 30,
  },
  orderNowButtonLabel: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
});

export default MyOrdersScreen;