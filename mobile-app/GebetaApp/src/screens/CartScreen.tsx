import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Divider, Button, TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Types for Cart Item
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  notes?: string;
}

// Delivery Option Type
interface DeliveryOption {
  id: string;
  name: string;
  icon: string; // IconName for Ionicons
  description: string;
  baseFee: number;
  extraFeePerKm?: number;
  maxDistance?: number;
  minDistance?: number;
  estimatedTime: string;
  recommended?: boolean;
}

// Cart Item Component
const CartItemComponent = ({ 
  item, 
  onUpdateQuantity,
  onUpdateNotes
}: { 
  item: CartItem; 
  onUpdateQuantity: (id: number, quantity: number) => void;
  onUpdateNotes: (id: number, notes: string) => void;
}) => {
  const [notes, setNotes] = useState(item.notes || '');

  const handleNotesChange = (text: string) => {
    setNotes(text);
    onUpdateNotes(item.id, text);
  };

  return (
    <View style={styles.cartItemContainer}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.cartItemImage}
        resizeMode="cover"
      />
      
      <View style={styles.cartItemContent}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>{item.price} ETB</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
          >
            <Ionicons name="remove" size={18} color="#8B572A" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={18} color="#8B572A" />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => onUpdateQuantity(item.id, 0)}
      >
        <Ionicons name="trash-outline" size={20} color="#C73030" />
      </TouchableOpacity>
      
      <TextInput
        style={styles.notesInput}
        placeholder="Add notes (optional)"
        value={notes}
        onChangeText={handleNotesChange}
        dense
        mode="outlined"
        outlineColor="#E5A764"
        activeOutlineColor="#8B572A"
      />
    </View>
  );
};

