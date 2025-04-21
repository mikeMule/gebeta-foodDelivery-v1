import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FoodItem from "@/components/FoodItem";
import NavBar from "@/components/NavBar";
import DeliveryMap from "@/components/DeliveryMap";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { type Restaurant, type FoodItem as FoodItemType } from "@shared/schema";

const RestaurantDetail = () => {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { cartItems, totalAmount } = useCart();
  const restaurantId = parseInt(params.id);
  
  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${restaurantId}`],
  });
  
  const { data: foodItems } = useQuery<FoodItemType[]>({
    queryKey: [`/api/restaurants/${restaurantId}/food-items`],
  });

  const categories = foodItems 
    ? Array.from(new Set(foodItems.map(item => item.category)))
    : [];

  const handleBackClick = () => {
    setLocation("/home");
  };
  
  const handleViewCart = () => {
    setLocation("/cart");
  };

  // Group food items by category
  const foodItemsByCategory: Record<string, FoodItemType[]> = {};
  foodItems?.forEach(item => {
    if (!foodItemsByCategory[item.category]) {
      foodItemsByCategory[item.category] = [];
    }
    foodItemsByCategory[item.category].push(item);
  });

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <div className="relative h-64">
        <img 
          src={restaurant?.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop"}
          alt="Restaurant cover" 
          className="w-full h-full object-cover"
        />
        <Button 
          variant="ghost"
          className="absolute top-4 left-4 w-10 h-10 p-0 flex items-center justify-center bg-white rounded-full shadow-md"
          onClick={handleBackClick}
        >
          <Icons.chevronLeft className="text-lg" />
        </Button>
        <Button 
          variant="ghost"
          className="absolute top-4 right-4 w-10 h-10 p-0 flex items-center justify-center bg-white rounded-full shadow-md"
        >
          <Icons.heart className="text-lg" />
        </Button>
      </div>
      
      <div className="bg-white rounded-t-3xl -mt-8 relative z-10 flex-grow">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold font-dm-sans">{restaurant?.name}</h1>
            <div className="flex items-center bg-green-50 px-2 py-0.5 rounded">
              <span className="text-sm font-medium text-green-700">{restaurant?.rating.toFixed(1)}</span>
              <Icons.star className="text-sm text-yellow-500 ml-1" />
            </div>
          </div>
          
          <p className="text-neutral-600 mb-2">{restaurant?.categories}</p>
          
          {/* Opening status banner */}
          {restaurant?.openingHours && restaurant?.closingHours && (
            <div className={`mb-3 text-sm rounded-lg p-2 ${
              new Date().getHours() >= parseInt(restaurant.openingHours.split(':')[0]) && 
              new Date().getHours() < parseInt(restaurant.closingHours.split(':')[0])
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            }`}>
              <div className="flex items-center">
                <Icons.clock className="mr-2 h-4 w-4" />
                <div>
                  <span className="font-medium">
                    {new Date().getHours() >= parseInt(restaurant.openingHours.split(':')[0]) && 
                    new Date().getHours() < parseInt(restaurant.closingHours.split(':')[0])
                      ? "Open Now" 
                      : "Closed"}
                  </span>
                  <span className="ml-1">· Hours: {restaurant.openingHours} - {restaurant.closingHours}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Contact information */}
          <div className="border-t border-b border-neutral-100 py-3 mb-4">
            <div className="flex items-center mb-2">
              <Icons.mapPin className="mr-2 h-4 w-4 text-[#8B572A]" />
              <span className="text-sm text-neutral-600">
                {restaurant?.address || "Addis Ababa, Ethiopia"}
              </span>
            </div>
            <div className="flex items-center">
              <Icons.phone className="mr-2 h-4 w-4 text-[#8B572A]" />
              <span className="text-sm text-neutral-600">
                {restaurant?.phone || "+251-11-111-1111"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center text-sm text-neutral-600">
              <Icons.mapPin className="mr-1 text-[#8B572A]" />
              <span>{restaurant?.distance.toFixed(1)} km away</span>
            </div>
            <div className="flex items-center text-sm text-neutral-600">
              <Icons.clock className="mr-1 text-[#8B572A]" />
              <span>{restaurant?.deliveryTime}</span>
            </div>
            <div className="flex items-center text-sm text-neutral-600">
              <Icons.bike className="mr-1 text-[#8B572A]" />
              <span>
                {restaurant?.deliveryFee === 0 
                  ? "Free delivery" 
                  : `Birr ${restaurant?.deliveryFee}`}
              </span>
            </div>
          </div>
          
          {restaurant && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Location & Delivery</h3>
              <DeliveryMap 
                height="140px"
                restaurantLocation={{ 
                  lat: restaurant.latitude, 
                  lng: restaurant.longitude,
                  name: restaurant.name 
                }}
              />
            </div>
          )}
          
          <Tabs defaultValue="menu" className="mb-4">
            <TabsList className="border-b border-neutral-200 w-full justify-start space-x-6 bg-transparent p-0">
              <TabsTrigger 
                value="menu" 
                className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary pb-2 px-0"
              >
                Menu
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary pb-2 px-0"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger 
                value="info" 
                className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary pb-2 px-0"
              >
                Info
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="pt-4">
              {categories.map((category) => (
                <div key={category} className="mb-6">
                  <h2 className="text-lg font-bold mb-4 font-dm-sans">{category}</h2>
                  
                  <div className="space-y-4">
                    {foodItemsByCategory[category]?.map((item) => (
                      <FoodItem key={item.id} foodItem={item} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-4">
              <p className="text-neutral-600">
                Customer reviews coming soon...
              </p>
            </TabsContent>
            
            <TabsContent value="info" className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold mb-2">Opening Hours</h3>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Monday - Friday</span>
                      <span className="text-sm font-medium">{restaurant?.openingHours || '09:00'} - {restaurant?.closingHours || '21:00'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Saturday</span>
                      <span className="text-sm font-medium">{restaurant?.openingHours || '09:00'} - {restaurant?.closingHours || '21:00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sunday</span>
                      <span className="text-sm font-medium">{parseInt(restaurant?.openingHours?.split(':')[0] || '9') + 1}:00 - {restaurant?.closingHours || '21:00'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold mb-2">Restaurant Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Icons.mapPin className="text-[#8B572A] mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-neutral-600">{restaurant?.address || 'Addis Ababa, Ethiopia'}</p>
                        <p className="text-xs text-[#8B572A] mt-1">Lat: {restaurant?.latitude?.toFixed(6)}, Lng: {restaurant?.longitude?.toFixed(6)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Icons.phone className="text-[#8B572A] mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-sm text-neutral-600">{restaurant?.phone || '+251-11-111-1111'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Icons.info className="text-[#8B572A] mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">About</p>
                        <p className="text-sm text-neutral-600">{restaurant?.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-neutral-600">{cartItems.length} items in cart</p>
            <p className="font-bold text-lg">Birr {totalAmount}</p>
          </div>
          <Button 
            className="bg-primary text-white font-medium py-2.5 px-6 rounded-lg flex items-center"
            onClick={handleViewCart}
          >
            <Icons.shoppingBag className="mr-2" />
            <span>View Cart</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
