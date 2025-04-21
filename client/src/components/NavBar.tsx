import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";

const NavBar = () => {
  const [location, setLocation] = useLocation();
  const { cartItems } = useCart();
  
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 flex justify-between items-center">
      <Button 
        variant="ghost"
        className={`flex flex-col items-center w-1/4 ${isActive('/home') ? 'text-primary' : 'text-neutral-400'}`}
        onClick={() => setLocation('/home')}
      >
        <Icons.home className="text-xl" />
        <span className="text-xs mt-1">Home</span>
      </Button>
      <Button 
        variant="ghost"
        className="flex flex-col items-center w-1/4 text-neutral-400"
      >
        <Icons.search className="text-xl" />
        <span className="text-xs mt-1">Search</span>
      </Button>
      <Button 
        variant="ghost"
        className="flex flex-col items-center w-1/4 text-neutral-400"
      >
        <Icons.heart className="text-xl" />
        <span className="text-xs mt-1">Favorites</span>
      </Button>
      <Button 
        variant="ghost"
        className={`flex flex-col items-center w-1/4 ${cartItems.length > 0 ? 'text-primary' : 'text-neutral-400'}`}
        onClick={() => setLocation('/cart')}
      >
        <div className="relative">
          <Icons.shoppingBag className="text-xl" />
          {cartItems.length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{cartItems.length}</span>
            </div>
          )}
        </div>
        <span className="text-xs mt-1">Cart</span>
      </Button>
    </div>
  );
};

export default NavBar;
