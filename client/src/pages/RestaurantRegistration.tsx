import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/lib/icons";
import { fadeIn } from "@/lib/animation";

const RestaurantRegistration = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated, userData, updateProfile } = useAuth();
  
  // Registration steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form state
  const [ownerDetails, setOwnerDetails] = useState({
    fullName: userData?.fullName || "",
    phoneNumber: userData?.phoneNumber || "",
    email: userData?.email || "",
  });
  
  const [restaurantDetails, setRestaurantDetails] = useState({
    name: "",
    description: "",
    categories: "",
    address: "",
    latitude: 8.9801,
    longitude: 38.7578,
    phone: "",
    openingHours: "09:00",
    closingHours: "21:00",
  });
  
  const [commissionPreference, setCommissionPreference] = useState({
    acceptStandardRate: true,  // 15% default
    requestPremiumListing: false, // 25% for featured listings
    agreeToTerms: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle owner details change
  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOwnerDetails(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle restaurant details change
  const handleRestaurantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRestaurantDetails(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setCommissionPreference(prev => ({ ...prev, [name]: checked }));
  };
  
  // Navigate to next step
  const handleNextStep = () => {
    if (currentStep === 1 && validateOwnerDetails()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateRestaurantDetails()) {
      setCurrentStep(3);
    }
  };
  
  // Navigate to previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Validate owner details
  const validateOwnerDetails = () => {
    if (!ownerDetails.fullName.trim()) {
      toast({
        title: "Full name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return false;
    }
    
    if (!ownerDetails.email.trim() || !ownerDetails.email.includes('@')) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Validate restaurant details
  const validateRestaurantDetails = () => {
    if (!restaurantDetails.name.trim()) {
      toast({
        title: "Restaurant name required",
        description: "Please enter your restaurant name",
        variant: "destructive",
      });
      return false;
    }
    
    if (!restaurantDetails.description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description of your restaurant",
        variant: "destructive",
      });
      return false;
    }
    
    if (!restaurantDetails.categories.trim()) {
      toast({
        title: "Categories required",
        description: "Please specify at least one food category",
        variant: "destructive",
      });
      return false;
    }
    
    if (!restaurantDetails.address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter your restaurant address",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Submit restaurant registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commissionPreference.agreeToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user profile to mark as restaurant owner
      updateProfile({
        fullName: ownerDetails.fullName,
        email: ownerDetails.email,
        userType: "restaurant_owner",
      });
      
      // In a real app, you would also call API to create restaurant
      // const formData = new FormData();
      // formData.append('name', restaurantDetails.name);
      // ...
      // await apiRequest('POST', '/api/restaurants', formData);
      
      // For demo, simulate API call with delay
      setTimeout(() => {
        toast({
          title: "Registration submitted",
          description: "Your restaurant registration has been submitted for review",
        });
        
        setIsSubmitting(false);
        
        // Redirect to dashboard or confirmation page
        setTimeout(() => {
          setLocation("/restaurant-dashboard");
        }, 2000);
      }, 2000);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Icons.store className="h-16 w-16 text-[#E5A764] mb-4" />
        <h2 className="text-xl font-bold text-[#4F2D1F] mb-2">Please Sign In</h2>
        <p className="text-[#8B572A] text-center mb-4">
          Sign in to register your restaurant
        </p>
        <Button 
          className="bg-[#8B572A] hover:bg-[#4F2D1F]"
          onClick={() => setLocation("/login")}
        >
          Sign In
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mb-8 text-center"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-[#4F2D1F]">Restaurant Registration</h1>
        <p className="text-[#8B572A] mt-2">Join our network of restaurants and grow your business</p>
      </motion.div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 === currentStep 
                    ? 'bg-[#8B572A] text-white' 
                    : index + 1 < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1 < currentStep ? <Icons.check className="w-4 h-4" /> : index + 1}
              </div>
              <span className="text-xs mt-1 hidden md:inline">
                {index === 0 ? "Owner Information" : index === 1 ? "Restaurant Details" : "Commission & Terms"}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#8B572A] h-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 ? "Owner Information" : 
             currentStep === 2 ? "Restaurant Details" : 
             "Commission & Terms"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 ? "Provide your personal information as the restaurant owner" : 
             currentStep === 2 ? "Tell us about your restaurant" : 
             "Select your preferred commission structure"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Step 1: Owner Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName"
                    value={ownerDetails.fullName} 
                    onChange={handleOwnerChange} 
                    placeholder="Enter your full name" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber"
                    value={ownerDetails.phoneNumber} 
                    onChange={handleOwnerChange} 
                    placeholder="Enter your phone number"
                    disabled={!!userData?.phoneNumber}
                  />
                  {userData?.phoneNumber && (
                    <p className="text-xs text-gray-500">Phone number is linked to your account</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={ownerDetails.email} 
                    onChange={handleOwnerChange} 
                    placeholder="Enter your email address" 
                  />
                </div>
              </>
            )}
            
            {/* Step 2: Restaurant Details */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={restaurantDetails.name} 
                    onChange={handleRestaurantChange} 
                    placeholder="Enter restaurant name" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={restaurantDetails.description} 
                    onChange={handleRestaurantChange} 
                    placeholder="Describe your restaurant" 
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categories">Food Categories</Label>
                  <Input 
                    id="categories" 
                    name="categories"
                    value={restaurantDetails.categories} 
                    onChange={handleRestaurantChange} 
                    placeholder="e.g., Ethiopian, Italian, Fast Food (comma separated)" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Restaurant Address</Label>
                  <Input 
                    id="address" 
                    name="address"
                    value={restaurantDetails.address} 
                    onChange={handleRestaurantChange} 
                    placeholder="Enter restaurant address" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openingHours">Opening Hours</Label>
                    <Input 
                      id="openingHours" 
                      name="openingHours"
                      type="time"
                      value={restaurantDetails.openingHours} 
                      onChange={handleRestaurantChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="closingHours">Closing Hours</Label>
                    <Input 
                      id="closingHours" 
                      name="closingHours"
                      type="time"
                      value={restaurantDetails.closingHours} 
                      onChange={handleRestaurantChange} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Restaurant Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={restaurantDetails.phone} 
                    onChange={handleRestaurantChange} 
                    placeholder="Enter restaurant phone number" 
                  />
                </div>
              </>
            )}
            
            {/* Step 3: Commission & Terms */}
            {currentStep === 3 && (
              <>
                <div className="bg-[#FFF9F2] p-4 rounded-lg border border-[#E5A764]/30 mb-6">
                  <h3 className="font-medium text-[#4F2D1F] mb-2">Commission Structure</h3>
                  <p className="text-sm text-[#8B572A] mb-4">
                    Select your preferred commission structure. The standard rate is 15% 
                    per order, while premium listings are featured at the top of search 
                    results with a 25% commission.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#4F2D1F]">Standard Rate (15%)</h4>
                        <p className="text-xs text-[#8B572A]">Basic listing with standard visibility</p>
                      </div>
                      <Switch 
                        checked={commissionPreference.acceptStandardRate}
                        onCheckedChange={(checked) => handleSwitchChange("acceptStandardRate", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#4F2D1F]">Premium Listing (25%)</h4>
                        <p className="text-xs text-[#8B572A]">Featured placement and promotional benefits</p>
                      </div>
                      <Switch 
                        checked={commissionPreference.requestPremiumListing}
                        onCheckedChange={(checked) => handleSwitchChange("requestPremiumListing", checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Switch 
                    id="agreeToTerms"
                    checked={commissionPreference.agreeToTerms}
                    onCheckedChange={(checked) => handleSwitchChange("agreeToTerms", checked)}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to the <a href="#" className="text-[#8B572A] underline">Terms and Conditions</a> and
                    understand that my restaurant information will be reviewed before approval.
                  </Label>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevStep}
                className="border-[#8B572A] text-[#8B572A]"
              >
                <Icons.chevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button 
                type="button"
                className="bg-[#8B572A] hover:bg-[#4F2D1F] ml-auto"
                onClick={handleNextStep}
              >
                Next
                <Icons.chevronLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="bg-[#8B572A] hover:bg-[#4F2D1F] ml-auto"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                loadingText="Submitting..."
              >
                Submit Registration
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RestaurantRegistration;