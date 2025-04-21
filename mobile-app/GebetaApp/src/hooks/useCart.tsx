import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface FoodItem {
  id: number;
  name: string;
  price: number;
  restaurantId: number;
  image: string;
}

interface CartItem extends FoodItem {
  quantity: number;
  notes?: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
  deliveryOption: DeliveryOption | null;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

// Action types
type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: FoodItem; quantity: number; notes?: string } }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'UPDATE_NOTES'; payload: { id: number; notes: string } }
  | { type: 'SET_DELIVERY_OPTION'; payload: DeliveryOption }
  | { type: 'CLEAR_CART' };

// Initial state
const initialState: CartState = {
  items: [],
  restaurantId: null,
  restaurantName: null,
  deliveryOption: null,
  subtotal: 0,
  deliveryFee: 0,
  serviceFee: 0,
  total: 0,
};

// Helper functions
const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const calculateServiceFee = (subtotal: number): number => {
  // 5% service fee
  return Math.round(subtotal * 0.05);
};

const calculateTotal = (subtotal: number, deliveryFee: number, serviceFee: number): number => {
  return subtotal + deliveryFee + serviceFee;
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity, notes } = action.payload;
      
      // Check if item is from a different restaurant
      if (state.restaurantId !== null && state.restaurantId !== item.restaurantId) {
        // Can't add items from different restaurants
        return state;
      }
      
      // Check if item is already in cart
      const existingItemIndex = state.items.findIndex(cartItem => cartItem.id === item.id);
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
          notes: notes || newItems[existingItemIndex].notes,
        };
      } else {
        // Add new item
        newItems = [
          ...state.items,
          { ...item, quantity, notes },
        ];
      }
      
      const subtotal = calculateSubtotal(newItems);
      const serviceFee = calculateServiceFee(subtotal);
      const deliveryFee = state.deliveryOption ? state.deliveryOption.price : 0;
      
      return {
        ...state,
        items: newItems,
        restaurantId: item.restaurantId,
        restaurantName: item.name,
        subtotal,
        serviceFee,
        deliveryFee,
        total: calculateTotal(subtotal, deliveryFee, serviceFee),
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      
      // Check if cart is empty
      if (newItems.length === 0) {
        return initialState;
      }
      
      const subtotal = calculateSubtotal(newItems);
      const serviceFee = calculateServiceFee(subtotal);
      const deliveryFee = state.deliveryOption ? state.deliveryOption.price : 0;
      
      return {
        ...state,
        items: newItems,
        subtotal,
        serviceFee,
        total: calculateTotal(subtotal, deliveryFee, serviceFee),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      // If quantity is 0 or less, remove item
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id } });
      }
      
      // Update item quantity
      const newItems = state.items.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      
      const subtotal = calculateSubtotal(newItems);
      const serviceFee = calculateServiceFee(subtotal);
      const deliveryFee = state.deliveryOption ? state.deliveryOption.price : 0;
      
      return {
        ...state,
        items: newItems,
        subtotal,
        serviceFee,
        total: calculateTotal(subtotal, deliveryFee, serviceFee),
      };
    }
    
    case 'UPDATE_NOTES': {
      const { id, notes } = action.payload;
      
      // Update item notes
      const newItems = state.items.map(item => 
        item.id === id ? { ...item, notes } : item
      );
      
      return {
        ...state,
        items: newItems,
      };
    }
    
    case 'SET_DELIVERY_OPTION': {
      const deliveryOption = action.payload;
      const deliveryFee = deliveryOption.price;
      
      return {
        ...state,
        deliveryOption,
        deliveryFee,
        total: calculateTotal(state.subtotal, deliveryFee, state.serviceFee),
      };
    }
    
    case 'CLEAR_CART': {
      return initialState;
    }
    
    default:
      return state;
  }
};

// Context
interface CartContextType {
  state: CartState;
  addItem: (item: FoodItem, quantity: number, notes?: string) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateNotes: (id: number, notes: string) => void;
  setDeliveryOption: (option: DeliveryOption) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Calculate total items in cart
  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
  
  // Actions
  const addItem = (item: FoodItem, quantity: number, notes?: string) => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { item, quantity, notes } 
    });
  };
  
  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const updateNotes = (id: number, notes: string) => {
    dispatch({ type: 'UPDATE_NOTES', payload: { id, notes } });
  };
  
  const setDeliveryOption = (option: DeliveryOption) => {
    dispatch({ type: 'SET_DELIVERY_OPTION', payload: option });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const value = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    setDeliveryOption,
    clearCart,
    itemCount,
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook for using cart context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};