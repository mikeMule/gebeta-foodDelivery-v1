// WebSocketManager.ts
// A global singleton manager for WebSocket connections across the application

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Connection state enum
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected'
}

// WebSocket event handler types
export type WebSocketMessageHandler = (data: any) => void;
export type WebSocketStatusHandler = () => void;

// Interface for connection options
export interface WebSocketConnectionOptions {
  userId?: number;
  userType?: string;
  restaurantId?: number;
}

// WebSocket subscription
export interface WebSocketSubscription {
  id: string;
  onMessage?: WebSocketMessageHandler;
  onConnect?: WebSocketStatusHandler;
  onDisconnect?: WebSocketStatusHandler;
}

// Global singleton for managing WebSocket connections
class WebSocketManagerSingleton {
  private static instance: WebSocketManagerSingleton;
  private socket: WebSocket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private connectionOptions: WebSocketConnectionOptions = {};
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimeoutId: number | null = null;
  private pingIntervalId: number | null = null;
  private subscriptions: Map<string, WebSocketSubscription> = new Map();
  
  // Get the singleton instance
  public static getInstance(): WebSocketManagerSingleton {
    if (!WebSocketManagerSingleton.instance) {
      WebSocketManagerSingleton.instance = new WebSocketManagerSingleton();
    }
    return WebSocketManagerSingleton.instance;
  }

  // Initialize a WebSocket connection with user information
  public initialize(options: WebSocketConnectionOptions): void {
    this.connectionOptions = options;
    this.connect();
  }

  // Connect to the WebSocket server
  public connect(): void {
    if (this.connectionState === ConnectionState.CONNECTING) return;
    
    this.connectionState = ConnectionState.CONNECTING;
    
    // Close any existing socket
    if (this.socket) {
      this.cleanupSocket();
    }
    
    try {
      // Create a new WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('WebSocketManager: Connecting to WebSocket server at', wsUrl);
      this.socket = new WebSocket(wsUrl);
      
      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocketManager: Error initializing WebSocket:', error);
      this.connectionState = ConnectionState.DISCONNECTED;
      this.scheduleReconnect();
    }
  }

  // Add a subscription for WebSocket events
  public subscribe(subscription: WebSocketSubscription): () => void {
    // Add the subscription
    this.subscriptions.set(subscription.id, subscription);
    
    // If there's an active connection, notify this subscriber
    if (this.connectionState === ConnectionState.CONNECTED && subscription.onConnect) {
      subscription.onConnect();
    }
    
    // Return an unsubscribe function
    return () => {
      this.subscriptions.delete(subscription.id);
    };
  }

