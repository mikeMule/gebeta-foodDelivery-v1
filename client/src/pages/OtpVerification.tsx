import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Icons } from "@/lib/icons";
import { containerVariants, itemVariants } from "@/lib/animation";

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
      className="min-h-screen flex flex-col bg-[#FFF9F2]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 py-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-[#4F2D1F] p-0 hover:bg-[#E5A764]/10"
          onClick={handleBackToLogin}
        >
          <Icons.chevronLeft className="mr-1" />
          <span>Back</span>
        </Button>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center px-6 pb-12">
        <motion.div 
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <div className="inline-block bg-[#8B572A] rounded-full p-4 mb-4 shadow-lg">
              <Icons.phone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#4F2D1F] mb-2 font-dm-sans">Verify your phone</h1>
            <p className="text-[#8B572A] mb-1">
              We've sent a verification code to
            </p>
            <p className="font-medium text-[#4F2D1F] text-lg">
              {userData?.phoneNumber}
            </p>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-md p-8 mb-6 border border-[#E5A764]/30"
          >
            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Input
                    type="text"
                    maxLength={1}
                    className="w-[60px] h-[70px] text-center text-2xl font-bold border-[#E5A764]/50 focus:border-[#8B572A] focus:ring-[#8B572A]"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={inputRefs[index]}
                  />
                </motion.div>
              ))}
            </div>
            
            <Button 
              className="w-full bg-[#8B572A] hover:bg-[#4F2D1F] text-white font-medium py-6 transition-colors"
              onClick={handleVerify}
            >
              Verify and Continue
            </Button>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <p className="text-[#8B572A]">
              Didn't receive code? <a href="#" className="text-[#C73030] font-medium">Resend</a>
            </p>
            <p className="text-[#8B572A]/70 mt-2 text-sm">
              For testing, use code: 1234
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OtpVerification;
