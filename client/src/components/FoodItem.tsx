import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { motion } from "framer-motion";
import { type FoodItem as FoodItemType } from "@shared/schema";

interface FoodItemProps {
  foodItem: FoodItemType;
}

const FoodItem = ({ foodItem }: FoodItemProps) => {
  const { addToCart } = useCart();

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
    <Card className="bg-white rounded-lg border border-neutral-200 p-3 flex">
      <div className="flex-grow pr-3">
        <h3 className="font-bold mb-1">{foodItem.name}</h3>
        <p className="text-sm text-neutral-600 mb-2">{foodItem.description}</p>
        <div className="flex items-center">
          <span className="font-bold">Birr {foodItem.price}</span>
        </div>
      </div>
      <div className="relative w-24 h-24">
        <img 
          src={foodItem.imageUrl} 
          alt={foodItem.name} 
          className="w-full h-full object-cover rounded-lg"
        />
        <motion.button 
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md"
          onClick={handleAddToCart}
          whileTap={{ scale: 0.9 }}
        >
          <Icons.plus className="text-white" />
        </motion.button>
      </div>
    </Card>
  );
};

export default FoodItem;
