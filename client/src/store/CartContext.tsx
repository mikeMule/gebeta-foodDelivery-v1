import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag } from "lucide-react";

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
  const { toast } = useToast();

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const addToCart = (newItem: CartItem) => {
    let isNewItem = true;
    let isNewRestaurant = false;
    
    // If cart is empty, set the restaurant ID
    if (cartItems.length === 0) {
      setRestaurantId(newItem.restaurantId);
    } 
    // If the item is from a different restaurant, clear the cart first
    else if (restaurantId !== newItem.restaurantId) {
      setCartItems([]);
      setRestaurantId(newItem.restaurantId);
      isNewRestaurant = true;
    }

    setCartItems((prevItems) => {
      // Check if the item already exists in the cart
      const existingItem = prevItems.find((item) => item.id === newItem.id);
      
      if (existingItem) {
        isNewItem = false;
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

    // Show toast notification
    if (isNewRestaurant) {
      toast({
        title: "Cart Cleared",
        description: "Items from previous restaurant removed.",
        variant: "default"
      });
    }
    
    toast({
      title: isNewItem ? "Added to Cart" : "Updated Cart",
      description: `${newItem.quantity} × ${newItem.name} ${isNewItem ? "added to" : "updated in"} cart`,
      variant: "default",
      icon: <ShoppingBag className="h-4 w-4 text-[#8B572A]" />
    });
  };

  const removeFromCart = (id: number) => {
    // Get item before removing for toast notification
    const itemToRemove = cartItems.find(item => item.id === id);
    
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== id);
      if (newItems.length === 0) {
        setRestaurantId(null);
      }
      return newItems;
    });

    // Show toast notification if item was found
    if (itemToRemove) {
      toast({
        title: "Removed from Cart",
        description: `${itemToRemove.name} removed from cart`,
        variant: "destructive"
      });
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    // Get old quantity for comparison
    const oldItem = cartItems.find(item => item.id === id);
    const oldQuantity = oldItem?.quantity || 0;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );

    // Show toast notification for significant quantity changes
    if (oldItem && Math.abs(quantity - oldQuantity) > 0) {
      toast({
        title: "Cart Updated",
        description: `${oldItem.name} quantity updated to ${quantity}`,
        variant: "default"
      });
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    
    // Show toast notification
    if (cartItems.length > 0) {
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
        variant: "default"
      });
    }
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
