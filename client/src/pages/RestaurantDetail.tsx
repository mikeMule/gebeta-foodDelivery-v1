import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FoodItem from "@/components/FoodItem";
import NavBar from "@/components/NavBar";
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
    ? [...new Set(foodItems.map(item => item.category))]
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
          
          <p className="text-neutral-600 mb-4">{restaurant?.categories}</p>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center text-sm text-neutral-600">
              <Icons.mapPin className="mr-1 text-primary" />
              <span>{restaurant?.distance.toFixed(1)} km away</span>
            </div>
            <div className="flex items-center text-sm text-neutral-600">
              <Icons.clock className="mr-1 text-primary" />
              <span>{restaurant?.deliveryTime}</span>
            </div>
            <div className="flex items-center text-sm text-neutral-600">
              <Icons.bike className="mr-1 text-primary" />
              <span>
                {restaurant?.deliveryFee === 0 
                  ? "Free delivery" 
                  : `Birr ${restaurant?.deliveryFee}`}
              </span>
            </div>
          </div>
          
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
              <p className="text-neutral-600">
                Restaurant information coming soon...
              </p>
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
