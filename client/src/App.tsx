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
import RestaurantLogin from "@/pages/RestaurantLogin";
import RestaurantDashboard from "@/pages/RestaurantDashboard";
import { CartProvider } from "./store/CartContext";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import NavBar from "@/components/NavBar";
// New imports for our WebSocket and location implementations
import NotificationBellNew from "@/components/NotificationBellNew";
import WebSocketStatusIndicator from "@/components/WebSocketStatusIndicator";
import { LocationStatusBar } from "@/components/LocationStatusBar";

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
        // For regular app flow, redirect is now handled by RedirectHandler
        if (location === "/") {
          // Only set location if we're at the root
          setLocation("/splash-redirect");
        }
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
           !location.startsWith("/admin") && // Hide navbar on admin pages
           !location.startsWith("/restaurant-login") && // Hide navbar on restaurant login
           !location.startsWith("/restaurant-dashboard"); // Hide navbar on restaurant dashboard
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
                {/* Global status indicators for authenticated users */}
                {location !== "/login" && location !== "/otp-verification" && (
                  <>
                    {/* WebSocket status in top right */}
                    <div className="fixed top-4 right-4 z-50">
                      <WebSocketStatusIndicator />
                    </div>
                    
                    {/* Location status bar at the top */}
                    <div className="fixed top-4 left-4 z-50">
                      <LocationStatusBar />
                    </div>
                  </>
                )}
                
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
                    
                    {/* Restaurant Management routes */}
                    <Route path="/restaurant-login" component={RestaurantLogin} />
                    <Route path="/restaurant-dashboard" component={RestaurantDashboard} />
                    
                    {/* Special routes for handling redirects */}
                    <Route path="/splash-redirect" component={RedirectHandler} />
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
    console.log("RedirectHandler - Auth status:", isAuthenticated, "at location:", location);
    
    // Don't redirect if already on home, login, admin, or restaurant pages
    if (
      location === "/home" || 
      location === "/login" || 
      location.startsWith('/admin') ||
      location.startsWith('/restaurant-login') ||
      location.startsWith('/restaurant-dashboard')
    ) {
      console.log("Already on a valid route, no need to redirect");
      return;
    }
    
    // If user is authenticated, redirect to home
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to /home");
      setLocation("/home");
    } else {
      // If not authenticated, redirect to login
      console.log("User is not authenticated, redirecting to /login");
      setLocation("/login");
    }
  }, [isAuthenticated, location, setLocation]);
  
  return null;
}

export default App;
