import { useState, useEffect, useCallback } from 'react';

interface WebSocketOptions {
  userId?: number;
  userType?: string;
  restaurantId?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  retryInterval?: number;
}

export const useWebSocket = (options: WebSocketOptions = {}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  
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
            setNotifications(prev => [data, ...prev]);
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
  
  // Clear a notification by id
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  return {
    socket,
    isConnected,
    lastMessage,
    notifications,
    sendMessage,
    clearNotification,
    clearAllNotifications,
    connect
  };
};