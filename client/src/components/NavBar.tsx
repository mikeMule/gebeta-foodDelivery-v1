import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { motion } from "framer-motion";

const NavBar = () => {
  const [location, setLocation] = useLocation();
  const { cartItems } = useCart();
  
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5A764]/30 px-4 py-3 flex justify-between items-center shadow-sm z-20"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Button 
        variant="ghost"
        className={`flex flex-col items-center w-1/4 ${isActive('/home') ? 'text-[#8B572A]' : 'text-[#8B572A]/50'} hover:bg-[#E5A764]/10 hover:text-[#8B572A]`}
        onClick={() => setLocation('/home')}
      >
        <Icons.home className={`${isActive('/home') ? 'text-xl' : 'text-lg'} transition-all duration-200`} />
        <span className="text-xs mt-1 font-medium">Home</span>
      </Button>
      
      <Button 
        variant="ghost"
        className={`flex flex-col items-center w-1/4 ${isActive('/search') ? 'text-[#8B572A]' : 'text-[#8B572A]/50'} hover:bg-[#E5A764]/10 hover:text-[#8B572A]`}
        onClick={() => setLocation('/search')}
      >
        <Icons.search className={`${isActive('/search') ? 'text-xl' : 'text-lg'} transition-all duration-200`} />
        <span className="text-xs mt-1 font-medium">Search</span>
      </Button>
      
      <Button 
        variant="ghost"
        className={`flex flex-col items-center w-1/4 ${isActive('/favorites') ? 'text-[#8B572A]' : 'text-[#8B572A]/50'} hover:bg-[#E5A764]/10 hover:text-[#8B572A]`}
        onClick={() => setLocation('/favorites')}
      >
        <Icons.heart className={`${isActive('/favorites') ? 'text-xl' : 'text-lg'} transition-all duration-200`} />
        <span className="text-xs mt-1 font-medium">Favorites</span>
      </Button>
      
      <Button 
        variant="ghost"
        className={`flex flex-col items-center w-1/4 ${isActive('/cart') || cartItems.length > 0 ? 'text-[#8B572A]' : 'text-[#8B572A]/50'} hover:bg-[#E5A764]/10 hover:text-[#8B572A]`}
        onClick={() => setLocation('/cart')}
      >
        <div className="relative">
          <Icons.shoppingBag className={`${isActive('/cart') ? 'text-xl' : 'text-lg'} transition-all duration-200`} />
          {cartItems.length > 0 && (
            <motion.div 
              className="absolute -top-1 -right-1 w-5 h-5 bg-[#C73030] rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <span className="text-[10px] text-white font-bold">{cartItems.length}</span>
            </motion.div>
          )}
        </div>
        <span className="text-xs mt-1 font-medium">Cart</span>
      </Button>
    </motion.div>
  );
};

export default NavBar;
