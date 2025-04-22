import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/lib/useWebSocket';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface NotificationBellProps {
  userId?: number;
  userType?: string;
  restaurantId?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  userType,
  restaurantId
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  // Use a more resilient WebSocket connection with status tracking
  const { 
    notifications, 
    clearNotification, 
    clearAllNotifications, 
    markAsRead, 
    markAllAsRead,
    isConnected,
    connect
  } = useWebSocket({
    userId,
    userType,
    restaurantId,
    onConnect: () => {
      console.log('NotificationBell: WebSocket connected successfully');
      setConnectionStatus('connected');
    },
    onDisconnect: () => {
      console.log('NotificationBell: WebSocket disconnected');
      setConnectionStatus('disconnected');
    },
    onMessage: (data) => {
      // Update connection status for pong messages
      if (data.type === 'pong') {
        setConnectionStatus('connected');
        return; // Don't process pongs further
      }
      
      // Play sound for new notifications
      if (data.type && data.title) {
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
        
        // Show toast notification
        toast({
          title: data.title,
          description: data.message,
          variant: data.type.includes('error') ? 'destructive' : 'default',
        });
      }
    }
  });
  
  // Attempt to reconnect if disconnected
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      // Try to reconnect after a short delay
      const timer = setTimeout(() => {
        console.log('NotificationBell: Attempting to reconnect WebSocket');
        connect();
        setConnectionStatus('connecting');
      }, 5000); // Wait 5 seconds before reconnecting
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, connect]);
  
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
                animating && "animate-bounce text-primary"
              )} 
            />
          ) : (
            <Bell className="h-5 w-5" />
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
          <span>Notifications</span>
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

export default NotificationBell;