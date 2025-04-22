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

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  userType,
  restaurantId
}) => {
  const { notifications, clearNotification, clearAllNotifications } = useWebSocket({
    userId,
    userType,
    restaurantId,
    onMessage: (data) => {
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
  
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  // Animate the bell when a new notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notifications.length]);
  
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
          {notifications.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 p-0"
              variant="destructive"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px]">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => clearAllNotifications()}
              className="text-xs h-8"
            >
              Clear all
            </Button>
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
                className="flex flex-col items-start p-3 cursor-default hover:bg-accent"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex justify-between w-full">
                  <span className="font-medium">{notif.title}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(notif.timestamp)}</span>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">{notif.message}</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-1 h-auto p-0 text-xs self-end" 
                  onClick={() => clearNotification(notif.id)}
                >
                  Dismiss
                </Button>
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