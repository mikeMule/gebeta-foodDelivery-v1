import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { useCart } from "@/store/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const NavBar = () => {
  const [location, setLocation] = useLocation();
  const { cartItems } = useCart();
  const [activeTab, setActiveTab] = useState<string>('/home');
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [cartCount, setCartCount] = useState(cartItems.length);
  
  useEffect(() => {
    // Set active tab based on current location
    setActiveTab(location);
  }, [location]);
  
  useEffect(() => {
    // Animate cart icon when items are added
    if (cartItems.length > cartCount) {
      setIsCartBouncing(true);
      setTimeout(() => setIsCartBouncing(false), 1000);
    }
    setCartCount(cartItems.length);
  }, [cartItems.length, cartCount]);

  const isActive = (path: string) => {
    return activeTab === path;
  };
  
  const handleNavigation = (path: string) => {
    setActiveTab(path);
    setLocation(path);
  };

  // Animation variants
  const tabVariants = {
    active: {
      color: "#8B572A",
      opacity: 1,
      y: -5,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    inactive: {
      color: "#8B572A80",
      opacity: 0.5,
      y: 0
    }
  };
  
  const iconVariants = {
    active: { 
      scale: 1.2,
      y: -2,
      transition: { type: "spring", stiffness: 500, damping: 15 }
    },
    inactive: { 
      scale: 1,
      y: 0
    },
    bounce: {
      scale: [1, 1.4, 0.9, 1.1, 1],
      rotate: [0, -10, 10, -5, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  const navbarVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delayChildren: 0.2,
        staggerChildren: 0.08
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const tabIndicatorVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { width: "50%", opacity: 1, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5A764]/30 px-4 py-3 flex justify-between items-center shadow-md z-20"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center w-full"
      >
        <Button 
          variant="ghost"
          className={`flex flex-col items-center w-1/4 relative ${isActive('/home') ? 'text-[#8B572A]' : 'text-[#8B572A]/50'} hover:bg-[#E5A764]/10 hover:text-[#8B572A]`}
          onClick={() => handleNavigation('/home')}
        >
          <motion.div
            variants={iconVariants}
            animate={isActive('/home') ? 'active' : 'inactive'}
          >
            <Icons.home />
          </motion.div>
          <motion.span 
            className="text-xs mt-1 font-medium"
            variants={tabVariants}
            animate={isActive('/home') ? 'active' : 'inactive'}
          >
            Home
          </motion.span>
          
          {isActive('/home') && (
            <motion.div
              className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#8B572A] rounded-full"
              variants={tabIndicatorVariants}
              initial="initial"
              animate="animate"
              layoutId="activeTabIndicator"
            />
          )}
        </Button>
        
        <Button 
          variant="ghost"
          className={`flex flex-col items-center w-1/4 relative ${isActive('/profile') ? 'text-[#8B572A]' : 'text-[#8B572A]/50'} hover:bg-[#E5A764]/10 hover:text-[#8B572A]`}
          onClick={() => handleNavigation('/profile')}
        >
          <motion.div
            variants={iconVariants}
            animate={isActive('/profile') ? 'active' : 'inactive'}
          >
            <Icons.user />
          </motion.div>
          <motion.span 
            className="text-xs mt-1 font-medium"
            variants={tabVariants}
            animate={isActive('/profile') ? 'active' : 'inactive'}
          >
            Profile
          </motion.span>
          
          {isActive('/profile') && (
            <motion.div
              className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#8B572A] rounded-full"
              variants={tabIndicatorVariants}
              initial="initial"
              animate="animate"
              layoutId="activeTabIndicator"
            />
          )}
        </Button>
        
        <Button 
          variant="ghost"
          className={`flex flex-col items-center w-1/4 relative ${isActive('/my-orders') ? 'text-[#8B572A]' : 'text-[#8B572A]/50'} hover:bg-[#E5A764]/10 hover:text-[#8B572A]`}
          onClick={() => handleNavigation('/my-orders')}
        >
          <motion.div
            variants={iconVariants}
            animate={isActive('/my-orders') ? 'active' : 'inactive'}
          >
            <Icons.package />
          </motion.div>
          <motion.span 
            className="text-xs mt-1 font-medium"
            variants={tabVariants}
            animate={isActive('/my-orders') ? 'active' : 'inactive'}
          >
            Orders
          </motion.span>
          
          {isActive('/my-orders') && (
            <motion.div
              className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#8B572A] rounded-full"
              variants={tabIndicatorVariants}
              initial="initial"
              animate="animate"
              layoutId="activeTabIndicator"
            />
          )}
        </Button>
        
        <Button 
          variant="ghost"
          className={`flex flex-col items-center w-1/4 relative ${isActive('/cart') ? 'text-[#8B572A]' : 'text-[#8B572A]/50'} hover:bg-[#E5A764]/10 hover:text-[#8B572A]`}
          onClick={() => handleNavigation('/cart')}
        >
          <div className="relative">
            <motion.div
              variants={iconVariants}
              animate={isCartBouncing ? 'bounce' : isActive('/cart') ? 'active' : 'inactive'}
            >
              <Icons.shoppingBag />
            </motion.div>
            <AnimatePresence>
              {cartItems.length > 0 && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#C73030] rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <span className="text-[10px] text-white font-bold">{cartItems.length}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.span 
            className="text-xs mt-1 font-medium"
            variants={tabVariants}
            animate={isActive('/cart') ? 'active' : 'inactive'}
          >
            Cart
          </motion.span>
          
          {isActive('/cart') && (
            <motion.div
              className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#8B572A] rounded-full"
              variants={tabIndicatorVariants}
              initial="initial"
              animate="animate"
              layoutId="activeTabIndicator"
            />
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default NavBar;
