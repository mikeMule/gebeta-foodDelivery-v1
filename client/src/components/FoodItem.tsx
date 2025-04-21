import { Card } from "@/components/ui/card";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { motion } from "framer-motion";
import { type FoodItem as FoodItemType } from "@shared/schema";
import { useState } from "react";

interface FoodItemProps {
  foodItem: FoodItemType;
}

const FoodItem = ({ foodItem }: FoodItemProps) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: foodItem.id,
      name: foodItem.name,
      price: foodItem.price,
      quantity: 1,
      notes: "",
      restaurantId: foodItem.restaurantId
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
            className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#C73030] rounded-full flex items-center justify-center shadow-md"
            onClick={handleAddToCart}
            whileHover={{ scale: 1.1, backgroundColor: "#8B572A" }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              scale: isHovered ? 1.05 : 1,
              boxShadow: isHovered ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.1)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icons.plus className="text-white" />
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
};

export default FoodItem;
