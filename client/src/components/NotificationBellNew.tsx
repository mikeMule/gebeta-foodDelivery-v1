import React, { useState, useEffect, useCallback, useRef } from "react";
import { BellRing, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  WebSocketManager, 
  useWebSocketManager, 
  ConnectionState,
  WebSocketSubscription
} from "@/lib/WebSocketManager";

// Define a Notification type
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

interface NotificationBellProps {
  userId?: number;
  userType?: string;
  restaurantId?: number;
}

const STORAGE_KEY = "gebeta_notifications";

const NotificationBellNew: React.FC<NotificationBellProps> = ({
  userId,
  userType,
  restaurantId
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const subscriptionIdRef = useRef<string>(`notification_bell_${Date.now()}`);
  
  // Initialize WebSocket connection through the manager
  const { connectionState, subscribe, sendMessage } = useWebSocketManager({
    userId,
    userType,
    restaurantId
  });
  
  // Load notifications from localStorage on mount
  useEffect(() => {
    const storageKey = `${STORAGE_KEY}_${userId || ''}_${userType || ''}_${restaurantId || ''}`;
    try {
      const storedNotifications = localStorage.getItem(storageKey);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error("Error loading notifications from localStorage:", error);
    }
  }, [userId, userType, restaurantId]);
  
  // Persist notifications to localStorage
  const persistNotifications = useCallback((notifs: Notification[]) => {
    const storageKey = `${STORAGE_KEY}_${userId || ''}_${userType || ''}_${restaurantId || ''}`;
    localStorage.setItem(storageKey, JSON.stringify(notifs));
  }, [userId, userType, restaurantId]);
  
  // Update connection status when it changes
  useEffect(() => {
    setConnectionStatus(connectionState);
  }, [connectionState]);
  
  // Subscribe to WebSocket messages
  useEffect(() => {
    const subscription: WebSocketSubscription = {
      id: subscriptionIdRef.current,
      
      onConnect: () => {
        console.log('NotificationBell: WebSocket connected');
      },
      
      onDisconnect: () => {
        console.log('NotificationBell: WebSocket disconnected');
      },
      
      onMessage: (data) => {
        // Handle the received notification
        if (data && data.type && data.title) {
          // Add to notifications array if it has an ID
          if (data.id) {
            // Check if we already have this notification
            if (!notifications.some(n => n.id === data.id)) {
              const newNotifications = [data, ...notifications];
              setNotifications(newNotifications);
              persistNotifications(newNotifications);
              
              // Play notification sound
              playNotificationSound();
            }
          }
          
          // Show toast notification
          toast({
            title: data.title,
            description: data.message,
            variant: data.type.includes('error') ? 'destructive' : 'default',
          });
        }
      }
    };
    
    // Subscribe and get the unsubscribe function
    const unsubscribe = subscribe(subscription);
    
    // Cleanup: unsubscribe when component unmounts
    return unsubscribe;
  }, [subscribe, notifications, persistNotifications, toast]);
  
  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Check if notification sound exists (using fetch to check existence)
      fetch('/notification-sound.mp3', { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.5; // Set volume to 50%
            audio.play().catch(err => console.error('Error playing notification sound:', err));
          }
        })
        .catch(() => {
          console.log('Notification sound file not found');
        });
    } catch (error) {
      console.error('Error with notification sound:', error);
    }
  }, []);
  
  // Mark a notification as read
  const markAsRead = useCallback((notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    persistNotifications(updatedNotifications);
  }, [notifications, persistNotifications]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    persistNotifications(updatedNotifications);
  }, [notifications, persistNotifications]);
  
  // Clear a notification by id
  const clearNotification = useCallback((notificationId: string) => {
    const filtered = notifications.filter(n => n.id !== notificationId);
    setNotifications(filtered);
    persistNotifications(filtered);
  }, [notifications, persistNotifications]);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    persistNotifications([]);
  }, [persistNotifications]);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Animate the bell when a new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);
  
  // Format the timestamp to a readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {notifications.length > 0 ? (
            <BellRing 
              className={cn(
                "h-5 w-5", 
                animating && "animate-bounce text-primary",
                connectionStatus !== ConnectionState.CONNECTED && "text-gray-400"
              )} 
            />
          ) : (
            <Bell className={cn(
              "h-5 w-5",
              connectionStatus !== ConnectionState.CONNECTED && "text-gray-400"
            )} />
          )}
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 p-0"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px]">
        <DropdownMenuLabel className="flex justify-between items-center">
          <div className="flex items-center">
            <span>Notifications</span>
            {connectionStatus !== ConnectionState.CONNECTED && (
              <Badge 
                variant="outline" 
                className="ml-2 text-xs bg-yellow-100 text-yellow-700"
              >
                {connectionStatus === ConnectionState.CONNECTING ? 'Connecting...' : 'Offline'}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllAsRead()}
                className="text-xs h-8"
              >
                Mark all read
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => clearAllNotifications()}
                className="text-xs h-8"
              >
                Clear all
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No notifications
          </div>
        ) : (
          <>
            {notifications.slice(0, 5).map((notif, index) => (
              <DropdownMenuItem 
                key={index} 
                className={cn(
                  "flex flex-col items-start p-3 cursor-default hover:bg-accent",
                  !notif.read && "bg-muted/40"
                )}
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mr-1.5" />
                    )}
                    <span className={cn("font-medium", !notif.read && "font-semibold")}>{notif.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(notif.timestamp)}</span>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">{notif.message}</p>
                <div className="flex justify-end w-full mt-1 space-x-2">
                  {!notif.read && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs" 
                      onClick={() => markAsRead(notif.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs" 
                    onClick={() => clearNotification(notif.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
            {notifications.length > 5 && (
              <DropdownMenuItem className="text-center py-2 text-primary">
                +{notifications.length - 5} more
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBellNew;