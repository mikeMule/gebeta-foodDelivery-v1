import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CartItem from "@/components/CartItem";
import DeliveryMap from "@/components/DeliveryMap";
import TelebirrQRCode from "@/components/TelebirrQRCode";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { type Restaurant } from "@shared/schema";
import { Car, Bike, Truck } from "lucide-react";

type DeliveryOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  baseFee: number;
  extraFeePerKm?: number;
  maxDistance?: number;
  minDistance?: number;
  estimatedTime: string;
  recommended?: boolean;
};

const deliveryOptions: DeliveryOption[] = [
  {
    id: "ebike",
    name: "E-Bike",
    icon: <Truck className="h-5 w-5" />,
    description: "Fastest eco-friendly option",
    baseFee: 250,
    maxDistance: 5,
    estimatedTime: "15-25 min",
    recommended: true
  },
  {
    id: "bike",
    name: "Normal Bike",
    icon: <Bike className="h-5 w-5" />,
    description: "Budget friendly option",
    baseFee: 150,
    maxDistance: 3,
    estimatedTime: "20-35 min"
  },
  {
    id: "car",
    name: "Car",
    icon: <Car className="h-5 w-5" />,
    description: "For longer distances",
    baseFee: 345,
    minDistance: 5,
    estimatedTime: "30-45 min"
  }
];

