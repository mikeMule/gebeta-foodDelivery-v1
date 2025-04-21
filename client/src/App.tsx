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
import OrderTracking from "@/pages/OrderTracking";
import { CartProvider } from "./store/CartContext";
import { AuthProvider } from "./hooks/useAuth";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Show splash screen for 2 seconds then redirect to login
    const timer = setTimeout(() => {
      setShowSplash(false);
      setLocation("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            {showSplash ? (
              <Splash />
            ) : (
              <Switch>
                <Route path="/login" component={Login} />
                <Route path="/otp-verification" component={OtpVerification} />
                <Route path="/home" component={Home} />
                <Route path="/restaurant/:id" component={RestaurantDetail} />
                <Route path="/cart" component={Cart} />
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
            )}
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
