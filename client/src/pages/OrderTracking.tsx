import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import DeliveryMap from "@/components/DeliveryMap";
import RatingStars from "@/components/RatingStars";
import VoiceAssistant from "@/components/VoiceAssistant";
import { fadeIn, slideUp } from "@/lib/animation";

// Order status timeline steps - more detailed version for the full tracking page
const orderSteps = [
  { 
    id: 1, 
    name: "Order Confirmed", 
    description: "Thank you for your order! Your payment has been processed successfully.", 
    icon: "check", 
    time: "Just now", 
    completed: true 
  },
  { 
    id: 2, 
    name: "Preparing Your Food", 
    description: "Our chefs at Gusto Restaurant are preparing your delicious Ethiopian cuisine.", 
    icon: "utensils", 
    time: "5-10 mins", 
    completed: true 
  },
  { 
    id: 3, 
    name: "On the Way", 
    description: "Your order is on the way with our delivery partner. Track their location in real-time.", 
    icon: "truck", 
    time: "15-20 mins", 
    completed: true 
  },
  { 
    id: 4, 
    name: "Delivered", 
    description: "Enjoy your meal! Don't forget to rate your experience.", 
    icon: "package", 
    time: "5-10 mins remaining", 
    completed: false 
  }
];

const OrderTracking = () => {
  const [, setLocation] = useLocation();
  const [rating, setRating] = useState(0);
  const [currentStep, setCurrentStep] = useState(3); // Start at the "On the Way" step
  const [showRating, setShowRating] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(10); // in minutes
  
  // Mock order data - in a real app, you would fetch this data from your API
  const orderData = {
    id: "FD2874",
    status: "on-way",
    restaurant: {
      name: "Gusto Restaurant",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150",
      items: 2,
      total: 370
    },
    driver: {
      name: "Abebe Kebede",
      imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      rating: 4.8
    }
  };

  // Simulate delivery progress
  useEffect(() => {
    if (currentStep < 4) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
        if (currentStep + 1 === 4) {
          setShowRating(true);
        }
      }, 15000); // Advance every 15 seconds
      
      // Update estimated time
      const estimateTimer = setInterval(() => {
        setEstimatedTime(prev => Math.max(prev - 1, 0));
      }, 60000); // Update every minute
      
      return () => {
        clearTimeout(timer);
        clearInterval(estimateTimer);
      };
    }
  }, [currentStep]);

  const handleSubmitRating = () => {
    // In a real app, you would submit the rating to your API
    alert(`Thank you for your ${rating}-star rating!`);
    setLocation("/");
  };

  const handleBackClick = () => {
    setLocation("/");
  };

  // Helper to get the appropriate icon for the step
  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'check': return <Icons.check className="w-5 h-5" />;
      case 'utensils': return <Icons.chefHat className="w-5 h-5" />;
      case 'truck': return <Icons.truck className="w-5 h-5" />;
      case 'package': return <Icons.package className="w-5 h-5" />;
      default: return <Icons.circle className="w-5 h-5" />;
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-[#FFF9F2]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            className="p-0 mr-2"
            onClick={handleBackClick}
          >
            <Icons.chevronLeft className="h-6 w-6 text-[#4F2D1F]" />
          </Button>
          <h1 className="text-lg font-bold text-[#4F2D1F]">Track Order #{orderData.id}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-auto pb-20">
        <div className="p-4">
          {/* Restaurant info */}
          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 mb-4 border border-[#E5A764]/20"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center">
              <img 
                src={orderData.restaurant.imageUrl} 
                alt={orderData.restaurant.name}
                className="w-16 h-16 rounded-lg object-cover mr-3" 
              />
              <div>
                <p className="font-medium text-[#4F2D1F]">{orderData.restaurant.name}</p>
                <p className="text-sm text-[#8B572A]">
                  {orderData.restaurant.items} items · {orderData.restaurant.total.toLocaleString()} ETB
                </p>
                <div className="flex items-center mt-1">
                  <Icons.clock className="h-4 w-4 text-[#8B572A] mr-1" />
                  <span className="text-sm font-medium text-[#4F2D1F]">
                    {estimatedTime > 0 ? `${estimatedTime} min` : "Arriving now!"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Map view */}
          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 mb-4 border border-[#E5A764]/20"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-bold text-[#4F2D1F] mb-3">Delivery Location</h3>
            <div className="rounded-lg overflow-hidden h-44 mb-3">
              <DeliveryMap height="100%" />
            </div>
            <div className="flex items-start">
              <Icons.mapPin className="text-[#8B572A] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
              <p className="text-[#4F2D1F]">Meskel Square, Addis Ababa, Ethiopia</p>
            </div>
          </motion.div>
          
          {/* Order status steps */}
          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 mb-4 border border-[#E5A764]/20"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-bold text-[#4F2D1F] mb-4">Order Status</h3>
            <div className="space-y-0">
              {orderSteps.map((step, index) => {
                const isStepCompleted = step.id <= currentStep;
                return (
                  <div key={step.id} className="relative">
                    {/* Connecting line */}
                    {index < orderSteps.length - 1 && (
                      <div 
                        className={`absolute left-[15px] top-[30px] w-[2px] h-[calc(100%-15px)] ${
                          isStepCompleted && orderSteps[index + 1].id <= currentStep 
                            ? 'bg-[#8B572A]' 
                            : 'bg-gray-200'
                        } transition-colors duration-500`}
                      />
                    )}
                    
                    <div className="flex items-start py-3">
                      <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${
                        isStepCompleted ? 'bg-[#8B572A]' : 'bg-gray-200'
                      } flex items-center justify-center text-white transition-colors duration-500`}>
                        {getStepIcon(step.icon)}
                      </div>
                      
                      <div className="ml-4 flex-grow">
                        <div className="flex justify-between items-center">
                          <h4 className={`font-medium ${isStepCompleted ? 'text-[#4F2D1F]' : 'text-gray-500'}`}>
                            {step.name}
                          </h4>
                          <span className="text-xs text-[#8B572A]">{step.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
          
          {/* Driver information */}
          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 mb-4 border border-[#E5A764]/20"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-bold text-[#4F2D1F] mb-3">Delivery Person</h3>
            <div className="flex items-center">
              <img 
                src={orderData.driver.imageUrl} 
                alt={orderData.driver.name}
                className="w-14 h-14 rounded-full object-cover mr-3 border-2 border-[#E5A764]" 
              />
              <div className="flex-1">
                <p className="font-medium text-[#4F2D1F]">{orderData.driver.name}</p>
                <div className="flex items-center">
                  <Icons.star className="h-4 w-4 text-[#E5A764] mr-1" />
                  <span className="text-sm text-[#8B572A]">{orderData.driver.rating}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-[#8B572A] text-[#8B572A] hover:bg-[#E5A764]/10">
                  <Icons.phone className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-[#8B572A] text-[#8B572A] hover:bg-[#E5A764]/10">
                  <Icons.message className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Rate order section - shows after delivery is complete */}
          {currentStep === 4 && showRating && (
            <motion.div 
              className="bg-white rounded-xl shadow-md p-4 mb-4 border border-[#E5A764]/20"
              variants={slideUp}
              initial="hidden"
              animate="visible"
            >
              <h3 className="font-bold text-[#4F2D1F] mb-3">How was your meal?</h3>
              <div className="flex justify-center mb-4">
                <RatingStars rating={rating} setRating={setRating} />
              </div>
              <Button 
                className="w-full bg-[#8B572A] hover:bg-[#4F2D1F] text-white"
                onClick={handleSubmitRating}
              >
                Submit Rating
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderTracking;
