import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

interface WebSocketOptions {
  userId?: number;
  userType?: string;
  restaurantId?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  retryInterval?: number;
}

const STORAGE_KEY = 'gebeta_notifications';

export const useWebSocket = (options: WebSocketOptions = {}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  // Load notifications from localStorage on initial render
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const storageKey = `${STORAGE_KEY}_${options.userId || ''}_${options.userType || ''}_${options.restaurantId || ''}`;
    const storedNotifications = localStorage.getItem(storageKey);
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  });
  
  const {
    userId,
    userType,
    restaurantId,
    onMessage,
    onConnect,
    onDisconnect,
    retryInterval = 5000
  } = options;
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Authenticate the connection
      if (userId || userType || restaurantId) {
        newSocket.send(JSON.stringify({
          type: 'authenticate',
          userId,
          userType,
          restaurantId
        }));
      }
      
      onConnect?.();
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      onDisconnect?.();
      
      // Attempt to reconnect after delay
      setTimeout(() => {
        if (document.visibilityState !== 'hidden') {
          connect();
        }
      }, retryInterval);
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'authentication_success') {
          console.log('WebSocket authenticated successfully');
        } else {
          // For notification messages
          setLastMessage(data);
          
          // Add to notifications array if it's a notification
          if (data.type && data.title && data.message) {
            const newNotifications = [data, ...notifications];
            setNotifications(newNotifications);
            
            // Persist to localStorage
            const storageKey = `${STORAGE_KEY}_${userId || ''}_${userType || ''}_${restaurantId || ''}`;
            localStorage.setItem(storageKey, JSON.stringify(newNotifications));
          }
          
          // Call custom handler if provided
          onMessage?.(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      newSocket.close();
    };
  }, [userId, userType, restaurantId, onConnect, onDisconnect, onMessage, retryInterval]);
  
  // Connect on initial render
  useEffect(() => {
    connect();
    
    // Add visibility change listener to reconnect when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        connect();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socket) {
        socket.close();
      }
    };
  }, [connect, isConnected, socket]);
  
  // Send message helper
  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    }
    return false;
  }, [socket, isConnected]);
  
  // Persist notifications to localStorage
  const persistNotifications = useCallback((notifications: Notification[]) => {
    const storageKey = `${STORAGE_KEY}_${userId || ''}_${userType || ''}_${restaurantId || ''}`;
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [userId, userType, restaurantId]);

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
  
  return {
    socket,
    isConnected,
    lastMessage,
    notifications,
    sendMessage,
    clearNotification,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
    connect
  };
};