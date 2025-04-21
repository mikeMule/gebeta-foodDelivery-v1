import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("0916182957");
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleLogin = () => {
    // Mock login - store phone number and navigate to OTP screen
    login({ phoneNumber });
    setLocation("/otp-verification");
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <motion.div 
            className="text-center mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-block bg-primary rounded-full p-3 mb-4">
              <svg viewBox="0 0 100 100" className="w-12 h-12">
                <path d="M30,40 L70,40 L60,70 L40,70 Z" fill="white"></path>
                <circle cx="50" cy="30" r="10" fill="white"></circle>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-neutral-800 font-dm-sans">Welcome back!</h1>
            <p className="text-neutral-600 mt-2">Sign in to continue to FoodDash</p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-800 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Icons.phone className="text-neutral-400" />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  className="pl-10 pr-4 py-6 border border-neutral-200 rounded-lg"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6"
              onClick={handleLogin}
            >
              Continue
            </Button>
          </motion.div>
          
          <motion.div 
            className="relative mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-neutral-50 px-4 text-sm text-neutral-500">or continue with</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 gap-4 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button variant="outline" className="flex items-center justify-center py-6 border border-neutral-200 rounded-lg hover:bg-neutral-100">
              <Icons.telegram className="text-[#0088cc] text-xl mr-2" />
              <span className="font-medium text-neutral-800">Telegram</span>
            </Button>
            
            <Button variant="outline" className="flex items-center justify-center py-6 border border-neutral-200 rounded-lg hover:bg-neutral-100">
              <Icons.instagram className="text-[#E1306C] text-xl mr-2" />
              <span className="font-medium text-neutral-800">Instagram</span>
            </Button>
          </motion.div>
          
          <motion.p 
            className="text-center text-sm text-neutral-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Don't have an account? <a href="#" className="text-primary font-medium">Sign up</a>
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
