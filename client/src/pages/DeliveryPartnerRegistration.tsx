import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/lib/icons";
import { fadeIn } from "@/lib/animation";

const DeliveryPartnerRegistration = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated, userData, updateProfile } = useAuth();
  
  // Registration steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form state
  const [personalDetails, setPersonalDetails] = useState({
    fullName: userData?.fullName || "",
    phoneNumber: userData?.phoneNumber || "",
    email: userData?.email || "",
    idNumber: userData?.idNumber || "",
  });
  
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleType: "motorcycle",
    licensePlate: "",
    vehicleColor: "",
    maxDistance: 10, // in kilometers
  });
  
  const [workDetails, setWorkDetails] = useState({
    availableDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    agreeToCommission: false,
    agreeToTerms: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle personal details change
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalDetails(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle vehicle details change
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleDetails(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle vehicle type select
  const handleVehicleTypeChange = (value: string) => {
    setVehicleDetails(prev => ({ ...prev, vehicleType: value }));
  };
  
  // Handle max distance change
  const handleMaxDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setVehicleDetails(prev => ({ ...prev, maxDistance: isNaN(value) ? 0 : value }));
  };
  
  // Handle day availability change
  const handleDayChange = (day: string, checked: boolean) => {
    setWorkDetails(prev => ({
      ...prev,
      availableDays: {
        ...prev.availableDays,
        [day]: checked
      }
    }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setWorkDetails(prev => ({ ...prev, [name]: checked }));
  };
  
  // Navigate to next step
  const handleNextStep = () => {
    if (currentStep === 1 && validatePersonalDetails()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateVehicleDetails()) {
      setCurrentStep(3);
    }
  };
  
  // Navigate to previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Validate personal details
  const validatePersonalDetails = () => {
    if (!personalDetails.fullName.trim()) {
      toast({
        title: "Full name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return false;
    }
    
    if (!personalDetails.email.trim() || !personalDetails.email.includes('@')) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    
    if (!personalDetails.idNumber.trim()) {
      toast({
        title: "ID number required",
        description: "Please enter your national ID number for verification",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Validate vehicle details
  const validateVehicleDetails = () => {
    if (!vehicleDetails.licensePlate.trim()) {
      toast({
        title: "License plate required",
        description: "Please enter your vehicle license plate number",
        variant: "destructive",
      });
      return false;
    }
    
    if (!vehicleDetails.vehicleColor.trim()) {
      toast({
        title: "Vehicle color required",
        description: "Please enter your vehicle color",
        variant: "destructive",
      });
      return false;
    }
    
    if (vehicleDetails.maxDistance <= 0) {
      toast({
        title: "Valid distance required",
        description: "Please enter a maximum delivery distance greater than 0 km",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Submit delivery partner registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workDetails.agreeToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }
    
    if (!workDetails.agreeToCommission) {
      toast({
        title: "Commission agreement required",
        description: "Please agree to the commission structure",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user profile to mark as delivery partner
      updateProfile({
        fullName: personalDetails.fullName,
        email: personalDetails.email,
        idNumber: personalDetails.idNumber,
        userType: "delivery_partner",
      });
      
      // In a real app, you would also call API to create delivery partner profile
      // const formData = new FormData();
      // formData.append('vehicleType', vehicleDetails.vehicleType);
      // ...
      // await apiRequest('POST', '/api/delivery-partners', formData);
      
      // For demo, simulate API call with delay
      setTimeout(() => {
        toast({
          title: "Registration submitted",
          description: "Your delivery partner application has been submitted for review",
        });
        
        setIsSubmitting(false);
        
        // Redirect to dashboard or confirmation page
        setTimeout(() => {
          setLocation("/delivery-dashboard");
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
        <Icons.bike className="h-16 w-16 text-[#E5A764] mb-4" />
        <h2 className="text-xl font-bold text-[#4F2D1F] mb-2">Please Sign In</h2>
        <p className="text-[#8B572A] text-center mb-4">
          Sign in to register as a delivery partner
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
        <h1 className="text-2xl md:text-3xl font-bold text-[#4F2D1F]">Become a Delivery Partner</h1>
        <p className="text-[#8B572A] mt-2">Join our network of delivery partners and earn money on your schedule</p>
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
                {index === 0 ? "Personal Information" : index === 1 ? "Vehicle Details" : "Work Preferences"}
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
            {currentStep === 1 ? "Personal Information" : 
             currentStep === 2 ? "Vehicle Details" : 
             "Work Preferences"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 ? "Provide your personal information for verification" : 
             currentStep === 2 ? "Tell us about your vehicle" : 
             "Set your availability and preferences"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName"
                    value={personalDetails.fullName} 
                    onChange={handlePersonalChange} 
                    placeholder="Enter your full name" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber"
                    value={personalDetails.phoneNumber} 
                    onChange={handlePersonalChange} 
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
                    value={personalDetails.email} 
                    onChange={handlePersonalChange} 
                    placeholder="Enter your email address" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idNumber">National ID Number</Label>
                  <Input 
                    id="idNumber" 
                    name="idNumber"
                    value={personalDetails.idNumber} 
                    onChange={handlePersonalChange} 
                    placeholder="Enter your national ID number" 
                  />
                  <p className="text-xs text-gray-500">Your ID will be verified before approval</p>
                </div>
              </>
            )}
            
            {/* Step 2: Vehicle Details */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select 
                    value={vehicleDetails.vehicleType}
                    onValueChange={handleVehicleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="foot">On Foot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {vehicleDetails.vehicleType !== 'foot' && vehicleDetails.vehicleType !== 'bicycle' && (
                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">License Plate Number</Label>
                    <Input 
                      id="licensePlate" 
                      name="licensePlate"
                      value={vehicleDetails.licensePlate} 
                      onChange={handleVehicleChange} 
                      placeholder="Enter license plate number" 
                    />
                  </div>
                )}
                
                {vehicleDetails.vehicleType !== 'foot' && (
                  <div className="space-y-2">
                    <Label htmlFor="vehicleColor">Vehicle Color</Label>
                    <Input 
                      id="vehicleColor" 
                      name="vehicleColor"
                      value={vehicleDetails.vehicleColor} 
                      onChange={handleVehicleChange} 
                      placeholder="Enter vehicle color" 
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="maxDistance">Maximum Delivery Distance (km)</Label>
                  <Input 
                    id="maxDistance" 
                    name="maxDistance"
                    type="number"
                    min="1"
                    max="50"
                    value={vehicleDetails.maxDistance} 
                    onChange={handleMaxDistanceChange} 
                  />
                  <p className="text-xs text-gray-500">How far are you willing to travel for deliveries?</p>
                </div>
              </>
            )}
            
            {/* Step 3: Work Preferences */}
            {currentStep === 3 && (
              <>
                <div className="space-y-4">
                  <h3 className="font-medium text-[#4F2D1F]">Availability</h3>
                  <p className="text-sm text-[#8B572A]">
                    Select the days you are available to work
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(workDetails.availableDays).map(([day, isAvailable]) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Switch 
                          id={day}
                          checked={isAvailable}
                          onCheckedChange={(checked) => handleDayChange(day, checked)}
                        />
                        <Label htmlFor={day} className="capitalize">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#FFF9F2] p-4 rounded-lg border border-[#E5A764]/30 mt-6">
                  <h3 className="font-medium text-[#4F2D1F] mb-2">Commission Structure</h3>
                  <p className="text-sm text-[#8B572A] mb-4">
                    Gebeta pays delivery partners 70% of the delivery fee charged to customers. 
                    Fees vary based on distance, with bonuses for busy hours and challenging 
                    weather conditions.
                  </p>
                  
                  <div className="flex items-start space-x-2 mb-4">
                    <Switch 
                      id="agreeToCommission"
                      checked={workDetails.agreeToCommission}
                      onCheckedChange={(checked) => handleSwitchChange("agreeToCommission", checked)}
                    />
                    <Label htmlFor="agreeToCommission" className="text-sm">
                      I understand and agree to the commission structure
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 mt-4">
                  <Switch 
                    id="agreeToTerms"
                    checked={workDetails.agreeToTerms}
                    onCheckedChange={(checked) => handleSwitchChange("agreeToTerms", checked)}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to the <a href="#" className="text-[#8B572A] underline">Terms and Conditions</a> and
                    understand that my application will be reviewed before approval.
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
                Submit Application
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default DeliveryPartnerRegistration;