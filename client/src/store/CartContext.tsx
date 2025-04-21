import { createContext, useContext, useState, ReactNode } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  restaurantId: number;
}

interface CartContextType {
  cartItems: CartItem[];
  restaurantId: number | null;
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const addToCart = (newItem: CartItem) => {
    // If cart is empty, set the restaurant ID
    if (cartItems.length === 0) {
      setRestaurantId(newItem.restaurantId);
    } 
    // If the item is from a different restaurant, clear the cart first
    else if (restaurantId !== newItem.restaurantId) {
      setCartItems([]);
      setRestaurantId(newItem.restaurantId);
    }

    setCartItems((prevItems) => {
      // Check if the item already exists in the cart
      const existingItem = prevItems.find((item) => item.id === newItem.id);
      
      if (existingItem) {
        // Update the quantity of the existing item
        return prevItems.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // Add the new item to the cart
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== id);
      if (newItems.length === 0) {
        setRestaurantId(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
