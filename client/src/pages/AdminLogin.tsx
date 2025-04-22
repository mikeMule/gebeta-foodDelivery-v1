import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLogin() {
  const { login, verifyOtp } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would call an API endpoint to authenticate
    // For now, using simple validation for admin access
    if (username === "admin" && password === "admin123") {
      const userData = {
        id: 999, // Admin ID
        phoneNumber: "admin",
        userType: "admin",
        fullName: "Restaurant Admin",
        username: "admin"
      };
      
      login(userData);
      verifyOtp("admin"); // Bypass OTP for admin
      
      // Set session cookie or authentication header for API requests
      localStorage.setItem('adminAuth', 'true');
      
      toast({
        title: "Success",
        description: "Welcome to Admin Dashboard",
      });
      
      setLocation("/admin/dashboard");
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 bg-amber-800 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-amber-100 text-center">
            Access the restaurant management system
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="username">
                Username
              </label>
              <Input
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-amber-200 focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-amber-200 focus:border-amber-500"
              />
            </div>
            <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Use default credentials: <span className="font-medium">admin</span> / <span className="font-medium">admin123</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <p className="text-xs text-muted-foreground text-center">
            This is a secure area for restaurant management. Unauthorized access is prohibited.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}