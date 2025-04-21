import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import DeliveryStatus from "@/components/DeliveryStatus";
import RatingStars from "@/components/RatingStars";

const OrderTracking = () => {
  const [, setLocation] = useLocation();
  const [rating, setRating] = useState(0);
  
  // Mock data - in a real app, you would fetch this data from your API
  const orderData = {
    id: "FD2874",
    status: "on-way",
    restaurant: {
      name: "Gusto Restaurant",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150",
      items: 2,
      total: 370
    },
    steps: [
      { id: 1, name: "Order Confirmed", time: "12:45 PM", completed: true },
      { id: 2, name: "Preparing Your Food", time: "12:50 PM", completed: true },
      { id: 3, name: "On the Way", time: "1:05 PM", completed: true },
      { id: 4, name: "Delivered", time: "Estimated: 1:25 PM", completed: false }
    ],
    driver: {
      name: "Abebe Kebede",
      imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      rating: 4.8
    }
  };

  const handleBackClick = () => {
    setLocation("/home");
  };

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
          <h1 className="text-xl font-bold font-dm-sans">Order Tracking</h1>
        </div>
      </header>
      
      <div className="flex-grow p-4">
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-4 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Order #{orderData.id}</h3>
            <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              On the way
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-full overflow-hidden mr-3">
              <img 
                src={orderData.restaurant.imageUrl} 
                alt="Restaurant logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{orderData.restaurant.name}</h3>
              <p className="text-sm text-neutral-600">
                {orderData.restaurant.items} items • Birr {orderData.restaurant.total.toFixed(2)}
              </p>
            </div>
          </div>
          
          {orderData.steps.map((step, index) => (
            <DeliveryStatus 
              key={step.id}
              step={step}
              isLast={index === orderData.steps.length - 1}
            />
          ))}
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-4 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-full overflow-hidden mr-3">
              <img 
                src={orderData.driver.imageUrl} 
                alt="Delivery person" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-medium">{orderData.driver.name}</h3>
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  <Icons.star className="text-yellow-500 text-xs mr-1" />
                  <span className="text-xs">{orderData.driver.rating}</span>
                </div>
                <span className="text-xs text-neutral-600">Delivery Partner</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="ghost" className="w-10 h-10 p-0 bg-neutral-100 rounded-full">
                <Icons.message className="text-neutral-700" />
              </Button>
              <Button variant="ghost" className="w-10 h-10 p-0 bg-green-100 rounded-full">
                <Icons.phone className="text-green-600" />
              </Button>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg h-40 flex items-center justify-center">
            <div className="text-center">
              <Icons.mapPin className="mx-auto text-4xl text-primary mb-2" />
              <p className="text-neutral-600">Tracking Map</p>
              <p className="text-xs text-neutral-500">Delivery ETA: 20 minutes</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-medium mb-3">Rate Your Experience</h3>
          <p className="text-sm text-neutral-600 mb-3">How was your order from {orderData.restaurant.name}?</p>
          
          <div className="flex justify-center space-x-2 mb-4">
            <RatingStars rating={rating} setRating={setRating} />
          </div>
          
          <Button variant="outline" className="w-full bg-neutral-100 text-neutral-800 font-medium py-2.5 px-4 rounded-lg">
            Leave Feedback
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrderTracking;
