import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { motion } from "framer-motion";

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  };
  isLast: boolean;
}

const CartItem = ({ item, isLast }: CartItemProps) => {
  const { removeFromCart, updateQuantity } = useCart();

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const increaseQuantity = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const decreaseQuantity = () => {
    updateQuantity(item.id, item.quantity - 1);
  };

  return (
    <motion.div 
      className={`flex items-center py-4 ${!isLast ? 'border-b border-[#E5A764]/20' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="flex-grow">
        <div className="flex items-start">
          <div className="w-7 h-7 bg-[#E5A764]/20 text-[#8B572A] rounded-full flex items-center justify-center mr-3 font-medium">
            <span className="text-sm">{item.quantity}×</span>
          </div>
          <div>
            <h3 className="font-medium text-[#4F2D1F]">{item.name}</h3>
            {item.notes && <p className="text-sm text-[#8B572A]">{item.notes}</p>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-[#E5A764]/30 rounded-lg overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-none text-[#8B572A] hover:bg-[#E5A764]/10" 
            onClick={decreaseQuantity}
            disabled={item.quantity <= 1}
          >
            <Icons.minus className="h-3 w-3" />
          </Button>
          
          <span className="w-7 text-center font-medium text-[#4F2D1F]">{item.quantity}</span>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 rounded-none text-[#8B572A] hover:bg-[#E5A764]/10" 
            onClick={increaseQuantity}
          >
            <Icons.plus className="h-3 w-3" />
          </Button>
        </div>
        
        <span className="font-medium text-[#4F2D1F]">{item.price} Birr</span>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="text-[#C73030] bg-[#C73030]/10 hover:bg-[#C73030]/20 h-7 w-7" 
          onClick={handleRemove}
        >
          <Icons.trash className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default CartItem;
