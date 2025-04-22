import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Icons } from "@/lib/icons";
import { fadeIn, slideUp } from "@/lib/animation";

const Profile = () => {
  const { toast } = useToast();
  const { userData, updateProfile } = useAuth();
  
  // Personal information state
  const [name, setName] = useState(userData?.fullName || "");
  const [phone, setPhone] = useState(userData?.phoneNumber || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [location, setLocation] = useState(userData?.location || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // National ID state
  const [idNumber, setIdNumber] = useState(userData?.idNumber || "");
  const [idImage, setIdImage] = useState<File | null>(null);
  const [idImagePreview, setIdImagePreview] = useState<string | null>(null);
  const [isUploadingId, setIsUploadingId] = useState(false);
  
  // Profile settings and preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setIdImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle personal info submission
  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Update user profile in our context
      updateProfile({
        fullName: name,
        phoneNumber: phone,
        email: email,
        location: location
      });
      
      // In a real app, you would also call your API
      // await apiRequest("PATCH", "/api/user/profile", { name, phone, email, location });
      
      // Show a success message
      setTimeout(() => {
        toast({
          title: "Profile updated",
          description: "Your profile information has been successfully updated",
          variant: "default",
        });
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  // Handle ID submission
  const handleSubmitId = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingId(true);
    
    if (!idImage) {
      toast({
        title: "ID Image Required",
        description: "Please upload an image of your National ID card",
        variant: "destructive",
      });
      setIsUploadingId(false);
      return;
    }
    
    try {
      // In a real app, you would upload the image and ID number
      // const formData = new FormData();
      // formData.append("idImage", idImage);
      // formData.append("idNumber", idNumber);
      // await apiRequest("POST", "/api/user/national-id", formData);
      
      // For now, just show a success message
      setTimeout(() => {
        toast({
          title: "ID Uploaded",
          description: "Your National ID has been successfully uploaded for verification",
          variant: "default",
        });
        setIsUploadingId(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your ID. Please try again.",
        variant: "destructive",
      });
      setIsUploadingId(false);
    }
  };
  
  return (
    <motion.div 
      className="container max-w-4xl py-8 space-y-8"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <motion.div variants={slideUp} className="relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-md">
            <AvatarImage src={userData?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop"} />
            <AvatarFallback className="bg-[#E5A764] text-white text-xl">
              {name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
            <label htmlFor="profile-upload" className="cursor-pointer">
              <Icons.camera className="h-5 w-5 text-[#8B572A]" />
              <input id="profile-upload" type="file" accept="image/*" className="hidden" />
            </label>
          </div>
        </motion.div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#4F2D1F]">{name || 'Your Profile'}</h1>
          <div className="flex items-center mt-1 flex-wrap gap-2">
            <Badge variant="outline" className="bg-[#FFF9F2] text-[#8B572A] border-[#E5A764]">
              {userData?.userType === 'restaurant_owner' ? 'Restaurant Partner' : 'Customer'}
            </Badge>
            {userData?.idVerified && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Icons.checkCircle className="mr-1 h-3 w-3" /> Verified
              </Badge>
            )}
            <span className="text-sm text-[#8B572A]">{phone}</span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="id">ID Verification</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <motion.div variants={slideUp}>
            <Card className="border-[#E5A764]/20">
              <CardHeader className="bg-[#FFF9F2]/50">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmitInfo}>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[#4F2D1F]">Full Name</Label>
                      <div className="relative">
                        <Icons.user className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8B572A]/50" />
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder="Enter your full name" 
                          className="pl-10 border-[#E5A764]/30 focus:border-[#8B572A]"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[#4F2D1F]">Phone Number</Label>
                      <div className="relative">
                        <Icons.phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8B572A]/50" />
                        <Input 
                          id="phone" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          placeholder="Enter your phone number" 
                          className="pl-10 border-[#E5A764]/30 focus:border-[#8B572A]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#4F2D1F]">Email Address</Label>
                    <div className="relative">
                      <Icons.mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8B572A]/50" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Enter your email address" 
                        className="pl-10 border-[#E5A764]/30 focus:border-[#8B572A]"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-[#4F2D1F]">Delivery Address</Label>
                    <div className="relative">
                      <Icons.mapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8B572A]/50" />
                      <Input 
                        id="location" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        placeholder="Enter your delivery address" 
                        className="pl-10 border-[#E5A764]/30 focus:border-[#8B572A]"
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#8B572A] p-1 h-auto"
                        onClick={() => toast({
                          title: "Getting location",
                          description: "Using your current location",
                        })}
                      >
                        <Icons.locate className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-[#8B572A]/70">We'll use this address as your default delivery location</p>
                  </div>
                </CardContent>
                <CardFooter className="bg-[#FFF9F2]/30 flex flex-col sm:flex-row gap-3 border-t border-[#E5A764]/10">
                  <Button 
                    type="submit" 
                    className="bg-[#8B572A] hover:bg-[#4F2D1F] flex-1" 
                    isLoading={isSubmitting}
                    loadingText="Updating..."
                  >
                    <Icons.save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-[#8B572A] text-[#8B572A] hover:bg-[#E5A764]/10 flex-1"
                    onClick={() => {
                      setName(userData?.fullName || "");
                      setPhone(userData?.phoneNumber || "");
                      setEmail(userData?.email || "");
                      setLocation(userData?.location || "");
                    }}
                  >
                    Reset
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="id">
          <motion.div variants={slideUp}>
            <Card className="border-[#E5A764]/20">
              <CardHeader className="bg-[#FFF9F2]/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>National ID Verification</CardTitle>
                    <CardDescription>Upload your National ID to verify your identity</CardDescription>
                  </div>
                  {userData?.idVerified ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Icons.checkCircle className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <form onSubmit={handleSubmitId}>
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-[#4F2D1F]">National ID Number</Label>
                    <div className="relative">
                      <Icons.creditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8B572A]/50" />
                      <Input 
                        id="idNumber" 
                        value={idNumber} 
                        onChange={(e) => setIdNumber(e.target.value)} 
                        placeholder="Enter your ID number" 
                        className="pl-10 border-[#E5A764]/30 focus:border-[#8B572A]"
                      />
                    </div>
                    <p className="text-xs text-[#8B572A]/70">Enter your Ethiopian National ID number</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="idImage" className="text-[#4F2D1F]">Upload ID Image</Label>
                    <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor="idImage" 
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-[#E5A764]/50 bg-[#FFF9F2] hover:bg-[#E5A764]/10 transition-colors"
                      >
                        {idImagePreview ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                              src={idImagePreview} 
                              alt="ID Preview" 
                              className="h-full object-contain rounded-md" 
                            />
                            <button 
                              type="button"
                              className="absolute top-2 right-2 p-1 bg-white/80 rounded-full shadow-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                setIdImage(null);
                                setIdImagePreview(null);
                              }}
                            >
                              <Icons.x className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Icons.upload className="w-8 h-8 mb-3 text-[#8B572A]" />
                            <p className="mb-2 text-sm text-[#4F2D1F] text-center">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-[#8B572A] text-center">
                              PNG, JPG or JPEG (max. 5MB)
                            </p>
                          </div>
                        )}
                        <input
                          id="idImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-[#8B572A]/70">Make sure your ID is clearly visible and all details are readable</p>
                  </div>
                </CardContent>
                <CardFooter className="bg-[#FFF9F2]/30 border-t border-[#E5A764]/10">
                  <Button 
                    type="submit" 
                    className="bg-[#8B572A] hover:bg-[#4F2D1F] w-full" 
                    isLoading={isUploadingId}
                    loadingText="Uploading..."
                    disabled={userData?.idVerified}
                  >
                    <Icons.shield className="mr-2 h-4 w-4" />
                    {userData?.idVerified ? 'Already Verified' : 'Upload & Verify'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="settings">
          <motion.div variants={slideUp}>
            <Card className="border-[#E5A764]/20">
              <CardHeader className="bg-[#FFF9F2]/50">
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and settings</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-[#4F2D1F] mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[#4F2D1F]">Push Notifications</p>
                          <p className="text-sm text-[#8B572A]/70">Receive notifications about your orders</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-[#8B572A]">
                          <span className={`${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}></span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[#4F2D1F]">Email Updates</p>
                          <p className="text-sm text-[#8B572A]/70">Receive promotional offers and updates</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-[#E5A764]">
                          <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-[#E5A764]/20" />
                  
                  <div>
                    <h3 className="font-medium text-[#4F2D1F] mb-3">Privacy</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[#4F2D1F]">Location Services</p>
                          <p className="text-sm text-[#8B572A]/70">Allow app to access your location</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-[#8B572A]">
                          <span className={`${locationEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}></span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[#4F2D1F]">Data Sharing</p>
                          <p className="text-sm text-[#8B572A]/70">Share usage data to improve services</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-gray-200">
                          <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-[#E5A764]/20" />
                  
                  <div>
                    <h3 className="font-medium text-[#4F2D1F] mb-3">Payment Methods</h3>
                    <div className="p-4 border border-[#E5A764]/30 rounded-lg bg-[#FFF9F2]/50 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-md mr-3">
                          <Icons.creditCard className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="text-[#4F2D1F] font-medium">TeleBirr</p>
                          <p className="text-sm text-[#8B572A]/70">Connected to {phone}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#8B572A] text-[#8B572A] hover:bg-[#E5A764]/10">
                        Manage
                      </Button>
                    </div>
                    <div className="mt-3">
                      <Button variant="outline" className="border-dashed border-[#E5A764]/50 text-[#8B572A] hover:bg-[#E5A764]/10 w-full">
                        <Icons.plus className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-[#FFF9F2]/30 border-t border-[#E5A764]/10">
                <Button 
                  type="button" 
                  className="bg-[#8B572A] hover:bg-[#4F2D1F] w-full"
                  onClick={() => {
                    toast({
                      title: "Settings Saved",
                      description: "Your preferences have been updated successfully",
                    });
                  }}
                >
                  <Icons.save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Profile;