  // Send a message through the WebSocket
  public sendMessage(message: any): boolean {
    if (this.socket && this.connectionState === ConnectionState.CONNECTED) {
      try {
        this.socket.send(typeof message === 'string' ? message : JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('WebSocketManager: Error sending message:', error);
        return false;
      }
    }
    return false;
  }

  // Disconnect the WebSocket
  public disconnect(): void {
    if (this.socket) {
      this.cleanupSocket();
    }
    
    this.connectionState = ConnectionState.DISCONNECTED;
    this.notifySubscribers('onDisconnect');
    console.log('WebSocketManager: Disconnected from WebSocket server');
  }

  // WebSocket event handlers
  private handleOpen(): void {
    console.log('WebSocketManager: WebSocket connection established');
    this.connectionState = ConnectionState.CONNECTED;
    this.reconnectAttempts = 0;
    
    // Send authentication message
    this.sendAuthMessage();
    
    // Start ping interval for keep-alive
    this.startPingInterval();
    
    // Notify subscribers
    this.notifySubscribers('onConnect');
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Special handling for pong messages (don't broadcast to subscribers)
      if (data.type === 'pong') {
        console.log('WebSocketManager: Received pong from server');
        return;
      }
      
      // Process other messages
      console.log('WebSocketManager: Received message:', data);
      this.notifySubscribers('onMessage', data);
    } catch (error) {
      console.error('WebSocketManager: Error processing message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log(`WebSocketManager: WebSocket connection closed (${event.code}: ${event.reason})`);
    
    // Clean up
    this.cleanupTimers();
    
    // Update state and notify subscribers
    this.connectionState = ConnectionState.DISCONNECTED;
    this.notifySubscribers('onDisconnect');
    
    // Attempt to reconnect (unless it was a clean close by us)
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocketManager: WebSocket error:', error);
    this.connectionState = ConnectionState.DISCONNECTED;
    
    // Socket will close automatically after error, triggering handleClose
  }

  // Helper methods
  private sendAuthMessage(): void {
    const { userId, userType, restaurantId } = this.connectionOptions;
    if (userId || userType || restaurantId) {
      this.sendMessage({
        type: 'authenticate',
        userId,
        userType,
        restaurantId
      });
    }
  }

  private startPingInterval(): void {
    // Clear any existing interval
    if (this.pingIntervalId !== null) {
      clearInterval(this.pingIntervalId);
    }
    
    // Set up a new ping interval
    this.pingIntervalId = window.setInterval(() => {
      if (this.connectionState === ConnectionState.CONNECTED) {
        this.sendMessage({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000); // Send a ping every 30 seconds
  }

  private scheduleReconnect(): void {
    // Clear any existing reconnect timeout
    if (this.reconnectTimeoutId !== null) {
      clearTimeout(this.reconnectTimeoutId);
    }
    
    // Only reconnect if we haven't exceeded the maximum attempts
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      // Exponential backoff with jitter
      const baseDelay = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts));
      const jitter = Math.random() * 1000;
      const delay = baseDelay + jitter;
      
      console.log(`WebSocketManager: Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
      
      this.reconnectTimeoutId = window.setTimeout(() => {
        console.log(`WebSocketManager: Attempting to reconnect (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.log('WebSocketManager: Maximum reconnect attempts reached, giving up');
    }
  }

  private cleanupTimers(): void {
    if (this.pingIntervalId !== null) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
    
    if (this.reconnectTimeoutId !== null) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  private cleanupSocket(): void {
    if (!this.socket) return;
    
    // Remove event listeners
    this.socket.onopen = null;
    this.socket.onmessage = null;
    this.socket.onclose = null;
    this.socket.onerror = null;
    
    // Send disconnect message if connected
    if (this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ type: 'client_disconnect' }));
      } catch (error) {
        console.error('WebSocketManager: Error sending disconnect message:', error);
      }
    }
    
    // Close the socket if not already closed
    if (this.socket.readyState !== WebSocket.CLOSED) {
      try {
        this.socket.close(1000, 'Client disconnecting normally');
      } catch (error) {
        console.error('WebSocketManager: Error closing WebSocket:', error);
      }
    }
    
    this.socket = null;
  }

  private notifySubscribers(event: 'onConnect' | 'onDisconnect' | 'onMessage', data?: any): void {
    this.subscriptions.forEach(subscription => {
      if (event === 'onMessage') {
        if (subscription.onMessage && data) {
          subscription.onMessage(data);
        }
      } else if (event === 'onConnect') {
        if (subscription.onConnect) {
          subscription.onConnect();
        }
      } else if (event === 'onDisconnect') {
        if (subscription.onDisconnect) {
          subscription.onDisconnect();
        }
      }
    });
  }
}

// Export the singleton instance
export const WebSocketManager = WebSocketManagerSingleton.getInstance();

// React hook for using the WebSocket manager in components
export function useWebSocketManager(options?: WebSocketConnectionOptions): {
  connectionState: ConnectionState;
  sendMessage: (message: any) => boolean;
  subscribe: (subscription: WebSocketSubscription) => () => void;
} {
  const auth = useAuth();
  const userData = auth.userData || auth.user; // Account for different properties in different auth hooks
  
  // Initialize the WebSocket connection when the component mounts
  useEffect(() => {
    // Get current user information
    const connectionOptions: WebSocketConnectionOptions = {
      userId: userData?.id,
      userType: userData?.userType,
      restaurantId: (userData as any)?.restaurantId,
      ...options // Allow overrides from the hook options
    };
    
    // Initialize the WebSocket with user information
    if (connectionOptions.userId || connectionOptions.userType || connectionOptions.restaurantId) {
      WebSocketManager.initialize(connectionOptions);
    }
    
    // Add event listeners for page visibility and online status
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          WebSocketManager['connectionState'] !== ConnectionState.CONNECTED) {
        console.log('Page became visible, checking WebSocket connection');
        WebSocketManager.connect();
      }
    };
    
    const handleOnlineStatus = () => {
      if (navigator.onLine && 
          WebSocketManager['connectionState'] !== ConnectionState.CONNECTED) {
        console.log('Device came online, checking WebSocket connection');
        WebSocketManager.connect();
      }
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnlineStatus);
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnlineStatus);
      
      // Note: We don't disconnect the WebSocket here since other components might be using it
      // The WebSocketManager handles its own lifecycle
    };
  }, [userData, options]);
  
  return {
    connectionState: WebSocketManager['connectionState'],
    sendMessage: WebSocketManager.sendMessage.bind(WebSocketManager),
    subscribe: WebSocketManager.subscribe.bind(WebSocketManager)
  };
}