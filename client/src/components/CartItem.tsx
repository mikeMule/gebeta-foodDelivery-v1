import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { type OrderItem } from "@shared/schema";

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
  const { removeFromCart } = useCart();

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <div className={`flex items-center py-3 ${!isLast ? 'border-b border-neutral-100' : ''}`}>
      <div className="flex-grow">
        <div className="flex items-start">
          <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm">{item.quantity}×</span>
          </div>
          <div>
            <h3 className="font-medium">{item.name}</h3>
            {item.notes && <p className="text-sm text-neutral-600">{item.notes}</p>}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <span className="font-medium mr-4">Birr {item.price}</span>
        <Button variant="ghost" className="text-neutral-400 p-1 h-auto" onClick={handleRemove}>
          <Icons.trash />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
