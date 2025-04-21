import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Icons } from "@/lib/icons";

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
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#4F2D1F]">Profile Management</h1>
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="id">National ID Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitInfo}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your full name" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Enter your phone number" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email address" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="Enter your delivery address" 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="bg-[#8B572A] hover:bg-[#4F2D1F] w-full" 
                  isLoading={isSubmitting}
                  loadingText="Updating..."
                >
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="id">
          <Card>
            <CardHeader>
              <CardTitle>National ID Verification</CardTitle>
              <CardDescription>Upload your National ID to verify your identity</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitId}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idNumber">National ID Number</Label>
                  <Input 
                    id="idNumber" 
                    value={idNumber} 
                    onChange={(e) => setIdNumber(e.target.value)} 
                    placeholder="Enter your ID number" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idImage">Upload ID Image</Label>
                  <div className="flex items-center justify-center w-full">
                    <label 
                      htmlFor="idImage" 
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer border-[#E5A764]/50 bg-[#FFF9F2] hover:bg-[#E5A764]/10"
                    >
                      {idImagePreview ? (
                        <img 
                          src={idImagePreview} 
                          alt="ID Preview" 
                          className="h-full object-contain" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Icons.map className="w-8 h-8 mb-2 text-[#8B572A]" />
                          <p className="mb-2 text-sm text-[#4F2D1F]">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-[#8B572A]">
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
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="bg-[#8B572A] hover:bg-[#4F2D1F] w-full" 
                  isLoading={isUploadingId}
                  loadingText="Uploading..."
                >
                  Upload & Verify
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;