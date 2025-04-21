import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import RestaurantCard from "@/components/RestaurantCard";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { type Restaurant } from "@shared/schema";
import { Icons } from "@/lib/icons";
import { containerVariants, itemVariants } from "@/lib/animation";

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
    <div className="min-h-screen flex flex-col pb-16 bg-[#FFF9F2]">
      <header className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#8B572A] flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="30" fill="#E5A764" />
                  <circle cx="40" cy="45" r="5" fill="#C73030" />
                  <circle cx="60" cy="45" r="4" fill="#4CAF50" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[#4F2D1F]">Gebeta</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-[#8B572A]">Delivering to</p>
              <div className="flex items-center">
                <span className="font-medium text-[#4F2D1F] text-sm">{userData?.location || "Bole, Addis Ababa"}</span>
                <Icons.chevronDown className="ml-1 text-[#8B572A] w-4 h-4" />
              </div>
            </div>
            <Button variant="ghost" className="w-9 h-9 p-0 rounded-full bg-[#E5A764]/10 text-[#8B572A]">
              <Icons.user />
            </Button>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-2 flex items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icons.search className="text-[#8B572A]" />
            </div>
            <input 
              type="text"
              placeholder="Search for restaurants or dishes"
              className="w-full bg-[#E5A764]/10 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B572A]"
            />
          </div>
        </div>
        
        <div className="container mx-auto px-4 pb-3 overflow-x-auto flex space-x-2 categories-scroll">
          <Button 
            variant={selectedCategory === "All" ? "default" : "ghost"}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full ${
              selectedCategory === "All" ? "bg-[#8B572A] text-white" : "bg-[#E5A764]/10 text-[#4F2D1F]"
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
                selectedCategory === category ? "bg-[#8B572A] text-white" : "bg-[#E5A764]/10 text-[#4F2D1F]"
              } text-sm`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </header>
      
      <motion.div 
        className="container mx-auto px-4 py-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="rounded-xl overflow-hidden mb-6 shadow-sm"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-[#8B572A] to-[#4F2D1F] p-5 flex">
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-white font-dm-sans">Try Authentic Ethiopian</h3>
              <p className="text-sm text-white/90 mb-3">Use code: <span className="font-medium bg-white/20 px-2 py-0.5 rounded">GEBETA25</span></p>
              <Button className="text-sm bg-white text-[#4F2D1F] hover:bg-white/90 font-medium py-1.5 px-4 rounded-lg">
                Order Now
              </Button>
            </div>
            <div className="w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1567888033478-593a83beca49?w=300&auto=format&fit=crop" 
                alt="Ethiopian Doro Wat promo" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-xl font-bold mb-4 font-dm-sans text-[#4F2D1F]"
          variants={itemVariants}
        >
          Ethiopian Restaurants Near You
        </motion.h2>
        
        <div className="grid grid-cols-1 gap-4 mb-8">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B572A]"></div>
            </div>
          ) : (
            filteredRestaurants?.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                variants={itemVariants}
                custom={index}
                onClick={() => handleRestaurantClick(restaurant.id)}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))
          )}
        </div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-5 mb-8 border border-[#E5A764]/20"
          variants={itemVariants}
        >
          <h2 className="text-lg font-bold mb-3 font-dm-sans text-[#4F2D1F] flex items-center">
            <Icons.mapPin className="mr-2 text-[#8B572A]" />
            Find on Map
          </h2>
          <div className="bg-[#E5A764]/10 rounded-lg h-48 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                  backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=9.0092,38.7645&zoom=13&size=600x300&maptype=roadmap')",
                  backgroundSize: "cover",
                  backgroundPosition: "center" 
                }}>
            </div>
            <div className="text-center relative z-10 bg-white/80 p-4 rounded-lg">
              <Icons.map className="mx-auto text-4xl text-[#8B572A] mb-2" />
              <p className="text-[#4F2D1F] font-medium">Find Nearby Ethiopian Restaurants</p>
              <p className="text-xs text-[#8B572A]">Showing restaurants within 3km of your location</p>
              <Button className="mt-3 bg-[#8B572A] hover:bg-[#4F2D1F] text-white">
                Open Map
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <NavBar />
    </div>
  );
};

export default Home;
