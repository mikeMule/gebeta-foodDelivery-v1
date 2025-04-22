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
  const { isAuthenticated, userData } = useAuth();
  const [orders] = useState(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);
  
  if (!isAuthenticated) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh] p-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
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
      </motion.div>
    );
  }
  
  const handleViewOrder = (order: typeof MOCK_ORDERS[0]) => {
    if (order.status === 'on-way' || order.status === 'processing') {
      setLocation(`/order-tracking`);
    } else {
      setSelectedOrder(order);
    }
  };
  
  const filteredOrders = orders.filter(order => {
    // Filter by tab
    if (activeTab === 'active' && (order.status === 'on-way' || order.status === 'processing')) {
      return true;
    } else if (activeTab === 'completed' && (order.status === 'delivered' || order.status === 'cancelled')) {
      return true;
    } else if (activeTab === 'all') {
      return true;
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.restaurant.toLowerCase().includes(query) ||
        order.orderItems.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
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
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#4F2D1F]">My Orders</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className="text-[#8B572A]"
              onClick={() => setLocation("/")}
            >
              <Icons.plus className="mr-1 h-4 w-4" />
              New Order
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(value) => setActiveTab(value as 'all' | 'active' | 'completed')}>
            <TabsList className="grid w-full grid-cols-3 bg-[#F8F1E9]">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#E5A764] data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-[#E5A764] data-[state=active]:text-white">Active</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-[#E5A764] data-[state=active]:text-white">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full sm:w-auto">
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B572A] h-4 w-4" />
            <Input 
              placeholder="Search orders..." 
              className="pl-10 border-[#E5A764] focus:ring-[#8B572A]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </motion.div>
      
      {filteredOrders.length === 0 ? (
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-lg shadow-sm p-6"
        >
          <Icons.shoppingBag className="h-16 w-16 text-[#E5A764] mb-4" />
          <h2 className="text-xl font-bold text-[#4F2D1F] mb-2">No Orders Found</h2>
          <p className="text-[#8B572A] text-center mb-4">
            {searchQuery ? "No orders match your search criteria." : "You haven't placed any orders yet."}
          </p>
          <Button 
            className="bg-[#8B572A] hover:bg-[#4F2D1F]"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
              setLocation("/");
            }}
          >
            {searchQuery ? "Clear Search" : "Start Ordering"}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-[#4F2D1F]">Order #{order.id}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-[#8B572A] flex items-center">
                    <Icons.calendarDays className="h-3.5 w-3.5 mr-1" />
                    {new Date(order.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-[#8B572A] flex items-center">
                    <Icons.clock className="h-3.5 w-3.5 mr-1" />
                    {order.deliveryTime}
                  </p>
                </div>
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
                  <div className="flex items-center mt-1 text-xs text-[#8B572A]">
                    <Icons.mapPin className="h-3.5 w-3.5 mr-1" />
                    {order.deliveryAddress}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {(order.status === 'on-way' || order.status === 'processing') && (
                    <Badge className="bg-[#E5A764] hover:bg-[#D99854] mb-2 self-end">
                      {order.status === 'on-way' ? `${order.estimatedDeliveryTime} away` : 'Preparing'}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    className="border-[#8B572A] text-[#8B572A] hover:bg-[#E5A764]/10"
                    onClick={() => handleViewOrder(order)}
                  >
                    {order.status === "on-way" ? "Track Order" : "View Details"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto"
          >
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h3 className="font-bold text-[#4F2D1F]">Order Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                <Icons.x />
              </Button>
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-4">
                <img 
                  src={selectedOrder.restaurantImage} 
                  alt={selectedOrder.restaurant}
                  className="w-16 h-16 object-cover rounded-lg mr-4" 
                />
                <div>
                  <h4 className="font-medium text-[#4F2D1F]">{selectedOrder.restaurant}</h4>
                  <p className="text-sm text-[#8B572A] flex items-center">
                    <Icons.calendarDays className="h-3.5 w-3.5 mr-1" />
                    {new Date(selectedOrder.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-[#4F2D1F]">Order #{selectedOrder.id}</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="flex items-center text-sm text-[#8B572A] mb-1">
                  <Icons.mapPin className="h-3.5 w-3.5 mr-1" />
                  {selectedOrder.deliveryAddress}
                </div>
                <div className="flex items-center text-sm text-[#8B572A]">
                  <Icons.clock className="h-3.5 w-3.5 mr-1" />
                  {selectedOrder.deliveryTime}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h4 className="font-medium text-[#4F2D1F] mb-2">Order Items</h4>
              <Card className="mb-4">
                <CardContent className="p-0">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className={`p-3 flex justify-between items-center ${index !== selectedOrder.orderItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div>
                        <p className="font-medium text-[#4F2D1F]">{item.name}</p>
                        <p className="text-sm text-[#8B572A]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-[#4F2D1F]">{item.price.toLocaleString()} ETB</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-[#8B572A]">Subtotal</span>
                  <span className="text-[#4F2D1F]">
                    {selectedOrder.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B572A]">Delivery Fee</span>
                  <span className="text-[#4F2D1F]">{selectedOrder.deliveryFee.toLocaleString()} ETB</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span className="text-[#4F2D1F]">Total</span>
                  <span className="text-[#4F2D1F]">{selectedOrder.total.toLocaleString()} ETB</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex items-center text-[#4F2D1F] mb-1">
                  <Icons.creditCard className="h-4 w-4 mr-2" />
                  <span className="font-medium">Payment Method</span>
                </div>
                <p className="text-[#8B572A] pl-6">{selectedOrder.paymentMethod}</p>
              </div>
              
              {selectedOrder.status === 'delivered' && (
                <Button className="w-full bg-[#8B572A] hover:bg-[#4F2D1F]">
                  Reorder
                </Button>
              )}
              
              {selectedOrder.status === 'cancelled' && (
                <p className="text-sm text-center text-[#8B572A] mt-2">
                  This order was cancelled. Please contact customer support for more information.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;