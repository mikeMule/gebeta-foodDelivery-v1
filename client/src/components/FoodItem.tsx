import { Card } from "@/components/ui/card";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { motion } from "framer-motion";
import { type FoodItem as FoodItemType } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FoodItemProps {
  foodItem: FoodItemType;
  isRestaurantOpen?: boolean;
}

const FoodItem = ({ foodItem, isRestaurantOpen = true }: FoodItemProps) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!isRestaurantOpen) {
      toast({
        title: "Restaurant is closed",
        description: "Sorry, this restaurant is currently closed. Please try again during operating hours.",
        variant: "destructive",
      });
      return;
    }
    
    addToCart({
      id: foodItem.id,
      name: foodItem.name,
      price: foodItem.price,
      quantity: 1,
      notes: "",
      restaurantId: foodItem.restaurantId
    });

    toast({
      title: "Added to cart",
      description: `${foodItem.name} has been added to your cart.`,
      variant: "default",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className="bg-white rounded-lg border border-[#E5A764]/20 p-4 flex hover:shadow-md transition-all duration-300"
      >
        <div className="flex-grow pr-4">
          <h3 className="font-bold mb-1 text-[#4F2D1F]">{foodItem.name}</h3>
          <p className="text-sm text-[#8B572A] mb-3">{foodItem.description}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#4F2D1F]">{foodItem.price} Birr</span>
            <div className="flex items-center gap-1">
              <span className="text-xs bg-[#8B572A]/10 text-[#8B572A] px-2 py-1 rounded-full font-medium">
                {foodItem.category}
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative w-28 h-28">
          <img 
            src={foodItem.imageUrl} 
            alt={foodItem.name} 
            className="w-full h-full object-cover rounded-lg shadow-sm"
          />
          <motion.button 
            className={`absolute -bottom-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md
              ${isRestaurantOpen ? 'bg-[#C73030]' : 'bg-gray-400 cursor-not-allowed'}`}
            onClick={handleAddToCart}
            whileHover={{ scale: isRestaurantOpen ? 1.1 : 1, backgroundColor: isRestaurantOpen ? "#8B572A" : undefined }}
            whileTap={{ scale: isRestaurantOpen ? 0.9 : 1 }}
            animate={{ 
              scale: isHovered && isRestaurantOpen ? 1.05 : 1,
              boxShadow: isHovered ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.1)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icons.plus className="text-white" />
          </motion.button>
          
          {!isRestaurantOpen && (
            <div className="absolute top-0 left-0 right-0 bg-black/60 text-white text-xs font-medium text-center py-1 rounded-t-lg">
              Closed
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default FoodItem;
