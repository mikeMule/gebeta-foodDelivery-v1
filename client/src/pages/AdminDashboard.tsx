import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Restaurant } from "@shared/schema";

export default function AdminDashboard() {
  const { userData, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!isAuthenticated || userData?.userType !== "admin") {
      toast({
        title: "Access Denied",
        description: "You must be logged in as an admin to view this page",
        variant: "destructive",
      });
      setLocation("/admin/login");
      return;
    }

    // Fetch restaurants
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching restaurants:", error);
        toast({
          title: "Error",
          description: "Failed to fetch restaurant data",
          variant: "destructive",
        });
        setLoading(false);
      });
  }, [isAuthenticated, userData, setLocation, toast]);

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const handleAddRestaurant = () => {
    setLocation("/admin/restaurant/new");
  };

  const handleManageRestaurant = (id: number) => {
    setLocation(`/admin/restaurant/${id}`);
  };

  return (
    <div className="bg-amber-50 min-h-screen">
      <header className="bg-amber-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gebeta Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-amber-100">Welcome, {userData?.fullName || "Admin"}</span>
            <Button variant="outline" className="text-white border-white hover:bg-amber-700" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 py-8">
        <Tabs defaultValue="restaurants" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-amber-100">
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="restaurants" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Manage Restaurants</h2>
              <Button className="bg-amber-700 hover:bg-amber-800" onClick={handleAddRestaurant}>
                + Add Restaurant
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
              </div>
            ) : restaurants.length === 0 ? (
              <Card className="bg-white border-amber-200">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No restaurants found. Add your first restaurant.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="overflow-hidden bg-white border-amber-200 hover:shadow-md transition-shadow">
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={restaurant.imageUrl} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-amber-900">{restaurant.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{restaurant.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="text-amber-700">⭐ {restaurant.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-muted-foreground">{restaurant.categories}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2 border-amber-300 text-amber-800 hover:bg-amber-100"
                        onClick={() => handleManageRestaurant(restaurant.id)}
                      >
                        Manage Restaurant
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-amber-900">Restaurants</CardTitle>
                  <CardDescription>Total registered restaurants</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-amber-700">{restaurants.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-amber-900">Orders</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-amber-700">0</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-amber-900">Revenue</CardTitle>
                  <CardDescription>Total platform revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-amber-700">0 ETB</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}