import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { fadeIn, slideUp } from "@/lib/animation";

// Mock orders data - in a real app, you would fetch this from your API
const MOCK_ORDERS = [
  {
    id: "FD2874",
    date: "2024-04-20",
    restaurant: "Gusto Restaurant",
    items: 2,
    total: 370,
    status: "delivered",
    restaurantImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150",
    orderItems: [
      { name: "Doro Wat", quantity: 1, price: 220 },
      { name: "Injera", quantity: 1, price: 150 }
    ],
    deliveryAddress: "Bole, Addis Ababa",
    deliveryTime: "15:30",
    deliveryFee: 50,
    paymentMethod: "TeleBirr"
  },
  {
    id: "FD2762",
    date: "2024-04-18",
    restaurant: "Burger House",
    items: 3,
    total: 450,
    status: "delivered",
    restaurantImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=150",
    orderItems: [
      { name: "Classic Burger", quantity: 1, price: 200 },
      { name: "Fries", quantity: 2, price: 125 }
    ],
    deliveryAddress: "Kazanchis, Addis Ababa",
    deliveryTime: "19:45",
    deliveryFee: 60,
    paymentMethod: "Cash"
  },
  {
    id: "FD2651",
    date: "2024-04-15",
    restaurant: "Ethiopian Flavors",
    items: 1,
    total: 280,
    status: "cancelled",
    restaurantImage: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=150",
    orderItems: [
      { name: "Beyaynetu", quantity: 1, price: 280 }
    ],
    deliveryAddress: "Piassa, Addis Ababa",
    deliveryTime: "13:20",
    deliveryFee: 45,
    paymentMethod: "TeleBirr"
  },
  {
    id: "FD2987",
    date: "2024-04-22",
    restaurant: "Burger House",
    items: 2,
    total: 395,
    status: "on-way",
    restaurantImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=150",
    orderItems: [
      { name: "Cheese Burger", quantity: 1, price: 225 },
      { name: "Coca Cola", quantity: 1, price: 70 }
    ],
    deliveryAddress: "Bole, Addis Ababa",
    deliveryTime: "14:15",
    deliveryFee: 100,
    paymentMethod: "TeleBirr",
    estimatedDeliveryTime: "15 mins",
    deliveryPartner: {
      name: "Dawit Haile",
      phone: "+251-91-123-4567",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop",
      rating: 4.8
    }
  },
  {
    id: "FD2945",
    date: "2024-04-22",
    restaurant: "Gusto Restaurant",
    items: 3,
    total: 480,
    status: "processing",
    restaurantImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150",
    orderItems: [
      { name: "Kitfo", quantity: 1, price: 320 },
      { name: "Tej", quantity: 1, price: 110 },
      { name: "Tibs", quantity: 1, price: 50 }
    ],
    deliveryAddress: "Sarbet, Addis Ababa",
    deliveryTime: "10:20",
    deliveryFee: 70,
    paymentMethod: "TeleBirr",
    estimatedDeliveryTime: "40 mins"
  }
];

const MyOrders = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [orders] = useState(MOCK_ORDERS);
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Icons.shoppingBag className="h-16 w-16 text-[#E5A764] mb-4" />
        <h2 className="text-xl font-bold text-[#4F2D1F] mb-2">Please Sign In</h2>
        <p className="text-[#8B572A] text-center mb-4">
          Sign in to view your order history
        </p>
        <Button 
          className="bg-[#8B572A] hover:bg-[#4F2D1F]"
          onClick={() => setLocation("/login")}
        >
          Sign In
        </Button>
      </div>
    );
  }
  
  const handleViewOrder = (orderId: string) => {
    setLocation(`/order-tracking`);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Processing</Badge>;
      case "on-way":
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">On the way</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold text-[#4F2D1F] mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-lg shadow-sm p-6">
          <Icons.shoppingBag className="h-16 w-16 text-[#E5A764] mb-4" />
          <h2 className="text-xl font-bold text-[#4F2D1F] mb-2">No Orders Yet</h2>
          <p className="text-[#8B572A] text-center mb-4">
            You haven't placed any orders yet.
          </p>
          <Button 
            className="bg-[#8B572A] hover:bg-[#4F2D1F]"
            onClick={() => setLocation("/")}
          >
            Start Ordering
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-[#4F2D1F]">Order #{order.id}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-[#8B572A]">
                  {new Date(order.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="p-4 flex items-center">
                <img 
                  src={order.restaurantImage} 
                  alt={order.restaurant}
                  className="w-16 h-16 object-cover rounded-lg mr-4" 
                />
                <div className="flex-1">
                  <p className="font-medium text-[#4F2D1F]">{order.restaurant}</p>
                  <p className="text-sm text-[#8B572A]">{order.items} items · {order.total.toLocaleString()} ETB</p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#8B572A] text-[#8B572A] hover:bg-[#E5A764]/10"
                  onClick={() => handleViewOrder(order.id)}
                >
                  {order.status === "on-way" ? "Track Order" : "View Details"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;