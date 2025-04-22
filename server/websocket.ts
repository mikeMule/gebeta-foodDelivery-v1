import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WebSocketConnection {
  ws: WebSocket;
  userId?: number;
  userType?: string; // customer, restaurant_owner, delivery_partner, admin
  restaurantId?: number;
}

let connections: WebSocketConnection[] = [];

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws',
    // Increased timeout values for better stability
    clientTracking: true,
    // Handle errors at the server level
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Below options specified per WebSocket spec
      serverNoContextTakeover: true, 
      clientNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024
    }
  });

  console.log('WebSocket server initialized on path /ws');
  
  // Handle server-level errors
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  // Setup a heartbeat interval to detect dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      if ((ws as any).isAlive === false) {
        console.log('Terminating inactive WebSocket connection');
        return ws.terminate();
      }
      
      (ws as any).isAlive = false;
      ws.ping(() => {}); // Empty noop function as callback
    });
  }, 30000); // Check every 30 seconds
  
  // Clean up the interval on server close
  wss.on('close', () => {
    clearInterval(interval);
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    
    // Mark the connection as alive initially
    (ws as any).isAlive = true;
    
    // Add the connection to our list
    const connection: WebSocketConnection = { ws };
    connections.push(connection);

    // Respond to pings to keep the connection alive
    ws.on('pong', () => {
      (ws as any).isAlive = true;
    });

    // Handle authentication and keep track of which user/restaurant this is
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'authenticate') {
          connection.userId = data.userId;
          connection.userType = data.userType;
          connection.restaurantId = data.restaurantId;
          console.log(`WebSocket authenticated: userId=${data.userId}, userType=${data.userType}, restaurantId=${data.restaurantId}`);
          
          // Send confirmation
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'authentication_success',
              message: 'Successfully authenticated'
            }));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle errors on the connection
    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      connections = connections.filter(conn => conn.ws !== ws);
    });
  });
}

// Function to send notifications to specific users or restaurants
export function sendNotification(notification: {
  type: string;
  title: string;
  message: string;
  data?: any;
}, filter: {
  userId?: number;
  userType?: string;
  restaurantId?: number;
}) {
  try {
    // Validate required notification fields
    if (!notification.type || !notification.title || !notification.message) {
      console.error('Invalid notification format: missing required fields');
      return;
    }
    
    // Log the notification being sent
    console.log(`Sending notification: ${notification.title}`);
    
    // Find all connections that match the filter
    const matchingConnections = connections.filter(conn => {
      // Skip invalid connections
      if (!conn || !conn.ws || conn.ws.readyState !== WebSocket.OPEN) {
        return false;
      }
      
      // Apply filters if provided
      if (filter.userId && conn.userId !== filter.userId) return false;
      if (filter.userType && conn.userType !== filter.userType) return false;
      if (filter.restaurantId && conn.restaurantId !== filter.restaurantId) return false;
      
      return true;
    });
    
    // If no matching connections, log and return
    if (matchingConnections.length === 0) {
      console.log('No active connections match the notification criteria');
      return;
    }

    // Generate a unique ID for this notification
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Prepare the notification payload
    const payload = JSON.stringify({
      ...notification,
      id: notificationId,
      timestamp: new Date().toISOString(),
      read: false // Initialize as unread
    });

    // Count of successfully sent notifications
    let sentCount = 0;
    
    // Send the notification to all matching connections
    matchingConnections.forEach(conn => {
      try {
        if (conn.ws && conn.ws.readyState === WebSocket.OPEN) {
          conn.ws.send(payload);
          sentCount++;
        }
      } catch (error) {
        console.error(`Error sending notification to connection:`, error);
      }
    });
    
    console.log(`Notification sent to ${sentCount}/${matchingConnections.length} connections`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
