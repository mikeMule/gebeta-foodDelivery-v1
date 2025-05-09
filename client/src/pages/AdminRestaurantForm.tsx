import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InsertRestaurant, Restaurant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, EyeOff, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Restaurant owner credentials form component
function OwnerCredentialsForm({ restaurantId }: { restaurantId: number }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });

  useEffect(() => {
    // Fetch existing owners for this restaurant
    const fetchOwners = async () => {
      try {
        const data = await apiRequest("GET", `/api/restaurant/${restaurantId}/owners`)
          .then(res => res.json());
        setOwners(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching owners:", error);
        // If API endpoint not found or other error, just show empty state
        setOwners([]);
        setLoading(false);
      }
    };
    
    fetchOwners();
  }, [restaurantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const generateCredentials = () => {
    // Generate simple username based on restaurant ID and random number
    const username = `restaurant${restaurantId}_${Math.floor(Math.random() * 1000)}`;
    
    // Generate a random password with letters, numbers, and special characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    setGeneratedUsername(username);
    setGeneratedPassword(password);
  };
  
  const handleDeleteOwner = async (ownerId: number) => {
    setIsDeleting(true);
    try {
      await apiRequest("DELETE", `/api/restaurant-owners/${ownerId}`, {});
      
      // Remove the owner from the local state
      setOwners(prev => prev.filter(owner => owner.id !== ownerId));
      
      toast({
        title: "Success",
        description: "Restaurant owner deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting owner:", error);
      toast({
        title: "Error",
        description: "Failed to delete restaurant owner",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phoneNumber || !generatedUsername || !generatedPassword) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all fields and generate credentials",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Creating restaurant owner with data:", {
        restaurantId,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber
      });
      
      const res = await apiRequest('POST', '/api/restaurant-owners', {
        restaurantId,
        fullName: formData.fullName, // Server will handle mapping to full_name
        phoneNumber: formData.phoneNumber, // Server will handle mapping to phone_number
        email: formData.email,
        username: generatedUsername,
        password: generatedPassword,
        userType: "restaurant_owner",
      });
      
      const data = await res.json();
      
      toast({
        title: "Owner Account Created",
        description: "Restaurant owner credentials have been created successfully",
      });
      
      // Reset form
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
      });
      setGeneratedUsername("");
      setGeneratedPassword("");
      
      // Refresh owners list
      setOwners(prev => [...prev, data]);
      
    } catch (error) {
      console.error("Error creating owner account:", error);
      // Check for specific error messages
      let errorMessage = "Failed to create owner account";
      
      if (error instanceof Error && error.message.includes("Phone number already exists")) {
        errorMessage = "This phone number is already registered. Please use a different phone number.";
      } else if (error instanceof Error && error.message.includes("Username already exists")) {
        errorMessage = "This username is already taken. Please generate new credentials.";
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="text-xl text-amber-900">Restaurant Owner Credentials</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Owner Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="border-amber-200"
                placeholder="e.g. John Doe"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="border-amber-200"
                placeholder="e.g. +251911234567"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="border-amber-200"
                placeholder="e.g. owner@restaurant.com"
              />
            </div>
          </div>
          
          <div className="border border-amber-100 rounded-md p-4 bg-amber-50">
            <h3 className="text-md font-semibold text-amber-900 mb-2">Login Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={generatedUsername}
                  readOnly
                  className="bg-amber-50 border-amber-200"
                  placeholder="Click generate to create username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={generatedPassword}
                    readOnly
                    className="bg-amber-50 border-amber-200 pr-10"
                    placeholder="Click generate to create password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-amber-600 hover:bg-transparent hover:text-amber-800"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="mt-4 border-amber-300 text-amber-800 hover:bg-amber-100"
              onClick={generateCredentials}
            >
              Generate Credentials
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-amber-700 hover:bg-amber-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Owner Account"
              )}
            </Button>
          </div>
        </form>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            Existing Restaurant Owners
          </h3>
          
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
            </div>
          ) : owners.length === 0 ? (
            <div className="text-center py-6 bg-amber-50 rounded-md border border-amber-100">
              <p className="text-amber-700">No restaurant owners found. Create one using the form above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {owners.map((owner) => (
                <div 
                  key={owner.id} 
                  className="p-4 border border-amber-200 rounded-md bg-white flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium text-amber-900">{owner.fullName}</h4>
                    <div className="text-sm text-amber-700 mt-1">
                      <span className="font-medium">Username:</span> {owner.username}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {owner.phoneNumber}{owner.email ? ` • ${owner.email}` : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the restaurant owner account for {owner.fullName}.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteOwner(owner.id)}
                          >
                            {isDeleting ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</>
                            ) : (
                              "Delete Owner"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-amber-500 border-amber-200 hover:bg-amber-50"
                    >
                      Reset Password
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminRestaurantForm() {
  const { id } = useParams();
  const isNew = id === "new";
  const [, setLocation] = useLocation();
  const { isAuthenticated, userData } = useAuth();
  const { toast } = useToast();
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  // Form state
  const [formData, setFormData] = useState<Partial<InsertRestaurant>>({
    name: "",
    description: "",
    imageUrl: "",
    categories: "",
    rating: 4.5,
    deliveryTime: "30-45 min",
    deliveryFee: 0,
    distance: 0,
    latitude: 9.0232,
    longitude: 38.7469,
    openingHours: "09:00",
    closingHours: "21:00",
    phone: "+251-11-111-1111",
    address: "Addis Ababa, Ethiopia",
  });

  // Food item form state
  const [foodItemForm, setFoodItemForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    imageUrl: ""
  });

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

    // If editing existing restaurant, fetch data
    if (!isNew) {
      const fetchRestaurantData = async () => {
        try {
          const data = await apiRequest("GET", `/api/restaurants/${id}`)
            .then(res => res.json());
          
          setFormData({
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            categories: data.categories,
            rating: data.rating,
            deliveryTime: data.deliveryTime,
            deliveryFee: data.deliveryFee,
            distance: data.distance,
            latitude: data.latitude,
            longitude: data.longitude,
            openingHours: data.openingHours || "09:00",
            closingHours: data.closingHours || "21:00",
            phone: data.phone || "+251-11-111-1111",
            address: data.address || "Addis Ababa, Ethiopia",
          });
        } catch (error) {
          console.error("Error fetching restaurant:", error);
          toast({
            title: "Error",
            description: "Failed to fetch restaurant data",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      // Fetch food items for this restaurant
      const fetchFoodItems = async () => {
        try {
          const data = await apiRequest("GET", `/api/restaurants/${id}/food-items`)
            .then(res => res.json());
          setFoodItems(data);
        } catch (error) {
          console.error("Error fetching food items:", error);
        }
      };
      
      fetchRestaurantData();
      fetchFoodItems();
    }
  }, [isAuthenticated, userData, id, isNew, setLocation, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "deliveryFee" || name === "rating" || name === "distance" || name === "latitude" || name === "longitude" 
        ? parseFloat(value) 
        : value,
    });
  };

  const handleFoodItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFoodItemForm({
      ...foodItemForm,
      [name]: name === "price" ? value.replace(/[^0-9]/g, "") : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isNew) {
        // Create new restaurant
        const res = await apiRequest("POST", "/api/restaurants", formData);
        const newRestaurant = await res.json();

        toast({
          title: "Success",
          description: "Restaurant created successfully",
        });

        // Navigate to the edit page of the new restaurant
        setLocation(`/admin/restaurant/${newRestaurant.id}`);
      } else {
        // Update existing restaurant
        await apiRequest("PATCH", `/api/restaurants/${id}`, formData);
        
        toast({
          title: "Success",
          description: "Restaurant updated successfully",
        });
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      toast({
        title: "Error",
        description: "Failed to save restaurant data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFoodItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodItemForm.name || !foodItemForm.description || !foodItemForm.category || !foodItemForm.price || !foodItemForm.imageUrl) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/food-items", {
        ...foodItemForm,
        restaurantId: parseInt(id as string),
        price: parseInt(foodItemForm.price),
      });
      
      const newFoodItem = await res.json();
      setFoodItems([...foodItems, newFoodItem]);
      
      // Reset form
      setFoodItemForm({
        name: "",
        description: "",
        category: "",
        price: "",
        imageUrl: ""
      });

      toast({
        title: "Success",
        description: "Food item added successfully",
      });
    } catch (error) {
      console.error("Error adding food item:", error);
      toast({
        title: "Error",
        description: "Failed to add food item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFoodItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this food item?")) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/food-items/${itemId}`, {});
      setFoodItems(foodItems.filter(item => item.id !== itemId));
      
      toast({
        title: "Success",
        description: "Food item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting food item:", error);
      toast({
        title: "Error",
        description: "Failed to delete food item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-amber-50">
        <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
      </div>
    );
  }

  return (
    <div className="bg-amber-50 min-h-screen">
      <header className="bg-amber-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gebeta Admin</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-amber-700"
              onClick={() => setLocation("/admin/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">
            {isNew ? "Add New Restaurant" : `Edit Restaurant: ${formData.name}`}
          </h2>

          {!isNew && (
            <Tabs defaultValue="details" className="mb-8">
              <TabsList className="grid w-full grid-cols-3 bg-amber-100">
                <TabsTrigger value="details">Restaurant Details</TabsTrigger>
                <TabsTrigger value="credentials">Owner Credentials</TabsTrigger>
                <TabsTrigger value="menu">Menu Items</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <RestaurantForm 
                  formData={formData} 
                  handleChange={handleChange} 
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isNew={isNew}
                />
              </TabsContent>
              
              <TabsContent value="credentials">
                <OwnerCredentialsForm restaurantId={parseInt(id as string)} />
              </TabsContent>
              
              <TabsContent value="menu">
                <Card className="bg-white border-amber-200 mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-amber-900">Add Menu Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddFoodItem} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Item Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={foodItemForm.name}
                            onChange={handleFoodItemChange}
                            className="border-amber-200"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            name="category"
                            value={foodItemForm.category}
                            onChange={handleFoodItemChange}
                            className="border-amber-200"
                            placeholder="e.g. Main Course, Appetizer, Dessert"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (ETB)</Label>
                          <Input
                            id="price"
                            name="price"
                            value={foodItemForm.price}
                            onChange={handleFoodItemChange}
                            className="border-amber-200"
                            placeholder="e.g. 150"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            name="imageUrl"
                            value={foodItemForm.imageUrl}
                            onChange={handleFoodItemChange}
                            className="border-amber-200"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={foodItemForm.description}
                          onChange={handleFoodItemChange}
                          className="border-amber-200 min-h-[80px]"
                          placeholder="Describe the food item in detail"
                        />
                      </div>
                      
                      <Button type="submit" className="bg-amber-700 hover:bg-amber-800">
                        Add to Menu
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                <h3 className="text-lg font-semibold text-amber-900 mt-8 mb-4">Current Menu Items</h3>
                
                {foodItems.length === 0 ? (
                  <Card className="bg-white border-amber-200">
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No menu items found. Add your first item above.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {foodItems.map((item) => (
                      <Card key={item.id} className="flex bg-white border-amber-200 overflow-hidden">
                        <div className="w-1/3 h-auto">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-2/3 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-amber-900">{item.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                            </div>
                            <div className="font-bold text-amber-700">{item.price} ETB</div>
                          </div>
                          <p className="text-sm mt-2 line-clamp-2">{item.description}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteFoodItem(item.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {isNew && (
            <RestaurantForm 
              formData={formData} 
              handleChange={handleChange} 
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isNew={isNew}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Separate component for the restaurant form
function RestaurantForm({ 
  formData, 
  handleChange, 
  handleSubmit, 
  isSubmitting, 
  isNew 
}: { 
  formData: Partial<InsertRestaurant>,
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  handleSubmit: (e: React.FormEvent) => void,
  isSubmitting: boolean,
  isNew: boolean
}) {
  return (
    <Card className="bg-white border-amber-200">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border-amber-200"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border-amber-200 min-h-[100px]"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categories">Categories</Label>
              <Input
                id="categories"
                name="categories"
                value={formData.categories}
                onChange={handleChange}
                className="border-amber-200"
                placeholder="e.g. Ethiopian, Traditional"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="border-amber-200"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                className="border-amber-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Delivery Time</Label>
              <Input
                id="deliveryTime"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                className="border-amber-200"
                placeholder="e.g. 30-45 min"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery Fee (ETB)</Label>
              <Input
                id="deliveryFee"
                name="deliveryFee"
                type="number"
                min="0"
                value={formData.deliveryFee}
                onChange={handleChange}
                className="border-amber-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                name="distance"
                type="number"
                step="0.1"
                min="0"
                value={formData.distance}
                onChange={handleChange}
                className="border-amber-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border-amber-200"
                placeholder="+251-11-111-1111"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border-amber-200"
                placeholder="Addis Ababa, Ethiopia"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="openingHours">Opening Hours</Label>
              <Input
                id="openingHours"
                name="openingHours"
                type="time"
                value={formData.openingHours}
                onChange={handleChange}
                className="border-amber-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closingHours">Closing Hours</Label>
              <Input
                id="closingHours"
                name="closingHours"
                type="time"
                value={formData.closingHours}
                onChange={handleChange}
                className="border-amber-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="0.0000001"
                value={formData.latitude}
                onChange={handleChange}
                className="border-amber-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="0.0000001"
                value={formData.longitude}
                onChange={handleChange}
                className="border-amber-200"
                required
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-amber-700 hover:bg-amber-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isNew ? "Create Restaurant" : "Update Restaurant"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}