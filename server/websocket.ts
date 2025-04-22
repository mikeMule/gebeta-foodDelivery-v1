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
  const wss = new WebSocketServer({ server, path: '/ws' });

  console.log('WebSocket server initialized on path /ws');

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    
    // Add the connection to our list
    const connection: WebSocketConnection = { ws };
    connections.push(connection);

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
          ws.send(JSON.stringify({
            type: 'authentication_success',
            message: 'Successfully authenticated'
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
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
  // Log the notification being sent
  console.log(`Sending notification: ${notification.title}`);
  
  // Find all connections that match the filter
  const matchingConnections = connections.filter(conn => {
    if (filter.userId && conn.userId !== filter.userId) return false;
    if (filter.userType && conn.userType !== filter.userType) return false;
    if (filter.restaurantId && conn.restaurantId !== filter.restaurantId) return false;
    return true;
  });

  // Generate a unique ID for this notification
  const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Send the notification to all matching connections
  const payload = JSON.stringify({
    ...notification,
    id: notificationId,
    timestamp: new Date().toISOString(),
    read: false // Initialize as unread
  });

  matchingConnections.forEach(conn => {
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(payload);
    }
  });
  
  console.log(`Notification sent to ${matchingConnections.length} connections`);
}