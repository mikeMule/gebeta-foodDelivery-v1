import React, { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VoiceControlProps {
  onUpdateOrderStatus: (orderId: string, status: any) => void;
  orders: any[];
}

export function VoiceControl({ onUpdateOrderStatus, orders }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const commands = [
    {
      command: 'start preparing order *',
      callback: (orderId: string) => {
        handleOrderCommand(orderId, 'preparing');
      },
    },
    {
      command: 'prepare order *',
      callback: (orderId: string) => {
        handleOrderCommand(orderId, 'preparing');
      },
    },
    {
      command: 'mark order * as ready',
      callback: (orderId: string) => {
        handleOrderCommand(orderId, 'ready_for_pickup');
      },
    },
    {
      command: 'order * is ready',
      callback: (orderId: string) => {
        handleOrderCommand(orderId, 'ready_for_pickup');
      },
    },
    {
      command: 'assign delivery for order *',
      callback: (orderId: string) => {
        handleOrderCommand(orderId, 'out_for_delivery');
      },
    },
    {
      command: 'deliver order *',
      callback: (orderId: string) => {
        handleOrderCommand(orderId, 'out_for_delivery');
      },
    },
    {
      command: 'show commands',
      callback: () => {
        setHelpDialogOpen(true);
        setLastCommand('show commands');
        setLastResponse('Showing available voice commands');
      },
    },
    {
      command: 'help',
      callback: () => {
        setHelpDialogOpen(true);
        setLastCommand('help');
        setLastResponse('Showing help and available commands');
      },
    },
  ];

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  // Check if browser supports speech recognition
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setSpeechSupported(false);
    }
  }, [browserSupportsSpeechRecognition]);

  // Cleanup
  useEffect(() => {
    return () => {
      SpeechRecognition.abortListening();
    };
  }, []);

  const handleOrderCommand = useCallback((orderId: string, status: string) => {
    const orderIdClean = orderId.replace(/number/gi, '').trim();
    
    // Look for the order in the available orders
    const matchingOrder = orders.find(order => 
      order.id.toString() === orderIdClean || 
      order.id.toString().includes(orderIdClean)
    );
    
    if (matchingOrder) {
      onUpdateOrderStatus(matchingOrder.id, status);
      setLastCommand(`${status.replace('_', ' ')} order ${matchingOrder.id}`);
      setLastResponse(`Order #${matchingOrder.id} status updated to ${status.replace('_', ' ')}`);
    } else {
      setLastCommand(`${status.replace('_', ' ')} order ${orderIdClean}`);
      setLastResponse(`Order #${orderIdClean} not found`);
    }
  }, [orders, onUpdateOrderStatus]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
      resetTranscript();
    }
  }, [isListening, resetTranscript]);

  if (!speechSupported) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Voice Control Not Available</AlertTitle>
        <AlertDescription>
          Your browser doesn't support speech recognition. Try using Chrome for voice controls.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="flex items-center mb-4 space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={toggleListening}
                className={isListening ? "bg-red-500 hover:bg-red-600" : "bg-[#8B572A] hover:bg-[#4F2D1F]"}
                size="sm"
              >
                {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                {isListening ? "Stop Voice Control" : "Start Voice Control"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isListening ? "Click to stop voice recognition" : "Click to start voice recognition"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setHelpDialogOpen(true)}
                className="border-[#E5A764] text-[#8B572A]"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Voice Commands
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show available voice commands</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {isListening && (
        <div className="mb-4 p-3 border rounded-md bg-gray-50">
          <div className="flex items-center mb-2">
            <div className={`h-3 w-3 rounded-full ${listening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'} mr-2`}></div>
            <span className={`text-sm ${listening ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
              {listening ? 'Listening...' : 'Voice recognition paused'}
            </span>
          </div>
          
          <div className="text-sm text-gray-500 mb-2">
            <span className="font-medium">Heard: </span>
            {transcript || "(Say something...)"}
          </div>
          
          {lastCommand && lastResponse && (
            <div className="text-sm border-t pt-2 mt-2">
              <div className="flex items-start">
                <Badge variant="outline" className="mr-2 mt-0.5">Last Command</Badge>
                <div>
                  <div className="text-[#8B572A] font-medium">{lastCommand}</div>
                  <div className="text-gray-600">{lastResponse}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Command Help</DialogTitle>
            <DialogDescription>
              Use these commands to control the restaurant dashboard with your voice
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Order Status Commands</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Badge className="bg-blue-100 text-blue-700 mr-2 mt-0.5">Preparing</Badge>
                  <div>
                    <div className="font-medium">Start preparing order #[number]</div>
                    <div className="text-gray-500">Example: "Start preparing order 123"</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Badge className="bg-purple-100 text-purple-700 mr-2 mt-0.5">Ready</Badge>
                  <div>
                    <div className="font-medium">Mark order #[number] as ready</div>
                    <div className="text-gray-500">Example: "Mark order 123 as ready"</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Badge className="bg-amber-100 text-amber-700 mr-2 mt-0.5">Deliver</Badge>
                  <div>
                    <div className="font-medium">Assign delivery for order #[number]</div>
                    <div className="text-gray-500">Example: "Assign delivery for order 123"</div>
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Alternative Commands</h4>
              <ul className="space-y-1 text-sm">
                <li>"Prepare order #[number]"</li>
                <li>"Order #[number] is ready"</li>
                <li>"Deliver order #[number]"</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Help & System Commands</h4>
              <ul className="space-y-1 text-sm">
                <li>"Show commands" - Display this help dialog</li>
                <li>"Help" - Display this help dialog</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm">
              <p className="font-medium">Tips for Best Results</p>
              <ul className="list-disc list-inside text-amber-700 mt-1">
                <li>Speak clearly and at a normal pace</li>
                <li>Use the exact order number</li>
                <li>Minimize background noise when possible</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}