import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["1", "2", "3", "4"]);
  const [, setLocation] = useLocation();
  const { userData, verifyOtp } = useAuth();
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    // Auto focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    // Mock OTP verification
    verifyOtp(otp.join(""));
    setLocation("/home");
  };

  const handleBackToLogin = () => {
    setLocation("/login");
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 py-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-neutral-800 p-0"
          onClick={handleBackToLogin}
        >
          <i className="ri-arrow-left-line mr-2"></i>
          <span>Back</span>
        </Button>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center px-6 pb-12">
        <motion.div 
          className="w-full max-w-md text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-neutral-800 mb-2 font-dm-sans">Verify your phone</h1>
          <p className="text-neutral-600 mb-8">
            We've sent a code to <br />
            <span className="font-medium">{userData?.phoneNumber}</span>
          </p>
          
          <div className="flex justify-center gap-2 mb-8">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
                maxLength={1}
                className="w-[50px] h-[60px] text-center text-xl font-bold"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={inputRefs[index]}
              />
            ))}
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6 mb-6"
            onClick={handleVerify}
          >
            Verify and Continue
          </Button>
          
          <p className="text-neutral-600">
            Didn't receive code? <a href="#" className="text-primary">Resend</a>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OtpVerification;