const Cart = () => {
  const [, setLocation] = useLocation();
  const { cartItems, restaurantId, totalAmount, clearCart } = useCart();
  const [instructions, setInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [deliveryOption, setDeliveryOption] = useState<string>("ebike");
  
  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${restaurantId}`],
    enabled: !!restaurantId,
  });

  // Calculate the appropriate delivery option based on distance
  useEffect(() => {
    if (restaurant) {
      const distance = restaurant.distance;
      
      if (distance > 5) {
        setDeliveryOption("car");
      } else if (distance > 3) {
        setDeliveryOption("ebike");
      } else {
        setDeliveryOption("bike");
      }
    }
  }, [restaurant]);

  // Calculate delivery fee based on selected option and distance
  const calculateDeliveryFee = (): number => {
    if (!restaurant) return 0;
    
    const distance = restaurant.distance;
    const option = deliveryOptions.find(opt => opt.id === deliveryOption);
    
    if (!option) return 0;
    
    // Check if this option is valid for the distance
    if (option.minDistance && distance < option.minDistance) {
      return 0; // Invalid option for this distance
    }
    
    if (option.maxDistance && distance > option.maxDistance) {
      return 0; // Invalid option for this distance
    }
    
    // Calculate fee with any per-km extra charges
    let fee = option.baseFee;
    if (option.extraFeePerKm) {
      fee += option.extraFeePerKm * distance;
    }
    
    return fee;
  };

  const deliveryFee = calculateDeliveryFee();
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
  
  // Get the selected delivery option details
  const selectedDeliveryOption = deliveryOptions.find(opt => opt.id === deliveryOption);

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
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
      
      <div className="flex-grow p-4 pb-32">
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
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <CartItem 
                key={`${item.id}-${index}`}
                item={item}
                isLast={index === cartItems.length - 1}
              />
            ))
          ) : (
            <div className="py-6 text-center">
              <Icons.shoppingBag className="mx-auto mb-3 text-3xl text-neutral-300" />
              <p className="text-neutral-500">Your cart is empty</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setLocation("/home")}
              >
                Browse Restaurants
              </Button>
            </div>
          )}
          
          {cartItems.length > 0 && (
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
          )}
        </div>
        
        {cartItems.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h3 className="font-medium mb-3">Delivery Location</h3>
              <DeliveryMap 
                height="180px"
                restaurantLocation={restaurant ? { 
                  lat: restaurant.latitude || 8.9806, 
                  lng: restaurant.longitude || 38.7578,
                  name: restaurant.name 
                } : undefined}
              />
              
              <h3 className="font-medium my-3">Delivery Instructions</h3>
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
              className="bg-white rounded-xl shadow-sm p-4 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="font-medium mb-3">Delivery Options</h3>
              
              <div className="grid gap-3">
                {deliveryOptions.map((option) => {
                  const isValid = restaurant && 
                    ((!option.minDistance || restaurant.distance >= option.minDistance) && 
                     (!option.maxDistance || restaurant.distance <= option.maxDistance));
                  
                  return (
                    <div
                      key={option.id}
                      onClick={() => isValid && setDeliveryOption(option.id)}
                      className={`
                        border rounded-lg p-3 transition-all relative
                        ${!isValid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/70'}
                        ${deliveryOption === option.id ? 'border-primary bg-primary/5' : 'border-neutral-200'}
                      `}
                    >
                      <div className={`flex items-center ${deliveryOption === option.id ? 'animate-subtle-pulse' : ''}`}>
                        {option.recommended && (
                          <Badge 
                            className="absolute -top-2 -right-1 bg-green-500 text-[10px] px-2 py-0 h-5"
                            variant="secondary"
                          >
                            Recommended
                          </Badge>
                        )}
                        
                        <motion.div 
                          className={`mr-3 p-2.5 rounded-full transition-all ${
                            deliveryOption === option.id 
                              ? 'bg-[#8B572A] text-white shadow-md' 
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                          animate={{
                            scale: deliveryOption === option.id ? 1.1 : 1,
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                          {option.icon}
                        </motion.div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <p className={`font-medium ${deliveryOption === option.id ? 'text-[#8B572A]' : ''}`}>
                              {option.name}
                            </p>
                            <p className={`font-medium text-right ${deliveryOption === option.id ? 'text-[#8B572A]' : ''}`}>
                              Birr {option.baseFee.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-xs text-neutral-500">{option.description}</p>
                            <p className="text-xs text-neutral-500">{option.estimatedTime}</p>
                          </div>
                        </div>

                        {deliveryOption === option.id && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-full flex items-center pointer-events-none"
                          >
                            <div className="bg-[#8B572A] rounded-full p-1 text-white">
                              <Icons.check className="h-4 w-4" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                      
                      {!isValid && (
                        <div className="mt-2 text-xs text-red-500">
                          {option.minDistance && restaurant && restaurant.distance < option.minDistance 
                            ? `Available only for distances above ${option.minDistance} km`
                            : `Available only for distances below ${option.maxDistance} km`
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {restaurant && (
                <div className="mt-3 text-xs text-neutral-500">
                  <p>
                    Delivery costs are calculated based on the distance ({restaurant.distance.toFixed(1)} km)
                  </p>
                  <ul className="mt-1 list-disc ml-4">
                    <li>Normal Bike: Up to 3 km - 150 ETB</li>
                    <li>E-Bike: Up to 5 km - 250 ETB</li>
                    <li>Car: Above 5 km - 345 ETB</li>
                  </ul>
                </div>
              )}
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-sm p-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-medium mb-3">Payment Method</h3>
              
              <div className="space-y-3">
                <div 
                  className={`border rounded-lg p-3 flex items-center ${
                    paymentMethod === 'cash' 
                      ? 'border-[#8B572A] bg-[#E5A764]/10' 
                      : 'border-neutral-200'
                  } cursor-pointer transition-all duration-300`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className={`w-4 h-4 mr-3 rounded-full border ${
                    paymentMethod === 'cash' 
                      ? 'border-[#8B572A] flex items-center justify-center' 
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'cash' && (
                      <div className="w-2 h-2 rounded-full bg-[#8B572A]"></div>
                    )}
                  </div>
                  <span className="font-medium flex-grow">Cash on Delivery</span>
                  
                  {paymentMethod === 'cash' && (
                    <div className="bg-[#8B572A] rounded-full p-1 text-white">
                      <Icons.check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                <div 
                  className={`border rounded-lg p-3 flex items-center ${
                    paymentMethod === 'telebirr' 
                      ? 'border-[#8B572A] bg-[#E5A764]/10' 
                      : 'border-neutral-200'
                  } cursor-pointer transition-all duration-300`}
                  onClick={() => setPaymentMethod('telebirr')}
                >
                  <div className={`w-4 h-4 mr-3 rounded-full border ${
                    paymentMethod === 'telebirr' 
                      ? 'border-[#8B572A] flex items-center justify-center' 
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'telebirr' && (
                      <div className="w-2 h-2 rounded-full bg-[#8B572A]"></div>
                    )}
                  </div>
                  <span className="font-medium flex-grow">Telebirr</span>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Recommended</span>
                    {paymentMethod === 'telebirr' ? (
                      <div className="bg-[#8B572A] rounded-full p-1 text-white">
                        <Icons.check className="h-4 w-4" />
                      </div>
                    ) : (
                      <Icons.creditCard className="text-neutral-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {paymentMethod === 'telebirr' && (
                <div className="mt-4 p-4 border border-[#E5A764]/30 rounded-lg bg-[#FFF9F2]">
                  <TelebirrQRCode amount={totalWithFees} />
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
      
      {cartItems.length > 0 && (
        <div className="fixed bottom-[70px] left-0 right-0 bg-white border-t border-neutral-200 p-4 z-10">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full bg-[#8B572A] hover:bg-[#8B572A]/90 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all duration-300"
              onClick={handleCheckout}
            >
              {selectedDeliveryOption?.icon && (
                <motion.div 
                  className="mr-1 bg-white/20 p-1 rounded-full"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                >
                  {selectedDeliveryOption.icon}
                </motion.div>
              )}
              <span>Proceed to Checkout • Birr {totalWithFees.toFixed(2)}</span>
            </Button>
          </motion.div>
          
          <p className="text-center text-xs text-neutral-500 mt-2">
            Selected delivery: {selectedDeliveryOption?.name} • Delivery Fee: Birr {deliveryFee.toFixed(2)}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default Cart;
