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
    try {
      // Prevent multiple connection attempts if already connecting or connected
      if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
        console.log('WebSocket already connecting or connected');
        return () => {};
      }
      
      // Use either explicitly defined URL or fallback to auto-detection
      let wsUrl;
      
      if (import.meta.env.VITE_WEBSOCKET_URL) {
        // Use explicitly defined WebSocket URL if available
        wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      } else {
        // Otherwise, construct it from current URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        wsUrl = `${protocol}//${host}/ws`;
      }
      
      console.log(`Attempting WebSocket connection to ${wsUrl}`);
      
      let connectionAttempts = 0;
      const maxAttempts = 5; // Increased from 3 to 5
      let newSocket: WebSocket | null = null;
      let connectionTimeout: number | null = null;
      let pingInterval: number | null = null;
      
      // Create a connection attempt function
      const attemptConnection = () => {
        // Prevent excessive reconnection attempts
        if (connectionAttempts >= maxAttempts) {
          console.log(`Exceeded maximum connection attempts (${maxAttempts})`);
          // Reset attempts after a longer delay
          setTimeout(() => {
            connectionAttempts = 0;
            attemptConnection();
          }, retryInterval * 2);
          return;
        }
        
        connectionAttempts++;
        console.log(`WebSocket connection attempt ${connectionAttempts}/${maxAttempts}`);
        
        // Create a new socket
        newSocket = new WebSocket(wsUrl);
        
        // Set a timeout to detect connection issues - longer timeout
        const timeoutId = window.setTimeout(() => {
          if (newSocket && newSocket.readyState !== WebSocket.OPEN) {
            console.log('WebSocket connection timeout, closing socket');
            newSocket.close();
            
            // Try again after delay, if not exceeding max attempts
            if (connectionAttempts < maxAttempts) {
              setTimeout(attemptConnection, 2000);
            }
          }
        }, 8000); // 8 second timeout - increased from 5
        
        // Store the timeout ID
        connectionTimeout = timeoutId;
      
        // Setup event handlers for the socket
        newSocket.onopen = () => {
          console.log('WebSocket connected successfully');
          setIsConnected(true);
          
          // Clear the connection timeout
          if (connectionTimeout !== null) {
            clearTimeout(connectionTimeout);
          }
          
          // Authenticate the connection
          if (userId || userType || restaurantId) {
            const authMessage = {
              type: 'authenticate',
              userId,
              userType,
              restaurantId
            };
            console.log('Sending authentication message:', authMessage);
            if (newSocket && newSocket.readyState === WebSocket.OPEN) {
              newSocket.send(JSON.stringify(authMessage));
            }
          }
          
          // Set up a ping interval to keep the connection alive
          pingInterval = window.setInterval(() => {
            if (newSocket && newSocket.readyState === WebSocket.OPEN) {
              // Send a ping message to keep the connection alive
              newSocket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
              console.log('Sent ping to server');
            }
          }, 20000); // Send a ping every 20 seconds
          
          // Reset connection attempts on successful connection
          connectionAttempts = 0;
          
          if (onConnect) onConnect();
        };
        
        newSocket.onclose = (event) => {
          console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
          setIsConnected(false);
          
          // Clear ping interval if it exists
          if (pingInterval !== null) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          
          if (onDisconnect) onDisconnect();
          
          // Try again after delay, if not exceeding max attempts
          if (connectionAttempts < maxAttempts) {
            const backoffDelay = Math.min(2000 * Math.pow(2, connectionAttempts - 1), 30000);
            console.log(`Reconnecting in ${backoffDelay}ms (attempt ${connectionAttempts})`);
            setTimeout(attemptConnection, backoffDelay);
          } else {
            // Attempt to reconnect after longer delay if max attempts reached
            setTimeout(() => {
              if (document.visibilityState !== 'hidden') {
                console.log('Attempting to reconnect WebSocket after cool-down...');
                connectionAttempts = 0; // Reset counter for next connect cycle
                attemptConnection();
              }
            }, retryInterval);
          }
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
              if (onMessage) onMessage(data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        setSocket(newSocket);
      };
      
      // Start the first connection attempt
      attemptConnection();
      
      return () => {
        // Safely close the socket if it's still open or connecting
        if (newSocket && (newSocket.readyState === WebSocket.OPEN || 
            newSocket.readyState === WebSocket.CONNECTING)) {
          console.log('Cleaning up WebSocket connection');
          newSocket.close();
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
      // Try to reconnect after delay
      setTimeout(() => {
        if (document.visibilityState !== 'hidden') {
          connect();
        }
      }, retryInterval);
      return () => {}; // Empty cleanup function
    }
  }, [userId, userType, restaurantId, onConnect, onDisconnect, onMessage, retryInterval, notifications]);
  
  // Connect on initial render and keep connection alive
  useEffect(() => {
    // Try to connect immediately
    const cleanup = connect();
    
    // Handle refreshing the connection when needed
    let reconnectTimeout: number | null = null;
    let keepAliveInterval: number | null = null;
    
    // Add visibility change listener to reconnect when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, checking WebSocket connection');
        
        // If not connected, attempt to reconnect
        if (!isConnected) {
          console.log('Reconnecting WebSocket after tab visibility change');
          connect();
        } else {
          // Even if connected, send a ping to keep the connection alive
          if (socket && socket.readyState === WebSocket.OPEN) {
            try {
              socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
              console.log('Sent ping after visibility change');
            } catch (e) {
              console.error('Error sending ping after visibility change:', e);
              // If error sending ping, try to reconnect
              connect();
            }
          }
        }
      }
    };
    
    // Add online status change listener
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        console.log('Device came online, checking WebSocket connection');
        
        // If not connected, attempt to reconnect
        if (!isConnected) {
          console.log('Reconnecting WebSocket after online status change');
          connect();
        }
      }
    };
    
    // Use a simpler keep-alive mechanism to periodically check connection
    keepAliveInterval = window.setInterval(() => {
      if (socket) {
        if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
          console.log('WebSocket is closed or closing, attempting to reconnect');
          connect();
        } else if (socket.readyState === WebSocket.OPEN) {
          // Send a simple ping to keep the connection alive
          try {
            socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            console.log('Sent keep-alive ping');
          } catch (err) {
            console.error('Error sending keep-alive ping:', err);
            // If error sending keep-alive, try to reconnect
            connect();
          }
        }
      } else if (!isConnected) {
        // If no socket exists and not connected, attempt to connect
        console.log('No socket exists, attempting to connect');
        connect();
      }
    }, 30000); // Check connection every 30 seconds
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnlineStatus);
    
    // Clean up
    return () => {
      console.log('Cleaning up WebSocket connections and event listeners');
      
      // Clear any pending reconnect timeouts
      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
      }
      
      // Clear keep-alive interval
      if (keepAliveInterval !== null) {
        clearInterval(keepAliveInterval);
      }
      
      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnlineStatus);
      
      // Cleanup returned from connect
      if (cleanup) {
        cleanup();
      }
      
      // Properly close the socket if it exists
      if (socket) {
        console.log('Closing WebSocket connection during cleanup');
        
        // Send a clean disconnection message if possible
        try {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'client_disconnect' }));
            // Give it a moment to send before closing
            setTimeout(() => {
              socket.close(1000, 'Client disconnecting normally');
            }, 100);
          } else {
            socket.close();
          }
        } catch (e) {
          console.error('Error during socket cleanup:', e);
          // Force close if there's an error
          try {
            socket.close();
          } catch (e2) {
            console.error('Error force closing socket:', e2);
          }
        }
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