// Delivery Option Component
const DeliveryOptionComponent = ({ 
  option, 
  selected, 
  onSelect 
}: { 
  option: DeliveryOption; 
  selected: boolean;
  onSelect: () => void;
}) => {
  return (
    <TouchableOpacity 
      style={[styles.deliveryOptionContainer, selected && styles.selectedDeliveryOption]}
      onPress={onSelect}
    >
      <View style={styles.deliveryOptionHeader}>
        <View style={styles.deliveryOptionIcon}>
          <Ionicons name={option.icon as any} size={22} color={selected ? 'white' : '#8B572A'} />
        </View>
        
        <View style={styles.deliveryOptionTitleContainer}>
          <Text style={[styles.deliveryOptionTitle, selected && styles.selectedText]}>
            {option.name}
          </Text>
          <Text style={[styles.deliveryOptionTime, selected && styles.selectedText]}>
            {option.estimatedTime}
          </Text>
        </View>
        
        {option.recommended && (
          <View style={styles.recommendedTag}>
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.deliveryOptionDescription, selected && styles.selectedText]}>
        {option.description}
      </Text>
      
      <Text style={[styles.deliveryOptionPrice, selected && styles.selectedText]}>
        {option.baseFee} ETB
      </Text>
      
      <View style={styles.radioOuter}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

// Cart Screen
const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Doro Wat',
      price: 250,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
      notes: '',
    },
    {
      id: 2,
      name: 'Tibs',
      price: 220,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
      notes: '',
    },
  ]);
  
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>('standard');
  
  // Sample delivery options
  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      icon: 'bicycle-outline',
      description: 'Regular delivery service',
      baseFee: 50,
      estimatedTime: '25-35 min',
      recommended: true,
    },
    {
      id: 'express',
      name: 'Express Delivery',
      icon: 'flash-outline',
      description: 'Faster delivery service',
      baseFee: 100,
      estimatedTime: '15-25 min',
    },
    {
      id: 'scheduled',
      name: 'Scheduled Delivery',
      icon: 'calendar-outline',
      description: 'Choose your delivery time',
      baseFee: 60,
      estimatedTime: 'Scheduled',
    },
  ];
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedDeliveryOptionObj = deliveryOptions.find(option => option.id === selectedDeliveryOption);
  const deliveryFee = selectedDeliveryOptionObj ? selectedDeliveryOptionObj.baseFee : 0;
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + deliveryFee + serviceFee;
  
  // Handle quantity updates
  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      // Remove item if quantity is 0
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      // Update quantity otherwise
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };
  
  // Handle notes updates
  const handleUpdateNotes = (id: number, notes: string) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, notes } : item
    ));
  };
  
  // Handle checkout
  const handleCheckout = () => {
    // @ts-ignore - Navigation typing issue
    navigation.navigate('OrderSuccess');
  };
  
  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar style="dark" />
        <Ionicons name="cart-outline" size={80} color="#E5A764" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Add some delicious food to get started</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.browseButton}
          labelStyle={styles.browseButtonLabel}
        >
          Browse Restaurants
        </Button>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        
        {cartItems.map(item => (
          <CartItemComponent 
            key={item.id} 
            item={item} 
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateNotes={handleUpdateNotes}
          />
        ))}
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Delivery Options</Text>
        
        {deliveryOptions.map(option => (
          <DeliveryOptionComponent 
            key={option.id}
            option={option}
            selected={selectedDeliveryOption === option.id}
            onSelect={() => setSelectedDeliveryOption(option.id)}
          />
        ))}
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{subtotal} ETB</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{deliveryFee} ETB</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>{serviceFee} ETB</Text>
          </View>
          
          <Divider style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total} ETB</Text>
          </View>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
      
      <View style={styles.bottomBar}>
        <Button 
          mode="contained" 
          onPress={handleCheckout}
          style={styles.checkoutButton}
          labelStyle={styles.checkoutButtonLabel}
        >
          Proceed to Payment
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F2D1F',
    marginBottom: 15,
    fontFamily: 'DMSans-Medium',
  },
  cartItemContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    position: 'absolute',
    top: 15,
    left: 15,
  },
  cartItemContent: {
    marginLeft: 95,
    marginBottom: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F2D1F',
    marginBottom: 5,
    fontFamily: 'DMSans-Medium',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#C73030',
    marginBottom: 10,
    fontFamily: 'DMSans-Medium',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 167, 100, 0.5)',
    borderRadius: 5,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  quantityButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229, 167, 100, 0.1)',
  },
  quantityText: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#4F2D1F',
    fontFamily: 'DMSans-Medium',
  },
  removeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesInput: {
    marginTop: 10,
    backgroundColor: 'white',
    height: 40,
    fontSize: 14,
  },
  divider: {
    backgroundColor: 'rgba(229, 167, 100, 0.3)',
    height: 1,
    marginVertical: 20,
  },
  deliveryOptionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(229, 167, 100, 0.5)',
    position: 'relative',
  },
  selectedDeliveryOption: {
    backgroundColor: '#8B572A',
    borderColor: '#8B572A',
  },
  deliveryOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 167, 100, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  deliveryOptionTitleContainer: {
    flex: 1,
  },
  deliveryOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F2D1F',
    marginBottom: 2,
    fontFamily: 'DMSans-Medium',
  },
  deliveryOptionTime: {
    fontSize: 12,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  deliveryOptionDescription: {
    fontSize: 14,
    color: '#4F2D1F',
    marginBottom: 5,
    fontFamily: 'DMSans-Regular',
  },
  deliveryOptionPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C73030',
    fontFamily: 'DMSans-Medium',
  },
  selectedText: {
    color: 'white',
  },
  radioOuter: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B572A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  recommendedTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E5A764',
    borderRadius: 4,
    marginLeft: 10,
  },
  recommendedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8B572A',
    fontFamily: 'DMSans-Regular',
  },
  summaryValue: {
    fontSize: 14,
    color: '#4F2D1F',
    fontFamily: 'DMSans-Medium',
  },
  summaryDivider: {
    backgroundColor: 'rgba(229, 167, 100, 0.3)',
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F2D1F',
    fontFamily: 'DMSans-Bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C73030',
    fontFamily: 'DMSans-Bold',
  },
  bottomBar: {
    backgroundColor: 'white',
    padding: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  checkoutButton: {
    backgroundColor: '#8B572A',
    paddingVertical: 5,
  },
  checkoutButtonLabel: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    paddingVertical: 2,
  },
  spacer: {
    height: 30,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F2D1F',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'DMSans-Bold',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8B572A',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'DMSans-Regular',
  },
  browseButton: {
    backgroundColor: '#8B572A',
    paddingVertical: 5,
    width: '80%',
  },
  browseButtonLabel: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    paddingVertical: 2,
  },
});

export default CartScreen;