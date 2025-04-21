import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { useCart } from '@/store/CartContext';

const OrderSuccess = () => {
  const [, setLocation] = useLocation();
  const { clearCart } = useCart();
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [showConfetti, setShowConfetti] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [orderNumber] = useState(() => Math.floor(10000 + Math.random() * 90000));

  // Update window dimensions when window resizes
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear cart when arriving on this page
  useEffect(() => {
    clearCart();
    
    // Show content after a slight delay for animation purposes
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 800);
    
    // Stop confetti after 6 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [clearCart]);

  const handleTrackOrder = () => {
    setLocation('/order-tracking');
  };

  const handleReturnHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative px-4 py-12 bg-[#FFF9F2]">
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          colors={['#8B572A', '#E5A764', '#FFF9F2', '#4F2D1F', '#D35400']}
        />
      )}
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20, 
          delay: 0.2 
        }}
        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6"
      >
        <Icons.check className="w-12 h-12 text-white" />
      </motion.div>
      
      {showContent && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-2 text-[#4F2D1F]">Order Successful!</h1>
          <p className="text-[#8B572A] mb-6">Your order #{orderNumber} has been placed</p>
          
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6 mb-8 max-w-md w-full mx-auto border border-[#E5A764]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5A764]/20">
              <div className="text-left">
                <p className="text-sm text-[#8B572A]">Estimated Delivery Time</p>
                <p className="text-lg font-bold text-[#4F2D1F]">25-35 minutes</p>
              </div>
              <div className="w-12 h-12 bg-[#E5A764]/20 rounded-full flex items-center justify-center">
                <Icons.clock className="w-6 h-6 text-[#8B572A]" />
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5A764]/20">
              <div className="text-left">
                <p className="text-sm text-[#8B572A]">Delivery Address</p>
                <p className="text-[#4F2D1F] font-medium">Meskel Square, Addis Ababa</p>
              </div>
              <div className="w-12 h-12 bg-[#E5A764]/20 rounded-full flex items-center justify-center">
                <Icons.mapPin className="w-6 h-6 text-[#8B572A]" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-[#8B572A]">Payment Method</p>
                <p className="text-[#4F2D1F] font-medium">TeleBirr</p>
              </div>
              <div className="w-12 h-12 bg-[#E5A764]/20 rounded-full flex items-center justify-center">
                <Icons.creditCard className="w-6 h-6 text-[#8B572A]" />
              </div>
            </div>
          </motion.div>
          
          <div className="flex flex-col space-y-3 max-w-md w-full mx-auto">
            <Button 
              className="bg-[#8B572A] hover:bg-[#4F2D1F] text-white font-medium py-6"
              onClick={handleTrackOrder}
            >
              <Icons.mapPin className="mr-2 h-5 w-5" />
              Track My Order
            </Button>
            
            <Button 
              variant="outline" 
              className="border-[#8B572A] text-[#8B572A] hover:bg-[#E5A764]/10 font-medium py-6"
              onClick={handleReturnHome}
            >
              <Icons.home className="mr-2 h-5 w-5" />
              Return to Home
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderSuccess;