import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import OtpVerification from "@/pages/OtpVerification";
import Home from "@/pages/Home";
import RestaurantDetail from "@/pages/RestaurantDetail";
import Cart from "@/pages/Cart";
import OrderSuccess from "@/pages/OrderSuccess";
import OrderTracking from "@/pages/OrderTracking";
import { CartProvider } from "./store/CartContext";
import { AuthProvider } from "./hooks/useAuth";
import NavBar from "@/components/NavBar";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Show splash screen for 3 seconds then redirect to login
    // Increased to allow more time to appreciate the animations
    const timer = setTimeout(() => {
      setShowSplash(false);
      setLocation("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  // Update the document title
  useEffect(() => {
    document.title = "Gebeta - Ethiopian Food Delivery";
  }, []);

  // Determine if we should show the navigation bar
  const shouldShowNavBar = () => {
    return !showSplash && 
           location !== "/login" && 
           location !== "/otp-verification" &&
           location !== "/order-success" &&
           !location.startsWith("/order-tracking");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            {showSplash ? (
              <Splash />
            ) : (
              <>
                <div className={shouldShowNavBar() ? "pb-20" : ""}>
                  <Switch>
                    <Route path="/login" component={Login} />
                    <Route path="/otp-verification" component={OtpVerification} />
                    <Route path="/home" component={Home} />
                    <Route path="/restaurant/:id" component={RestaurantDetail} />
                    <Route path="/cart" component={Cart} />
                    <Route path="/order-success" component={OrderSuccess} />
                    <Route path="/order-tracking" component={OrderTracking} />
                    {/* Fallback to login */}
                    <Route path="/">
                      {() => {
                        setLocation("/login");
                        return null;
                      }}
                    </Route>
                    <Route component={NotFound} />
                  </Switch>
                </div>
                {shouldShowNavBar() && <NavBar />}
              </>
            )}
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
