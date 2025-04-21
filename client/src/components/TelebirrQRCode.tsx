import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { TelebirrLogo, TelebirrIcon } from './TelebirrLogo';

interface TelebirrQRCodeProps {
  amount: number;
  merchantId?: string;
  description?: string;
  onPaymentComplete?: () => void;
}

const TelebirrQRCode: React.FC<TelebirrQRCodeProps> = ({ 
  amount, 
  merchantId = "GEBETA2025", 
  description = "Food order payment",
  onPaymentComplete
}) => {
  const [, setLocation] = useLocation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [expiresIn, setExpiresIn] = useState(300); // 5 minutes in seconds
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'expired'>('pending');
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  
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
    
    // Using a slight delay to avoid any rendering issues
    const timer = setTimeout(() => {
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
    }, 500);
    
    return () => clearTimeout(timer);
  }, [paymentString]);
  
  // Setup countdown timer
  useEffect(() => {
    if (expiresIn <= 0) {
      setPaymentStatus('expired');
      return;
    }
    
    const timer = setInterval(() => {
      setExpiresIn(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresIn]);
  
  // Simulate payment processing (in a real app, you would listen for webhooks or poll an API)
  useEffect(() => {
    // Simulate payment after 5 seconds of displaying the QR code
    if (paymentStatus === 'pending' && !isGenerating && qrCodeUrl) {
      const simulatePaymentTimer = setTimeout(() => {
        setPaymentStatus('processing');
        
        // After 2 second of processing, complete the payment
        const completeTimer = setTimeout(() => {
          setPaymentStatus('completed');
          setTrackingNumber(Math.random().toString(36).substring(2, 10).toUpperCase());
          setShowTrackingInfo(true);
          
          if (onPaymentComplete) {
            onPaymentComplete();
          }
        }, 2000);
        
        return () => clearTimeout(completeTimer);
      }, 5000);
      
      return () => clearTimeout(simulatePaymentTimer);
    }
  }, [paymentStatus, isGenerating, qrCodeUrl, onPaymentComplete]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Generate a static transaction ID that won't change on re-renders
  const transactionId = React.useMemo(() => 
    Math.random().toString(36).substring(2, 10).toUpperCase(), 
  []);
  
  // Handle tracking button click
  const handleTrackOrder = useCallback(() => {
    setLocation("/order-success");
  }, [setLocation]);
  
  return (
    <div className="flex flex-col items-center">
      {paymentStatus === 'completed' && showTrackingInfo ? (
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.check className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-[#4F2D1F] mb-2">
            Payment Successful!
          </h3>
          
          <p className="text-[#8B572A] mb-6">
            Your order is now being processed
          </p>
          
          <div className="border border-[#E5A764]/30 rounded-lg bg-[#FFF9F2] p-4 mb-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5A764]/20">
              <div className="text-left">
                <p className="text-sm text-[#8B572A]">Amount Paid</p>
                <p className="text-lg font-bold text-[#4F2D1F]">Birr {formattedAmount}</p>
              </div>
              <div className="w-10 h-10 bg-[#E5A764]/20 rounded-full flex items-center justify-center">
                <Icons.creditCard className="w-5 h-5 text-[#8B572A]" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-[#8B572A]">Tracking Number</p>
                <p className="text-lg font-bold text-[#4F2D1F]">{trackingNumber}</p>
              </div>
              <div className="w-10 h-10 bg-[#E5A764]/20 rounded-full flex items-center justify-center">
                <Icons.mapPin className="w-5 h-5 text-[#8B572A]" />
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-[#8B572A] hover:bg-[#4F2D1F] text-white font-medium py-3"
            onClick={handleTrackOrder}
          >
            <Icons.mapPin className="mr-2 h-5 w-5" />
            Track Your Order
          </Button>
        </div>
      ) : paymentStatus === 'processing' ? (
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8B572A] mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-[#4F2D1F] mb-2">
            Processing Payment...
          </h3>
          <p className="text-sm text-[#8B572A] mb-2">
            Please wait while we verify your payment
          </p>
          <p className="text-sm text-[#8B572A] mb-2">
            Transaction ID: {transactionId}
          </p>
        </div>
      ) : paymentStatus === 'expired' ? (
        <div className="text-center p-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.close className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#4F2D1F] mb-2">
            Payment Expired
          </h3>
          <p className="text-sm text-[#8B572A] mb-6">
            This QR code has expired. Please refresh to generate a new one.
          </p>
          <Button 
            className="bg-[#8B572A] hover:bg-[#4F2D1F] text-white"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      ) : (
        // Default payment pending view with QR code
        <>
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
          
          <div className="relative border-4 border-[#8B572A] rounded-lg p-2 bg-white mb-3">
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
          </div>
          
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
                  <Icons.scan className="h-5 w-5 text-[#8B572A]" />
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
              Transaction ID: {transactionId}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default TelebirrQRCode;