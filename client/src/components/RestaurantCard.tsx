import { Card } from "@/components/ui/card";
import { Icons } from "@/lib/icons";
import { type Restaurant } from "@shared/schema";
import { motion } from "framer-motion";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <motion.div 
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 15px -3px rgba(139, 87, 42, 0.1), 0 4px 6px -2px rgba(139, 87, 42, 0.05)"
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="restaurant-card bg-white rounded-xl overflow-hidden shadow-sm border border-[#E5A764]/20">
        <div className="relative h-48">
          <img 
            src={restaurant.imageUrl} 
            alt={`${restaurant.name} storefront`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 right-0 bg-[#C73030] rounded-bl-lg px-3 py-1 text-xs font-medium text-white">
            <div className="flex items-center">
              <Icons.clock className="mr-1" />
              <span>{restaurant.deliveryTime}</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <h3 className="text-xl font-bold font-dm-sans text-white">{restaurant.name}</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-wrap gap-1">
              {restaurant.categories.split(', ').map((category, idx) => (
                <span 
                  key={idx} 
                  className="inline-block bg-[#E5A764]/10 text-[#8B572A] text-xs font-medium px-2 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
            <div className="flex items-center bg-[#8B572A]/10 px-2 py-0.5 rounded-full">
              <Icons.starFilled className="text-[#E5A764] w-4 h-4" />
              <span className="text-sm font-medium text-[#4F2D1F] ml-1">{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-[#8B572A]">
              <Icons.mapPin className="mr-1 w-4 h-4" />
              <span>{restaurant.distance.toFixed(1)} km</span>
            </div>
            <div className="flex items-center font-medium text-[#4F2D1F]">
              <Icons.bike className="mr-1 text-[#8B572A] w-4 h-4" />
              <span>
                {restaurant.deliveryFee === 0 
                  ? "Free delivery" 
                  : `${restaurant.deliveryFee} Birr`}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default RestaurantCard;
