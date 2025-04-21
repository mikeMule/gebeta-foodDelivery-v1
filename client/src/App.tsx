import React, { useState, useEffect } from "react";
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
import Profile from "@/pages/Profile";
import MyOrders from "@/pages/MyOrders";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminRestaurantForm from "@/pages/AdminRestaurantForm";
import { CartProvider } from "./store/CartContext";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import NavBar from "@/components/NavBar";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Show splash screen for 3 seconds then redirect to appropriate page
    // Increased to allow more time to appreciate the animations
    const timer = setTimeout(() => {
      setShowSplash(false);
      
      // Check if we're trying to access an admin page
      if (location.startsWith('/admin')) {
        // Don't redirect, stay on the current admin page
      } else {
        // For regular app flow, go to login
        setLocation("/login");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation, location]);

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
           !location.startsWith("/order-tracking") &&
           !location.startsWith("/admin"); // Hide navbar on admin pages
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
                    <Route path="/profile" component={Profile} />
                    <Route path="/my-orders" component={MyOrders} />
                    
                    {/* Admin routes */}
                    <Route path="/admin/login" component={AdminLogin} />
                    <Route path="/admin/dashboard" component={AdminDashboard} />
                    <Route path="/admin/restaurant/:id" component={AdminRestaurantForm} />
                    
                    {/* Fallback to appropriate page */}
                    <Route path="/" component={RedirectHandler} />
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

// Separate component for handling redirects
function RedirectHandler() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // If the URL has '/admin', don't redirect
    if (location.startsWith('/admin')) {
      return;
    }
    
    // If user is authenticated, redirect to home
    if (isAuthenticated) {
      setLocation("/home");
    } else {
      // If not authenticated, redirect to login
      setLocation("/login");
    }
  }, [isAuthenticated, location, setLocation]);
  
  return null;
}

export default App;
