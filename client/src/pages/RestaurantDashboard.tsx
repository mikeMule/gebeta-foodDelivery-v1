import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icons } from "@/lib/icons";
import { fadeIn, slideUp } from "@/lib/animation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Mock data types
interface FoodItemType {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
}

interface OrderItemType {
  id: number;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface DeliveryPartnerType {
  id: number;
  name: string;
  rating: number;
  vehicleType: string;
  distance: number; // in km
  currentOrders: number;
  phoneNumber: string;
  photo: string;
}

interface OrderType {
  id: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  orderItems: OrderItemType[];
  status: "new" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";
  totalAmount: number;
  deliveryFee: number;
  serviceFee: number;
  deliveryAddress: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  deliveryPartnerId?: number;
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed";
  instructions?: string;
}

// Mock data
const MOCK_ORDERS: OrderType[] = [
  {
    id: "ORD-1001",
    customerId: 1,
    customerName: "Abebe Kebede",
    customerPhone: "0912345678",
    orderItems: [
      { id: 1, name: "Doro Wat", quantity: 2, price: 180, notes: "Extra spicy" },
      { id: 2, name: "Injera", quantity: 4, price: 15 }
    ],
    status: "new",
    totalAmount: 420,
    deliveryFee: 50,
    serviceFee: 30,
    deliveryAddress: "Bole, Addis Ababa",
    createdAt: "2025-04-22T09:30:00",
    paymentMethod: "TeleBirr",
    paymentStatus: "completed",
  },
  {
    id: "ORD-1002",
    customerId: 2,
    customerName: "Sara Mohammed",
    customerPhone: "0911223344",
    orderItems: [
      { id: 3, name: "Tibs", quantity: 1, price: 250 },
      { id: 4, name: "Shiro", quantity: 1, price: 120 }
    ],
    status: "preparing",
    totalAmount: 420,
    deliveryFee: 50,
    serviceFee: 30,
    deliveryAddress: "Mexico, Addis Ababa",
    createdAt: "2025-04-22T09:15:00",
    estimatedDeliveryTime: "30-45 minutes",
    paymentMethod: "Cash",
    paymentStatus: "pending",
    instructions: "Please include extra sauce"
  },
  {
    id: "ORD-1003",
    customerId: 3,
    customerName: "Daniel Tesfaye",
    customerPhone: "0987654321",
    orderItems: [
      { id: 5, name: "Kitfo", quantity: 1, price: 320 },
      { id: 6, name: "Tej", quantity: 1, price: 80 }
    ],
    status: "ready_for_pickup",
    totalAmount: 450,
    deliveryFee: 50,
    serviceFee: 30,
    deliveryAddress: "Sarbet, Addis Ababa",
    createdAt: "2025-04-22T08:45:00",
    estimatedDeliveryTime: "15-30 minutes",
    paymentMethod: "TeleBirr",
    paymentStatus: "completed",
  }
];

const MOCK_DELIVERY_PARTNERS: DeliveryPartnerType[] = [
  {
    id: 1,
    name: "Dawit Haile",
    rating: 4.8,
    vehicleType: "Motorcycle",
    distance: 1.2,
    currentOrders: 0,
    phoneNumber: "+251-91-123-4567",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop"
  },
  {
    id: 2,
    name: "Kidist Abebe",
    rating: 4.5,
    vehicleType: "Bicycle",
    distance: 0.8,
    currentOrders: 1,
    phoneNumber: "+251-91-987-6543",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&fit=crop"
  },
  {
    id: 3,
    name: "Solomon Girma",
    rating: 4.9,
    vehicleType: "Motorcycle",
    distance: 2.4,
    currentOrders: 0,
    phoneNumber: "+251-91-456-7890",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&fit=crop"
  }
];

const MOCK_MENU_ITEMS: FoodItemType[] = [
  {
    id: 1,
    name: "Doro Wat",
    price: 180,
    description: "Ethiopian spicy chicken stew, served with injera",
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1583295125721-766a0088cd3f?w=300"
  },
  {
    id: 2,
    name: "Tibs",
    price: 250,
    description: "Sautéed meat and vegetables, flavored with Ethiopian spices",
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1628516794933-0a82ecefcaff?w=300"
  },
  {
    id: 3,
    name: "Kitfo",
    price: 320,
    description: "Ethiopian style steak tartare served with injera",
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300"
  },
  {
    id: 4,
    name: "Shiro",
    price: 120,
    description: "Spiced chickpea stew, vegan friendly",
    category: "Sides",
    imageUrl: "https://images.unsplash.com/photo-1531487907503-47fb3ce703b5?w=300"
  },
  {
    id: 5,
    name: "Injera",
    price: 15,
    description: "Traditional Ethiopian sourdough flatbread",
    category: "Bread",
    imageUrl: "https://images.unsplash.com/photo-1580467559977-a7e899a2a0dc?w=300"
  },
  {
    id: 6,
    name: "Tej",
    price: 80,
    description: "Ethiopian honey wine",
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=300"
  }
];

const RestaurantDashboard = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, userData, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for orders management
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [assignDeliveryDialogOpen, setAssignDeliveryDialogOpen] = useState(false);
  const [selectedDeliveryPartnerId, setSelectedDeliveryPartnerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Get the restaurant ID (in a real app, this would come from the auth context)
  const restaurantId = 1; // Default to restaurant ID 1 for demo
  
  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || userData?.userType !== "restaurant_owner") {
      setLocation("/restaurant-login");
    }
  }, [isAuthenticated, userData, setLocation]);

  // Fetch restaurant orders
  const { 
    data: ordersData = [], 
    isLoading: ordersLoading,
    error: ordersError 
  } = useQuery({
    queryKey: ['/api/restaurant', restaurantId, 'orders', orderFilter !== 'all' ? orderFilter : undefined],
    queryFn: async () => {
      const url = `/api/restaurant/${restaurantId}/orders${orderFilter !== 'all' ? `?status=${orderFilter}` : ''}`;
      const response = await apiRequest('GET', url);
      const data = await response.json();
      return data;
    },
    enabled: isAuthenticated && userData?.userType === "restaurant_owner"
  });

  // Fetch restaurant menu items
  const { 
    data: menuItems = [], 
    isLoading: menuLoading 
  } = useQuery({
    queryKey: ['/api/restaurants', restaurantId, 'food-items'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/restaurants/${restaurantId}/food-items`);
      return await response.json();
    },
    enabled: isAuthenticated && userData?.userType === "restaurant_owner"
  });

  // Fetch restaurant statistics
  const { 
    data: statsData, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['/api/restaurant', restaurantId, 'statistics'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/restaurant/${restaurantId}/statistics`);
      return await response.json();
    },
    enabled: isAuthenticated && userData?.userType === "restaurant_owner"
  });

  // Mutation for updating order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurant', restaurantId, 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/restaurant', restaurantId, 'statistics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation for assigning delivery partner
  const assignDeliveryMutation = useMutation({
    mutationFn: async ({ orderId, deliveryPartnerId }: { orderId: number, deliveryPartnerId: number }) => {
      const response = await apiRequest('POST', `/api/orders/${orderId}/assign-delivery`, { deliveryPartnerId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurant', restaurantId, 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/restaurant', restaurantId, 'statistics'] });
      setAssignDeliveryDialogOpen(false);
      setSelectedDeliveryPartnerId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error assigning delivery partner",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Fetch delivery partners for a specific order
  const { 
    data: deliveryPartners = [], 
    isLoading: deliveryPartnersLoading,
    error: deliveryPartnersError
  } = useQuery({
    queryKey: ['/api/orders', selectedOrderId, 'delivery-partners'],
    queryFn: async () => {
      if (!selectedOrderId) return [];
      const response = await apiRequest('GET', `/api/orders/${selectedOrderId}/delivery-partners`);
      return await response.json();
    },
    enabled: assignDeliveryDialogOpen && !!selectedOrderId
  });

  if (!isAuthenticated || userData?.userType !== "restaurant_owner") {
    return null; // Don't render anything if not authenticated
  }

  const orders = ordersData as OrderType[];
  const selectedOrder = orders.find(order => order.id === selectedOrderId);
  
  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // Text search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesOrder = order.id.toLowerCase().includes(query);
        const matchesCustomer = order.customerName.toLowerCase().includes(query);
        const matchesItems = order.orderItems.some(item => 
          item.name.toLowerCase().includes(query)
        );
        return matchesOrder || matchesCustomer || matchesItems;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by created time - oldest first (first come, first served)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const handleLogout = () => {
    logout();
    setLocation("/restaurant-login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderType["status"]) => {
    updateOrderStatusMutation.mutate(
      { 
        orderId: parseInt(orderId), 
        status: newStatus 
      },
      {
        onSuccess: () => {
          toast({
            title: "Order Updated",
            description: `Order #${orderId} status changed to ${newStatus.replace("_", " ")}.`,
          });
        }
      }
    );
  };

  const assignDeliveryPartner = (orderId: string, deliveryPartnerId: number) => {
    assignDeliveryMutation.mutate(
      { 
        orderId: parseInt(orderId), 
        deliveryPartnerId 
      },
      {
        onSuccess: (data) => {
          const partnerName = deliveryPartners.find(p => p.id === deliveryPartnerId)?.user?.fullName || "delivery partner";
          toast({
            title: "Delivery Assigned",
            description: `Order #${orderId} assigned to ${partnerName}.`,
          });
        }
      }
    );
  };

  const getStatusBadge = (status: OrderType["status"]) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">New</Badge>;
      case "preparing":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Preparing</Badge>;
      case "ready_for_pickup":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Ready for Pickup</Badge>;
      case "out_for_delivery":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Out for Delivery</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getNextStatus = (currentStatus: OrderType["status"]): { status: OrderType["status"]; label: string } | null => {
    switch (currentStatus) {
      case "new":
        return { status: "preparing", label: "Start Preparing" };
      case "preparing":
        return { status: "ready_for_pickup", label: "Mark as Ready" };
      case "ready_for_pickup":
        return { status: "out_for_delivery", label: "Assign Delivery" };
      default:
        return null;
    }
  };

  const getOrderActionButton = (order: OrderType) => {
    const nextStatus = getNextStatus(order.status);
    
    if (!nextStatus) return null;
    
    if (nextStatus.status === "out_for_delivery") {
      return (
        <Button 
          onClick={() => {
            setSelectedOrderId(order.id);
            setAssignDeliveryDialogOpen(true);
          }}
          className="w-full bg-[#8B572A] hover:bg-[#4F2D1F] mt-4"
        >
          <Icons.bike className="mr-2 h-4 w-4" />
          {nextStatus.label}
        </Button>
      );
    }
    
    return (
      <Button 
        onClick={() => updateOrderStatus(order.id, nextStatus.status)}
        className="w-full bg-[#8B572A] hover:bg-[#4F2D1F] mt-4"
      >
        {nextStatus.status === "preparing" && <Icons.chefHat className="mr-2 h-4 w-4" />}
        {nextStatus.status === "ready_for_pickup" && <Icons.package className="mr-2 h-4 w-4" />}
        {nextStatus.label}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Icons.store className="h-8 w-8 text-[#8B572A]" />
            <div>
              <h1 className="text-xl font-bold text-[#4F2D1F]">Restaurant Dashboard</h1>
              <p className="text-sm text-[#8B572A]">Welcome, {userData?.fullName || "Restaurant Owner"}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-[#8B572A]">
            <Icons.logOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container py-6">
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#E5A764] data-[state=active]:text-white">
              <Icons.clipboardList className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-[#E5A764] data-[state=active]:text-white">
              <Icons.menu className="mr-2 h-4 w-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-[#E5A764] data-[state=active]:text-white">
              <Icons.truck className="mr-2 h-4 w-4" />
              Delivery Partners
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#E5A764] data-[state=active]:text-white">
              <Icons.settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#4F2D1F]">Manage Orders</h2>
              <div className="flex space-x-2">
                <Select value={orderFilter} onValueChange={setOrderFilter}>
                  <SelectTrigger className="w-[180px] border-[#E5A764]">
                    <SelectValue placeholder="Filter orders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="new">New Orders</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B572A] h-4 w-4" />
                  <Input 
                    placeholder="Search orders..." 
                    className="pl-10 border-[#E5A764] focus:ring-[#8B572A]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {filteredOrders.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icons.clipboardList className="h-16 w-16 text-[#E5A764] mb-4" />
                  <h3 className="text-lg font-semibold text-[#4F2D1F]">No Orders Found</h3>
                  <p className="text-[#8B572A] text-center">
                    {orderFilter === "all" 
                      ? "There are no orders at the moment." 
                      : `There are no ${orderFilter} orders at the moment.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-white h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-1">
                          <CardTitle className="text-lg text-[#4F2D1F]">Order #{order.id}</CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <CardDescription className="flex justify-between items-center">
                          <span>
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <Badge variant="outline" className="font-normal">
                            {order.paymentMethod} • {order.paymentStatus === "completed" ? "Paid" : "Pending"}
                          </Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-[#4F2D1F] flex items-center">
                              <Icons.user className="h-3.5 w-3.5 mr-1" />
                              Customer Information
                            </h4>
                            <p className="text-sm text-[#8B572A]">{order.customerName}</p>
                            <p className="text-sm text-[#8B572A]">{order.customerPhone}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-[#4F2D1F] flex items-center">
                              <Icons.mapPin className="h-3.5 w-3.5 mr-1" />
                              Delivery Address
                            </h4>
                            <p className="text-sm text-[#8B572A]">{order.deliveryAddress}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-[#4F2D1F] flex items-center">
                              <Icons.shoppingBag className="h-3.5 w-3.5 mr-1" />
                              Order Items
                            </h4>
                            <ul className="text-sm text-[#8B572A] space-y-1">
                              {order.orderItems.map((item, i) => (
                                <li key={i} className="flex justify-between">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>{item.price.toLocaleString()} ETB</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {order.instructions && (
                            <div>
                              <h4 className="text-sm font-semibold text-[#4F2D1F] flex items-center">
                                <Icons.info className="h-3.5 w-3.5 mr-1" />
                                Instructions
                              </h4>
                              <p className="text-sm text-[#8B572A] italic">"{order.instructions}"</p>
                            </div>
                          )}
                          
                          <div className="bg-[#F9F5F0] p-3 rounded-md">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#8B572A]">Subtotal:</span>
                              <span className="text-[#4F2D1F]">
                                {(order.totalAmount - order.deliveryFee - order.serviceFee).toLocaleString()} ETB
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#8B572A]">Delivery Fee:</span>
                              <span className="text-[#4F2D1F]">{order.deliveryFee.toLocaleString()} ETB</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#8B572A]">Service Fee:</span>
                              <span className="text-[#4F2D1F]">{order.serviceFee.toLocaleString()} ETB</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                              <span className="text-[#4F2D1F]">Total:</span>
                              <span className="text-[#4F2D1F]">{order.totalAmount.toLocaleString()} ETB</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-4 pt-0">
                        {getOrderActionButton(order)}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#4F2D1F]">Manage Menu</h2>
              <Button className="bg-[#8B572A] hover:bg-[#4F2D1F]">
                <Icons.plus className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white h-full flex flex-col overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-48 w-full object-cover"
                    />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-[#4F2D1F]">{item.name}</CardTitle>
                        <Badge variant="outline" className="font-normal text-[#8B572A]">
                          {item.category}
                        </Badge>
                      </div>
                      <CardDescription>
                        {item.price.toLocaleString()} ETB
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-[#8B572A]">{item.description}</p>
                    </CardContent>
                    <div className="p-4 pt-0 flex space-x-2">
                      <Button variant="outline" className="flex-1 border-[#8B572A] text-[#8B572A]">
                        <Icons.pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" className="flex-1 border-red-300 text-red-500 hover:bg-red-50">
                        <Icons.trash className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Delivery Partners Tab */}
          <TabsContent value="delivery" className="space-y-4">
            <h2 className="text-xl font-bold text-[#4F2D1F]">Delivery Partners</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_DELIVERY_PARTNERS.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white h-full flex flex-col">
                    <CardHeader className="pb-2 flex flex-row items-center space-x-4">
                      <img
                        src={partner.photo}
                        alt={partner.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div>
                        <CardTitle className="text-lg text-[#4F2D1F]">{partner.name}</CardTitle>
                        <div className="flex items-center">
                          <Icons.star className="h-4 w-4 text-yellow-500 mr-1" />
                          <CardDescription>{partner.rating} rating</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8B572A]">Vehicle:</span>
                        <span className="text-[#4F2D1F]">{partner.vehicleType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8B572A]">Distance:</span>
                        <span className="text-[#4F2D1F]">{partner.distance} km away</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8B572A]">Current Orders:</span>
                        <span className="text-[#4F2D1F]">{partner.currentOrders}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8B572A]">Phone:</span>
                        <span className="text-[#4F2D1F]">{partner.phoneNumber}</span>
                      </div>
                      <div className="pt-2">
                        <Badge variant="outline" className={partner.currentOrders === 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                          {partner.currentOrders === 0 ? "Available" : "Busy"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-[#4F2D1F]">Restaurant Information</CardTitle>
                <CardDescription>
                  Update your restaurant details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-[#4F2D1F]">Restaurant Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-[#8B572A]">Opening Time</label>
                      <Input defaultValue="09:00" type="time" className="border-[#E5A764]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-[#8B572A]">Closing Time</label>
                      <Input defaultValue="21:00" type="time" className="border-[#E5A764]" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-[#4F2D1F]">Commission Settings</h3>
                  <div className="p-4 bg-[#F9F5F0] rounded-md">
                    <p className="text-sm text-[#8B572A] mb-2">
                      Your current commission rate is <span className="font-semibold">15%</span> of the order subtotal.
                    </p>
                    <p className="text-sm text-[#8B572A]">
                      Commission is automatically calculated and deducted from each order.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="bg-[#8B572A] hover:bg-[#4F2D1F]">
                    <Icons.save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Assign Delivery Partner Dialog */}
      <Dialog open={assignDeliveryDialogOpen} onOpenChange={setAssignDeliveryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a delivery partner for order #{selectedOrderId}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4">
              {MOCK_DELIVERY_PARTNERS.map(partner => (
                <div 
                  key={partner.id}
                  className={`p-4 border rounded-md flex items-center space-x-3 cursor-pointer transition-colors
                    ${selectedDeliveryPartnerId === partner.id 
                      ? 'border-[#8B572A] bg-[#F9F5F0]' 
                      : 'border-gray-200 hover:bg-[#F9F5F0]/50'}`}
                  onClick={() => setSelectedDeliveryPartnerId(partner.id)}
                >
                  <div className="relative">
                    <img 
                      src={partner.photo}
                      alt={partner.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    {selectedDeliveryPartnerId === partner.id && (
                      <div className="absolute -bottom-1 -right-1 bg-[#8B572A] text-white rounded-full p-0.5">
                        <Icons.check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#4F2D1F]">{partner.name}</h4>
                    <div className="flex items-center text-sm text-[#8B572A]">
                      <Icons.star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                      {partner.rating} • {partner.vehicleType} • {partner.distance} km away
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={partner.currentOrders === 0 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {partner.currentOrders === 0 ? "Available" : `${partner.currentOrders} order(s)`}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAssignDeliveryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#8B572A] hover:bg-[#4F2D1F]"
              disabled={!selectedDeliveryPartnerId}
              onClick={() => {
                if (selectedDeliveryPartnerId && selectedOrderId) {
                  assignDeliveryPartner(selectedOrderId, selectedDeliveryPartnerId);
                }
              }}
            >
              <Icons.bike className="mr-2 h-4 w-4" />
              Assign Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantDashboard;