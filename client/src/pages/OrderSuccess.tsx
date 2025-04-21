import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { useCart } from '@/store/CartContext';

const OrderSuccess = () => {
  const [, setLocation] = useLocation();
  const { clearCart } = useCart();
  const [trackingNumber] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());
  const [isLoading, setIsLoading] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(5);

  // Clear cart on page load
  useEffect(() => {
    clearCart();
    
    // Auto-redirect after a few seconds
    const timer = setInterval(() => {
      setRedirectTimer(prev => {
        if (prev <= 1) {
          handleViewOrder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [clearCart]);

  const handleViewOrder = () => {
    setIsLoading(true);
    // Redirect to tracking page after a short delay
    setTimeout(() => {
      setLocation('/order-tracking');
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FFF9F2]">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20
        }}
        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8"
      >
        <Icons.check className="w-12 h-12 text-white" />
      </motion.div>
      
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-2 text-[#4F2D1F]">Thank You!</h1>
        <p className="text-[#8B572A] mb-6">Your order has been placed successfully</p>
        
        <div className="max-w-xs mx-auto">
          <p className="text-sm text-[#8B572A] mb-1">Tracking number</p>
          <p className="text-lg font-bold text-[#4F2D1F] mb-8">{trackingNumber}</p>
          
          <Button 
            className="bg-[#8B572A] hover:bg-[#4F2D1F] text-white w-full py-6 mb-2"
            onClick={handleViewOrder}
            isLoading={isLoading}
          >
            <Icons.mapPin className="mr-2 h-5 w-5" />
            Track Order
          </Button>
          
          <p className="text-sm text-[#8B572A] mt-4">
            Redirecting to order tracking in {redirectTimer} seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;