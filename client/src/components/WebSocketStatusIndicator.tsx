import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocketManager, ConnectionState } from "@/lib/WebSocketManager";
import NotificationBellNew from "./NotificationBellNew";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

const WebSocketStatusIndicator: React.FC = () => {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const userData = auth.userData || auth.user;
  const { connectionState } = useWebSocketManager();
  
  if (!isAuthenticated) {
    return null;
  }
  
  // If connected, show the NotificationBell
  if (connectionState === ConnectionState.CONNECTED) {
    return (
      <NotificationBellNew 
        userId={userData?.id} 
        userType={userData?.userType}
        restaurantId={(userData as any)?.restaurantId}
      />
    );
  }
  
  // If connecting or disconnected, show status indicator
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={cn(
        "flex items-center space-x-1 text-xs",
        connectionState === ConnectionState.CONNECTING 
          ? "text-yellow-500" 
          : "text-red-500"
      )}
    >
      {connectionState === ConnectionState.CONNECTING ? (
        <>
          <div className="animate-spin h-3 w-3 border-2 border-current rounded-full border-t-transparent mr-1" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          <span>Offline</span>
        </>
      )}
    </Button>
  );
};

export default WebSocketStatusIndicator;