import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icons } from "@/lib/icons";
import { fadeIn } from "@/lib/animation";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

const RestaurantLogin = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in as restaurant owner
  if (isAuthenticated && userData?.userType === "restaurant_owner") {
    setLocation("/restaurant-dashboard");
    return null;
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // In a real app, you would make an API call to verify credentials
      // For now, we'll simulate a login with a mock restaurant owner
      setTimeout(() => {
        // Mock restaurant owner data
        const mockRestaurantOwner = {
          phoneNumber: "0911223344",
          fullName: "Restaurant Manager",
          userType: "restaurant_owner",
          email: "restaurant@gebeta.com",
          restaurantId: 1 // link to the specific restaurant
        };
        
        login(mockRestaurantOwner);
        
        toast({
          title: "Login successful",
          description: "Welcome to your restaurant dashboard",
        });
        
        setLocation("/restaurant-dashboard");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid username or password",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#F5F0E8] p-4">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl flex flex-col md:flex-row shadow-lg rounded-xl overflow-hidden"
      >
        {/* Left side - Login form */}
        <Card className="md:w-1/2 border-0 shadow-none bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#4F2D1F]">
              Restaurant Partner Login
            </CardTitle>
            <CardDescription>
              Sign in to manage your restaurant orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#8B572A]">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your username" 
                          {...field} 
                          className="border-[#E5A764] focus:ring-[#8B572A]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#8B572A]">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          className="border-[#E5A764] focus:ring-[#8B572A]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[#8B572A] hover:bg-[#4F2D1F]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.circle className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-[#8B572A]">
              Need help? Contact our support team.
            </div>
            <div className="flex justify-center items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/")}
                className="text-[#8B572A]"
              >
                <Icons.arrowLeft className="mr-2 h-4 w-4" />
                Return to Main Site
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Right side - Hero section */}
        <div className="md:w-1/2 hidden md:block bg-[#8B572A]">
          <div className="h-full w-full flex flex-col justify-center items-center p-8 text-white">
            <div className="mb-8">
              <Icons.store className="h-16 w-16 mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Gebeta Restaurant Portal
              </h2>
              <p className="opacity-90 mb-6">
                Manage your restaurant operations efficiently with our easy-to-use dashboard. Handle orders, update menu items, and track deliveries in real-time.
              </p>
              <ul className="space-y-2">
                {[
                  "View and process incoming orders",
                  "Track order status in real-time",
                  "Manage your menu items",
                  "View earnings and reports",
                  "First come, first serve order management"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Icons.check className="h-5 w-5 mr-2 text-[#E5A764]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RestaurantLogin;