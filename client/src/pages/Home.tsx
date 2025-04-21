import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import RestaurantCard from "@/components/RestaurantCard";
import NavBar from "@/components/NavBar";
import DeliveryMap from "@/components/DeliveryMap";
import { Button } from "@/components/ui/button";
import { type Restaurant, type FoodItem } from "@shared/schema";
import { Icons } from "@/lib/icons";
import { containerVariants, itemVariants } from "@/lib/animation";
import { Navigation, MapPin, Search } from "lucide-react";

const Home = () => {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: 8.9806, 
    lng: 38.7578, 
    name: userData?.location || "Bole, Addis Ababa"
  });
  const [showLocationBanner, setShowLocationBanner] = useState<boolean>(true);
  // Extended FoodItem type to include restaurant information
  type FoodItemWithRestaurant = FoodItem & {
    restaurantName?: string;
  };
  
  const [foodItems, setFoodItems] = useState<FoodItemWithRestaurant[]>([]);
  const [showFoodItemsInSearch, setShowFoodItemsInSearch] = useState<boolean>(false);
  
  const { data: restaurants, isLoading, refetch: refetchRestaurants } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants', userLocation.lat, userLocation.lng],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants?lat=${userLocation.lat}&lng=${userLocation.lng}`);
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      return response.json();
    },
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });
  
  const handleUserLocationChange = useCallback((location: { lat: number; lng: number; name: string }) => {
    setUserLocation(location);
  }, []);

  const handleRestaurantClick = (id: number) => {
    setLocation(`/restaurant/${id}`);
  };

  // Fetch all food items from all restaurants
  useEffect(() => {
    if (restaurants && restaurants.length > 0) {
      const fetchFoodItems = async () => {
        const allFoodItems: FoodItem[] = [];
        
        for (const restaurant of restaurants) {
          try {
            const response = await fetch(`/api/restaurants/${restaurant.id}/food-items`);
            if (response.ok) {
              const items = await response.json();
              // Add restaurant information to each food item for better display
              const itemsWithRestaurant = items.map((item: FoodItem) => ({
                ...item,
                restaurantName: restaurant.name,
                restaurantId: restaurant.id
              }));
              allFoodItems.push(...itemsWithRestaurant);
            }
          } catch (error) {
            console.error(`Error fetching food items for restaurant ${restaurant.id}:`, error);
          }
        }
        
        setFoodItems(allFoodItems);
      };
      
      fetchFoodItems();
    }
  }, [restaurants]);

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowFoodItemsInSearch(query.length > 0);
  };
  
  // Filter restaurants based on category and search query
  const filteredRestaurants = restaurants
    ?.filter(restaurant => {
      // First filter by category
      const categoryMatch = selectedCategory === "All" || restaurant.categories.includes(selectedCategory);
      
      // Then filter by search query if there is one
      const searchMatch = !searchQuery || 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
        
      return categoryMatch && searchMatch;
    });

  const requestLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "Detecting..."
        };
        handleUserLocationChange(newLocation);
        setShowLocationBanner(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Please allow location access to improve delivery accuracy");
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 bg-[#FFF9F2]">
      {showLocationBanner && (
        <div className="bg-[#8B572A] text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">Allow location access for accurate delivery</span>
          </div>
          <div className="flex gap-2">
            <button 
              className="text-xs bg-white text-[#8B572A] px-2 py-1 rounded-full"
              onClick={requestLocationPermission}
            >
              Allow
            </button>
            <button 
              className="text-xs border border-white/30 px-2 py-1 rounded-full"
              onClick={() => setShowLocationBanner(false)}
            >
              Later
            </button>
          </div>
        </div>
      )}
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
                <span className="font-medium text-[#4F2D1F] text-sm">{userLocation.name}</span>
                <button
                  onClick={() => {
                    const detectLocationFn = () => {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const newLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            name: "Detecting..."
                          };
                          handleUserLocationChange(newLocation);
                        },
                        (error) => {
                          console.error("Error getting location:", error);
                          alert("Please allow location access to improve delivery accuracy");
                        }
                      );
                    };
                    detectLocationFn();
                  }}
                  className="ml-1 flex items-center text-[#8B572A] text-xs bg-[#E5A764]/10 px-1.5 py-0.5 rounded-full"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  <span>Sync</span>
                </button>
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
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for restaurants or dishes"
              className="w-full bg-[#E5A764]/10 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B572A]"
            />
            
            {/* Search results dropdown for food items */}
            {showFoodItemsInSearch && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-[#8B572A] mb-1 px-2">
                    {foodItems.filter(item => 
                      item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length > 0 ? 'Dishes' : 'No dishes found'}
                  </div>
                  
                  {/* Food items matching search */}
                  {foodItems
                    .filter(item => 
                      item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 5) // Show top 5 results
                    .map((item, index) => (
                      <div 
                        key={`food-${item.id}`}
                        className="flex items-center p-2 hover:bg-[#FFF9F2] rounded-lg cursor-pointer"
                        onClick={() => {
                          // Navigate to restaurant with this food item
                          if (item.restaurantId) {
                            handleRestaurantClick(item.restaurantId);
                          }
                        }}
                      >
                        <div className="w-10 h-10 bg-[#E5A764]/20 rounded-full flex items-center justify-center mr-3">
                          <Search className="w-4 h-4 text-[#8B572A]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-[#4F2D1F]">{item.name}</div>
                          <div className="text-xs text-[#8B572A]">
                            {item.restaurantName ? `at ${item.restaurantName}` : ''} • ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
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
              <h3 className="text-xl font-bold text-white font-dm-sans">Try Authentic Ethiopian Doro Wat</h3>
              <p className="text-sm text-white/90 mb-2">A spicy, rich Ethiopian chicken stew with berbere spices and boiled egg</p>
              <p className="text-sm text-white/90 mb-3">Use code: <span className="font-medium bg-white/20 px-2 py-0.5 rounded">GEBETA25</span> for 25% off</p>
              <Button className="text-sm bg-white text-[#4F2D1F] hover:bg-white/90 font-medium py-1.5 px-4 rounded-lg">
                Order Now
              </Button>
            </div>
            <div className="w-1/3 relative overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-[#8B572A]/20"></div>
              <img 
                src="/images/doro-wat.svg" 
                alt="Ethiopian Doro Wat promo" 
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#4F2D1F]/90 to-transparent p-2 text-center">
                <span className="text-white text-xs font-medium">Traditional Recipe</span>
              </div>
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
            Find Restaurants Near You
          </h2>
          
          <DeliveryMap 
            height="180px"
            onUserLocationChange={handleUserLocationChange}
          />
            
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#4F2D1F] font-medium">Ethiopian restaurants near you</p>
              <p className="text-xs text-[#8B572A]">Showing restaurants within 3km</p>
            </div>
            <Button className="bg-[#8B572A] hover:bg-[#4F2D1F] text-white text-sm">
              <Icons.map className="mr-1 h-4 w-4" />
              View All
            </Button>
          </div>
        </motion.div>
      </motion.div>
      
      <NavBar />
    </div>
  );
};

export default Home;
