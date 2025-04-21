import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import RestaurantCard from "@/components/RestaurantCard";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { type Restaurant } from "@shared/schema";
import { Icons } from "@/lib/icons";

const Home = () => {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });

  const handleRestaurantClick = (id: number) => {
    setLocation(`/restaurant/${id}`);
  };

  const filteredRestaurants = selectedCategory === "All" 
    ? restaurants 
    : restaurants?.filter(restaurant => 
        restaurant.categories.includes(selectedCategory)
      );

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-600">Delivering to</p>
            <div className="flex items-center">
              <span className="font-medium">{userData?.location || "Bole, Addis Ababa"}</span>
              <Icons.chevronDown className="ml-1 text-primary" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="w-9 h-9 p-0 rounded-full bg-neutral-100">
              <Icons.search className="text-neutral-800" />
            </Button>
            <Button variant="ghost" className="w-9 h-9 p-0 rounded-full bg-neutral-100">
              <Icons.user className="text-neutral-800" />
            </Button>
          </div>
        </div>
        
        <div className="px-4 pb-3 overflow-x-auto flex space-x-2 categories-scroll">
          <Button 
            variant={selectedCategory === "All" ? "default" : "ghost"}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full ${
              selectedCategory === "All" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-800"
            } text-sm`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </Button>
          
          {categories?.map((category) => (
            <Button 
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full ${
                selectedCategory === category ? "bg-primary text-white" : "bg-neutral-100 text-neutral-800"
              } text-sm`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </header>
      
      <div className="px-4 py-4">
        <motion.div 
          className="rounded-lg overflow-hidden mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-secondary/10 p-4 rounded-lg flex">
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-neutral-800 font-dm-sans">50% off your first order</h3>
              <p className="text-sm text-neutral-600 mb-3">Use code: <span className="font-medium">WELCOME50</span></p>
              <Button className="text-sm bg-secondary text-white font-medium py-1.5 px-4 rounded-lg">
                Order Now
              </Button>
            </div>
            <div className="w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=300&auto=format&fit=crop" 
                alt="Food delivery promo" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-xl font-bold mb-4 font-dm-sans"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Nearest Restaurants
        </motion.h2>
        
        <div className="grid grid-cols-1 gap-4 mb-8">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            filteredRestaurants?.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => handleRestaurantClick(restaurant.id)}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))
          )}
        </div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-bold mb-3 font-dm-sans">Nearby Restaurants</h2>
          <div className="bg-neutral-100 rounded-lg h-48 flex items-center justify-center">
            <div className="text-center">
              <Icons.map className="mx-auto text-4xl text-neutral-400 mb-2" />
              <p className="text-neutral-600">Google Maps Integration</p>
              <p className="text-xs text-neutral-500">Showing restaurants within 3km</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <NavBar />
    </div>
  );
};

export default Home;
