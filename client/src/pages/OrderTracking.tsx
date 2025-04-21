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
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  
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
      {/* Full-width map at the top */}
      <div className="relative w-full h-[40vh]">
        <DeliveryMap height="100%" />
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Button 
            variant="outline" 
            size="icon"
            className="h-10 w-10 rounded-full bg-white shadow-md"
            onClick={handleBackClick}
          >
            <Icons.chevronLeft className="h-5 w-5 text-[#4F2D1F]" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-white shadow-md"
            onClick={() => {}}
          >
            <Icons.info className="h-5 w-5 text-[#4F2D1F]" />
          </Button>
        </div>
        
        {/* Voice control button (on map) */}
        <Button
          variant="default"
          size="icon"
          className="absolute right-4 bottom-4 rounded-full h-12 w-12 bg-[#8B572A] hover:bg-[#4F2D1F] shadow-lg z-10"
          onClick={() => setShowVoiceAssistant(true)}
        >
          <Mic className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* Order status card - floating above the map */}
      <div className="relative -mt-10 mx-4 z-20">
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-5 mb-4"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <div className="mb-2">
            <h2 className="text-xl font-bold text-[#4F2D1F]">
              {currentStep === 4 ? "Delivery complete" : "Delivery in progress"}
            </h2>
            <p className="text-[#8B572A]">
              {currentStep === 4 ? "Completed" : estimatedTime > 0 ? `${estimatedTime} min remaining` : "Arriving now!"}
            </p>
          </div>
          
          {/* Horizontal timeline */}
          <div className="flex items-center justify-between my-4 px-4">
            {orderSteps.map((step, index) => {
              const isStepCompleted = step.id <= currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative">
                  {/* Connecting line */}
                  {index < orderSteps.length - 1 && (
                    <div className={`absolute top-3 left-6 w-[calc(100%+10px)] h-[2px] ${
                      isStepCompleted && orderSteps[index + 1].id <= currentStep 
                        ? 'bg-[#8B572A]' 
                        : 'bg-gray-200'
                    } transition-colors duration-500`} />
                  )}
                  
                  {/* Step circle */}
                  <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full ${
                    isStepCompleted ? 'bg-[#8B572A]' : 'bg-gray-200'
                  } flex items-center justify-center text-white transition-colors duration-500 mb-2`}>
                    <div className="h-3 w-3">
                      {getStepIcon(step.icon)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-[#4F2D1F] mb-3">
            {currentStep === 4 
              ? "Your order has been delivered successfully." 
              : `Your order is ${orderSteps[currentStep - 1].name.toLowerCase()}.`}
          </p>
          
          {/* Driver info - like in the example */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <img 
                src={orderData.driver.imageUrl} 
                alt={orderData.driver.name}
                className="w-12 h-12 rounded-full object-cover mr-3" 
              />
              <div>
                <p className="font-medium text-[#4F2D1F]">{orderData.driver.name}</p>
                <p className="text-sm text-[#8B572A]">Your Driver</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="icon" variant="outline" className="rounded-full h-10 w-10 bg-gray-100 border-none">
                <Icons.phone className="h-5 w-5 text-[#4F2D1F]" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-10 w-10 bg-gray-100 border-none">
                <Icons.message className="h-5 w-5 text-[#4F2D1F]" />
              </Button>
            </div>
          </div>
          
          {/* View details button */}
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              className="text-[#8B572A] w-full"
            >
              View all details
              <Icons.chevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Rate order section - shows after delivery is complete */}
      {currentStep === 4 && showRating && (
        <motion.div 
          className="mx-4 bg-white rounded-xl shadow-md p-4 mb-4"
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

      {/* Voice assistant - toggled when the mic button is clicked */}
      {showVoiceAssistant && (
        <VoiceAssistant 
          orderStatus={orderSteps[currentStep - 1].name}
          trackingNumber={orderData.id}
          estimatedDeliveryTime={estimatedTime > 0 ? `${estimatedTime} minutes` : "arriving now"}
          onClose={() => setShowVoiceAssistant(false)}
        />
      )}
    </motion.div>
  );
};

export default OrderTracking;
