import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { containerVariants, itemVariants } from "@/lib/animation";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("0916182957");
  const [, setLocation] = useLocation();
  const { login, verifyOtp } = useAuth();

  const handleLogin = () => {
    // Mock login - store phone number and navigate to OTP screen
    login({ phoneNumber });
    setLocation("/otp-verification");
  };

  const handleSocialLogin = (provider: string) => {
    // In a real app, this would initiate OAuth flow
    console.log(`Login with ${provider}`);
    
    // Login and verify in one step for social login
    login({ 
      phoneNumber: "0916182957",
      userType: "customer", 
      fullName: `Test ${provider} User` 
    });
    
    // Complete verification to properly set isAuthenticated flag
    verifyOtp("1234");
    
    setLocation("/home");
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-[#FFF9F2]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Side - Authentication Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <motion.div 
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="text-center mb-10"
              variants={itemVariants}
            >
              <div className="inline-block bg-[#8B572A] rounded-full p-4 mb-4 shadow-lg">
                <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Ethiopian injera with food toppings - simplified version */}
                  <circle cx="50" cy="50" r="35" fill="#E5A764" />
                  <circle cx="40" cy="45" r="6" fill="#C73030" />
                  <circle cx="60" cy="45" r="5" fill="#4CAF50" />
                  <circle cx="50" cy="60" r="6" fill="#8D6E63" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#4F2D1F] font-dm-sans">Welcome to Gebeta</h1>
              <p className="text-[#8B572A] mt-2">Sign in to enjoy authentic Ethiopian cuisine</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-md p-6 mb-6 border border-[#E5A764]/30"
              variants={itemVariants}
            >
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-[#4F2D1F] mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Icons.phone className="text-[#8B572A]" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-10 pr-4 py-6 border border-[#E5A764]/50 rounded-lg"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full bg-[#8B572A] hover:bg-[#4F2D1F] text-white font-medium py-6 transition-colors"
                onClick={handleLogin}
              >
                Continue
              </Button>
            </motion.div>
            
            <motion.div 
              className="relative mb-6"
              variants={itemVariants}
            >
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-[#E5A764]/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#FFF9F2] px-4 text-sm text-[#8B572A]">or continue with</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-2 gap-4 mb-8"
              variants={itemVariants}
            >
              <Button 
                variant="outline" 
                className="flex items-center justify-center py-6 border border-[#E5A764]/50 rounded-lg hover:bg-[#E5A764]/10 transition-colors"
                onClick={() => handleSocialLogin('Telegram')}
              >
                <Icons.telegram className="text-[#0088cc] text-xl mr-2" />
                <span className="font-medium text-[#4F2D1F]">Telegram</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center py-6 border border-[#E5A764]/50 rounded-lg hover:bg-[#E5A764]/10 transition-colors"
                onClick={() => handleSocialLogin('Instagram')}
              >
                <Icons.instagram className="text-[#E1306C] text-xl mr-2" />
                <span className="font-medium text-[#4F2D1F]">Instagram</span>
              </Button>
            </motion.div>
            
            <motion.p 
              className="text-center text-sm text-[#8B572A]"
              variants={itemVariants}
            >
              Don't have an account? <a href="#" className="text-[#C73030] font-medium">Sign up</a>
            </motion.p>
          </motion.div>
        </div>

        {/* Right Side - Hero Section */}
        <motion.div 
          className="hidden md:flex md:w-1/2 bg-[#4F2D1F] items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-black opacity-20 z-10"></div>
          
          <div 
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop')",
              backgroundSize: "cover" 
            }}
          ></div>
          
          <div className="relative z-20 text-white text-center max-w-md p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <h2 className="text-4xl font-bold mb-4">Authentic Ethiopian Cuisine</h2>
              <p className="text-lg mb-6">Experience the rich flavors and traditions of Ethiopia delivered right to your door</p>
              <ul className="text-left list-none space-y-2 mb-8">
                <li className="flex items-center">
                  <div className="mr-2 text-[#E5A764]"><Icons.check /></div>
                  <span>Authentic ingredients and recipes</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 text-[#E5A764]"><Icons.check /></div>
                  <span>Fast delivery across the city</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 text-[#E5A764]"><Icons.check /></div>
                  <span>Support local Ethiopian restaurants</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
