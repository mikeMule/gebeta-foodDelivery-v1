import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, HelpCircle } from 'lucide-react';

interface VoiceAssistantProps {
  orderStatus: string;
  trackingNumber: string;
  estimatedDeliveryTime: string;
  onClose?: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  orderStatus,
  trackingNumber,
  estimatedDeliveryTime,
  onClose
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Use a ref to store recognition instance across renders
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition when the component mounts
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript.toLowerCase();
          console.log('Transcript:', transcriptText);
          setTranscript(transcriptText);
          
          // Process the transcript
          processCommand(transcriptText);
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Process the voice command
  const processCommand = useCallback((command: string) => {
    setIsResponding(true);
    let responseText = '';
    
    // Check if the command contains these keywords
    if (command.includes('status') || command.includes('where is my order')) {
      responseText = `Your order is currently ${orderStatus}. The estimated delivery time is ${estimatedDeliveryTime}.`;
    }
    else if (command.includes('tracking') || command.includes('track')) {
      responseText = `Your tracking number is ${trackingNumber}.`;
    }
    else if (command.includes('delivery') || command.includes('time') || command.includes('when')) {
      responseText = `Your estimated delivery time is ${estimatedDeliveryTime}.`;
    }
    else if (command.includes('help') || command.includes('commands')) {
      setShowHelp(true);
      responseText = 'Here are some commands you can try: "What is my order status?", "What is my tracking number?", or "When will my order arrive?"';
    }
    else {
      responseText = "I'm sorry, I didn't understand. Try asking about your order status, tracking number, or delivery time.";
    }
    
    // Use speech synthesis to respond
    speakResponse(responseText);
    
    setResponse(responseText);
    
    // Reset responding state after a short delay
    setTimeout(() => {
      setIsResponding(false);
    }, 4000);
  }, [orderStatus, trackingNumber, estimatedDeliveryTime]);

  // Function to speak the response using the SpeechSynthesis API
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Function to start listening
  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
    } else {
      console.error('Speech recognition not supported');
      setResponse('Speech recognition is not supported in your browser.');
    }
  };

  // Function to stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Generate the message based on the current state
  const getMessage = () => {
    if (isListening) {
      return "I'm listening...";
    } 
    if (isResponding) {
      return response;
    }
    if (response) {
      return response;
    }
    
    return "Ask about your order by clicking the microphone button";
  };

  return (
    <motion.div 
      className="fixed bottom-24 right-4 z-50 max-w-[320px]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", bounce: 0.25 }}
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E5A764]/30">
        <div className="bg-[#8B572A] text-white p-3 flex justify-between items-center">
          <div className="flex items-center">
            <Mic className="mr-2 h-5 w-5" />
            <span className="font-medium">Gebeta Voice Assistant</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="p-4">
          <div className="min-h-[100px] flex flex-col items-center justify-center mb-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={getMessage()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center mb-3"
              >
                <p className="text-[#4F2D1F]">{getMessage()}</p>
                {transcript && (
                  <p className="text-sm text-gray-500 mt-2">You said: "{transcript}"</p>
                )}
              </motion.div>
            </AnimatePresence>
            
            <motion.div
              animate={isListening ? { 
                scale: [1, 1.2, 1], 
                backgroundColor: ['#E5A764', '#8B572A', '#E5A764'] 
              } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 cursor-pointer ${
                isListening ? 'bg-[#E5A764]' : 'bg-[#8B572A]'
              }`}
              onClick={isListening ? stopListening : startListening}
            >
              <Mic className="h-8 w-8 text-white" />
            </motion.div>
            
            <p className="text-xs text-gray-500">
              {isListening ? 'Tap to stop' : 'Tap to speak'}
            </p>
          </div>
          
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs bg-[#FFF9F2] p-3 rounded-lg text-[#8B572A]"
            >
              <p className="font-medium mb-1">Try these commands:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>"What is my order status?"</li>
                <li>"Track my order"</li>
                <li>"When will my food arrive?"</li>
                <li>"What's my tracking number?"</li>
              </ul>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#8B572A] mt-2 w-full text-xs" 
                onClick={() => setShowHelp(false)}
              >
                Hide Tips
              </Button>
            </motion.div>
          )}
          
          {!showHelp && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#8B572A] w-full text-xs" 
              onClick={() => setShowHelp(true)}
            >
              <HelpCircle className="mr-1 h-3 w-3" />
              Show Tips
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceAssistant;