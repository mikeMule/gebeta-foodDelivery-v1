import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { Icons } from '@/lib/icons';
import { TelebirrLogo, TelebirrIcon } from './TelebirrLogo';

interface TelebirrQRCodeProps {
  amount: number;
  merchantId?: string;
  description?: string;
}

const TelebirrQRCode: React.FC<TelebirrQRCodeProps> = ({ 
  amount, 
  merchantId = "GEBETA2025", 
  description = "Food order payment" 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [expiresIn, setExpiresIn] = useState(300); // 5 minutes in seconds
  
  // Format the amount to have 2 decimal places
  const formattedAmount = amount.toFixed(2);
  
  // Create payment data for QR code
  const paymentData = {
    m: merchantId,
    a: formattedAmount,
    t: new Date().getTime(),
    d: description
  };
  
  // Convert to JSON string
  const paymentString = JSON.stringify(paymentData);
  
  // Generate QR code on mount
  useEffect(() => {
    setIsGenerating(true);
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(paymentString, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 200,
          color: {
            dark: '#8B572A',  // Ethiopian-themed brown for dots
            light: '#FFF'     // White background
          }
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Error generating QR code:", err);
      } finally {
        setIsGenerating(false);
      }
    };
    
    generateQR();
  }, [paymentString]);
  
  // Setup countdown timer
  useEffect(() => {
    if (expiresIn <= 0) return;
    
    const timer = setInterval(() => {
      setExpiresIn(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresIn]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-center">
        <div className="mx-auto mb-2">
          <TelebirrLogo />
        </div>
        <h3 className="text-lg font-medium mb-1">
          Pay with TeleBirr
        </h3>
        <p className="text-sm text-neutral-600 mb-3">
          Scan this QR code with your TeleBirr app
        </p>
      </div>
      
      <motion.div 
        className="relative border-4 border-[#8B572A] rounded-lg p-2 bg-white mb-3"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {isGenerating ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B572A]"></div>
          </div>
        ) : (
          <>
            <img 
              src={qrCodeUrl} 
              alt="TeleBirr QR Code" 
              className="w-[200px] h-[200px]"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-lg border-2 border-[#8B572A]">
              <TelebirrIcon />
            </div>
          </>
        )}
      </motion.div>
      
      <div className="text-center">
        <p className="font-bold text-xl text-[#8B572A] mb-1">
          Birr {formattedAmount}
        </p>
        <p className="text-xs text-neutral-500 mb-3 flex items-center justify-center">
          <span className="inline-flex items-center">
            <Icons.clock className="h-3 w-3 mr-1" />
            Expires in {formatTime(expiresIn)}
          </span>
        </p>
        
        <div className="flex justify-center gap-4 text-sm mb-2">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#E5A764]/20 flex items-center justify-center mb-1">
              <Icons.phone className="h-5 w-5 text-[#8B572A]" />
            </div>
            <span className="text-xs">Open App</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#E5A764]/20 flex items-center justify-center mb-1">
              <svg 
                className="h-5 w-5 text-[#8B572A]"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <path d="M8 7v.01" />
                <path d="M16 7v.01" />
                <path d="M8 16h.01" />
                <path d="M16 16h.01" />
                <path d="M12 12h.01" />
                <path d="M7 12h.01" />
                <path d="M12 7h.01" />
                <path d="M17 12h.01" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <span className="text-xs">Scan QR</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#E5A764]/20 flex items-center justify-center mb-1">
              <Icons.check className="h-5 w-5 text-[#8B572A]" />
            </div>
            <span className="text-xs">Confirm</span>
          </div>
        </div>
        
        <p className="text-xs text-neutral-500 mt-2">
          Transaction ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default TelebirrQRCode;