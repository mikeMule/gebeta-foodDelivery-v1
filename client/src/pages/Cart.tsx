import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CartItem from "@/components/CartItem";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { type Restaurant } from "@shared/schema";

const Cart = () => {
  const [, setLocation] = useLocation();
  const { cartItems, restaurantId, totalAmount, clearCart } = useCart();
  const [instructions, setInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  
  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${restaurantId}`],
    enabled: !!restaurantId,
  });

  const deliveryFee = restaurant?.deliveryFee || 0;
  const serviceFee = 30; // Fixed service fee
  const totalWithFees = totalAmount + deliveryFee + serviceFee;

  const handleBackClick = () => {
    setLocation(`/restaurant/${restaurantId}`);
  };
  
  const handleCheckout = () => {
    // Create a new order in the backend
    clearCart();
    setLocation("/order-tracking");
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            className="p-0 mr-4"
            onClick={handleBackClick}
          >
            <Icons.chevronLeft className="text-2xl" />
          </Button>
          <h1 className="text-xl font-bold font-dm-sans">Your Cart</h1>
        </div>
      </header>
      
      <div className="flex-grow p-4">
        {restaurant && (
          <div className="bg-neutral-50 rounded-lg p-3 mb-4 flex items-center">
            <Icons.store className="text-lg text-primary mr-3" />
            <div>
              <h3 className="font-medium">{restaurant.name}</h3>
              <p className="text-sm text-neutral-600">
                {restaurant.distance.toFixed(1)} km away • {restaurant.deliveryTime}
              </p>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          {cartItems.map((item, index) => (
            <CartItem 
              key={`${item.id}-${index}`}
              item={item}
              isLast={index === cartItems.length - 1}
            />
          ))}
          
          <div className="mt-4 pt-3 border-t border-neutral-200">
            <Button 
              variant="ghost" 
              className="text-primary flex items-center w-full justify-center py-2"
              onClick={() => setLocation(`/restaurant/${restaurantId}`)}
            >
              <Icons.plus className="mr-1" />
              <span>Add more items</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-medium mb-3">Delivery Instructions</h3>
          <Textarea 
            className="w-full border border-neutral-200 rounded-lg p-3 text-sm" 
            rows={2} 
            placeholder="Add any special instructions..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-4 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-medium mb-3">Order Summary</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span>Birr {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Delivery Fee</span>
              <span>Birr {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Service Fee</span>
              <span>Birr {serviceFee.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>Birr {totalWithFees.toFixed(2)}</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-medium mb-3">Payment Method</h3>
          
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className={`border rounded-lg p-3 flex items-center mb-3 ${paymentMethod === 'cash' ? 'border-primary' : 'border-neutral-200'}`}>
              <RadioGroupItem value="cash" id="cash" className="mr-3" />
              <Label htmlFor="cash" className="font-medium flex-grow">
                Cash on Delivery
              </Label>
            </div>
            
            <div className={`border rounded-lg p-3 flex items-center ${paymentMethod === 'telebirr' ? 'border-primary' : 'border-neutral-200'}`}>
              <RadioGroupItem value="telebirr" id="telebirr" className="mr-3" />
              <Label htmlFor="telebirr" className="font-medium flex-grow">
                Telebirr
              </Label>
              <Icons.creditCard className="text-neutral-400" />
            </div>
          </RadioGroup>
        </motion.div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4">
        <Button 
          className="w-full bg-primary text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
          onClick={handleCheckout}
        >
          <span>Place Order • Birr {totalWithFees.toFixed(2)}</span>
        </Button>
      </div>
    </motion.div>
  );
};

export default Cart;
