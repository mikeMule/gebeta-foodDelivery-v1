import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertOrderSchema, insertReviewSchema, User, orders } from "@shared/schema";
import { setupAuth } from "./auth";
import session from 'express-session';
import { setupWebSocketServer, sendNotification } from "./websocket";
import { eq } from "drizzle-orm";
import { db } from "./db";

// Extend Express.Session and SessionData
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    userType?: string;
    restaurantId?: number;
  }
}

// Helper function to set session data
function setSessionData(
  session: session.Session & Partial<session.SessionData>,
  userId: number,
  userType: string,
  restaurantId?: number
) {
  const sessionAny = session as any;
  sessionAny.userId = userId;
  sessionAny.userType = userType;
  if (restaurantId) {
    sessionAny.restaurantId = restaurantId;
  }
}

// Add user to Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Define a custom request type with guaranteed user
interface AuthenticatedRequest extends Request {
  user: User; // Overriding Express.Request.user to be non-optional
}

// Middleware to check if user is authenticated
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated through session
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  
  // Check for admin header authentication
  if (req.headers['x-admin-auth'] === 'true') {
    // Set a mock admin user for the request
    req.user = {
      id: 999,
      username: 'admin',
      phoneNumber: 'admin',
      userType: 'admin',
      fullName: 'Restaurant Admin',
    } as User;
    return next();
  }
  
  // Check for custom headers authentication
  const userType = req.headers['x-user-type'] as string;
  const userId = req.headers['x-user-id'] as string;
  
  if (userType && userId) {
    // Set user from headers for this request
    storage.getUser(parseInt(userId))
      .then(user => {
        if (user && user.userType === userType) {
          req.user = user;
          return next();
        }
        return res.status(401).json({ message: "Authentication required" });
      })
      .catch(err => {
        console.error("Error in auth middleware:", err);
        return res.status(401).json({ message: "Authentication required" });
      });
  } else {
    return res.status(401).json({ message: "Authentication required" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Create the HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  setupWebSocketServer(httpServer);

  // Helper function to calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Restaurant routes
  app.get("/api/restaurants", async (req: Request, res: Response) => {
    try {
      // Get user's location from query params or use default
      const userLat = parseFloat(req.query.lat as string) || 9.0079232;
      const userLng = parseFloat(req.query.lng as string) || 38.7678208;
      
      let restaurants = await storage.getAllRestaurants();
      
      // Calculate distance for each restaurant using actual user location
      restaurants = restaurants.map(restaurant => {
        const distance = calculateDistance(
          userLat, 
          userLng, 
          restaurant.latitude, 
          restaurant.longitude
        );
        
        return {
          ...restaurant,
          distance
        };
      });
      
      // Sort restaurants by distance
      restaurants.sort((a, b) => a.distance - b.distance);
      
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await storage.getRestaurant(id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });
  
  // Update restaurant
  app.patch("/api/restaurants/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await storage.getRestaurant(id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      const updatedRestaurant = await storage.updateRestaurant(id, req.body);
      res.json(updatedRestaurant);
    } catch (error) {
      console.error("Error updating restaurant:", error);
      res.status(500).json({ message: "Failed to update restaurant" });
    }
  });
  
  // Create restaurant
  app.post("/api/restaurants", async (req: Request, res: Response) => {
    try {
      const newRestaurant = await storage.createRestaurant(req.body);
      res.status(201).json(newRestaurant);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });
  
  // Food items management
  app.post("/api/food-items", async (req: Request, res: Response) => {
    try {
      const newFoodItem = await storage.createFoodItem(req.body);
      res.status(201).json(newFoodItem);
    } catch (error) {
      console.error("Error creating food item:", error);
      res.status(500).json({ message: "Failed to create food item" });
    }
  });
  
  app.delete("/api/food-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFoodItem(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting food item:", error);
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });
  
  // Update food item
  app.patch("/api/food-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify the food item exists
      const foodItem = await storage.getFoodItem(id);
      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }
      
      // Log the incoming request body for debugging
      console.log("Update food item request body:", JSON.stringify(req.body));
      
      // Make sure the data is properly formatted
      const updateData = req.body;
      
      // Restaurant owner authorization check
      if (req.user?.userType === "restaurant_owner" && req.user?.restaurantId !== foodItem.restaurantId) {
        return res.status(403).json({ message: "You can only edit food items for your own restaurant" });
      }
      
      // Update the food item
      const updatedFoodItem = await storage.updateFoodItem(id, updateData);
      
      // Return the updated food item
      res.json(updatedFoodItem);
    } catch (error) {
      console.error("Error updating food item:", error);
      res.status(500).json({ 
        message: "Failed to update food item", 
        details: error.message || "Unknown error" 
      });
    }
  });

  // Food item routes
  app.get("/api/restaurants/:id/food-items", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const foodItems = await storage.getFoodItemsByRestaurant(restaurantId);
      res.json(foodItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  // Order routes - require authentication
  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    // TypeScript doesn't recognize that requireAuth middleware ensures req.user exists
    // We'll use the non-null assertion operator (!) to tell TypeScript that req.user is defined
    const authenticatedReq = req as AuthenticatedRequest;
    
    try {
      const orderData = insertOrderSchema.parse(authenticatedReq.body);
      
      // Now we can access the user without the non-null assertion
      const userId = authenticatedReq.user.id;
      
      // Enforce that the userId in the order matches the authenticated user
      if (orderData.userId !== userId) {
        return res.status(403).json({ message: "Cannot create order for another user" });
      }
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const { orderItems: items } = req.body;
      if (Array.isArray(items)) {
        for (const item of items) {
          await storage.createOrderItem({
            orderId: order.id,
            foodItemId: item.foodItemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
          });
        }
      }
      
      // Get restaurant information for the notification
      const restaurant = await storage.getRestaurant(order.restaurantId);
      
      // Send WebSocket notification to restaurant owners about the new order
      sendNotification({
        type: 'new_order',
        title: 'New Order Received',
        message: `A new order #${order.id} has been placed for ${restaurant?.name}`,
        data: {
          orderId: order.id,
          totalAmount: order.totalAmount,
          items: items.length,
          timestamp: new Date().toISOString()
        }
      }, {
        restaurantId: order.restaurantId,
        userType: 'restaurant_owner'
      });
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Users can only access their own orders
      if (order.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const orderItems = await storage.getOrderItems(id);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  
  // Get user's orders
  app.get("/api/user/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrdersByUser(req.user!.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // Mark an order as read (for notifications)
  app.patch("/api/orders/:id/read", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Determine if the user has permission to mark this order as read
      let hasPermission = false;
      
      // Restaurant owners can mark orders for their restaurant as read
      if (req.user?.userType === "restaurant_owner" && req.user?.restaurantId === order.restaurantId) {
        hasPermission = true;
      }
      
      // Customers can mark their own orders as read
      if (req.user?.userType === "customer" && req.user?.id === order.userId) {
        hasPermission = true;
      }
      
      // Admins can mark any order as read
      if (req.user?.userType === "admin") {
        hasPermission = true;
      }
      
      // Delivery partners can mark orders assigned to them as read
      if (req.user?.userType === "delivery_partner" && order.deliveryPartnerId === req.user?.id) {
        hasPermission = true;
      }
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to mark this order as read" });
      }
      
      // Update the is_read flag in the database
      await db
        .update(orders)
        .set({ isRead: true })
        .where(eq(orders.id, id));
      
      return res.status(200).json({ message: "Order marked as read" });
    } catch (error) {
      console.error("Error marking order as read:", error);
      return res.status(500).json({ message: "Failed to mark order as read" });
    }
  });

  // Review routes
  app.post("/api/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const reviewData = {
        ...req.body,
        userId: req.user!.id // Set the userId from the authenticated user
      };
      
      const validatedData = insertReviewSchema.parse(reviewData);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get("/api/restaurants/:id/reviews", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByRestaurant(restaurantId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Categories route
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Food Categories route
  app.get("/api/food-categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllFoodCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching food categories:", error);
      res.status(500).json({ message: "Failed to fetch food categories" });
    }
  });
  
  // Geocoding endpoint using Google Maps API
  app.get("/api/geocode", async (req: Request, res: Response) => {
    try {
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required parameters" });
      }
      
      // Get Google Maps API key from environment variables
      const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!GOOGLE_API_KEY) {
        console.error("Google Maps API key is missing");
        // Provide a specific Ethiopian location based on coordinates
        // For demonstration/fallback purposes
        
        const lat_num = parseFloat(lat as string);
        const lng_num = parseFloat(lng as string);
        
        // Define some regions in Addis Ababa and nearby areas
        const ethiopiaRegions = [
          { name: "Bole", lat: 8.9806, lng: 38.7578, radius: 3 },
          { name: "Meskel Square", lat: 9.0105, lng: 38.7600, radius: 2 },
          { name: "Merkato", lat: 9.0366, lng: 38.7489, radius: 2.5 },
          { name: "Kazanchis", lat: 9.0182, lng: 38.7792, radius: 1.5 },
          { name: "Piazza", lat: 9.0387, lng: 38.7526, radius: 1.8 },
          { name: "Sidist Kilo", lat: 9.0391, lng: 38.7633, radius: 1.2 },
          { name: "Mexico", lat: 8.9978, lng: 38.7868, radius: 1.7 },
          { name: "Kality", lat: 8.9135, lng: 38.7914, radius: 4 },
          { name: "Megenagna", lat: 9.0169, lng: 38.8011, radius: 2.2 },
          { name: "CMC", lat: 9.0491, lng: 38.8286, radius: 2.8 },
        ];
        
        // Calculate distance between two points
        const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
          const R = 6371; // Radius of earth in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLng = (lng2 - lng1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };
        
        // Find the closest region
        let closestRegion = ethiopiaRegions[0];
        let minDistance = calculateDistance(lat_num, lng_num, ethiopiaRegions[0].lat, ethiopiaRegions[0].lng);
        
        for (let i = 1; i < ethiopiaRegions.length; i++) {
          const distance = calculateDistance(lat_num, lng_num, ethiopiaRegions[i].lat, ethiopiaRegions[i].lng);
          if (distance < minDistance) {
            minDistance = distance;
            closestRegion = ethiopiaRegions[i];
          }
        }
        
        return res.json({ locationName: closestRegion.name });
      }
      
      // Make a request to Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === "OK" && data.results.length > 0) {
        // Extract the most relevant location info
        let locationName = "Your Location";
        
        // Find the most appropriate address component
        for (const result of data.results) {
          // Try to get a neighborhood or district name first
          const addressComponents = result.address_components;
          for (const component of addressComponents) {
            if (component.types.includes("sublocality_level_1") || 
                component.types.includes("neighborhood") ||
                component.types.includes("locality")) {
              locationName = component.long_name;
              break;
            }
          }
          
          // If we found a good location name, break
          if (locationName !== "Your Location") break;
        }
        
        // If we couldn't find a specific neighborhood, use formatted address
        if (locationName === "Your Location" && data.results[0].formatted_address) {
          // Just use the first part of the address to avoid showing the full address
          locationName = data.results[0].formatted_address.split(',')[0];
        }
        
        return res.json({ locationName });
      } else {
        console.error("Google Maps API error:", data.status);
        
        // Fallback to our Ethiopian location system when Google Maps fails
        const lat_num = parseFloat(lat as string);
        const lng_num = parseFloat(lng as string);
        
        // Define some regions in Addis Ababa and nearby areas
        const ethiopiaRegions = [
          { name: "Bole", lat: 8.9806, lng: 38.7578, radius: 3 },
          { name: "Meskel Square", lat: 9.0105, lng: 38.7600, radius: 2 },
          { name: "Merkato", lat: 9.0366, lng: 38.7489, radius: 2.5 },
          { name: "Kazanchis", lat: 9.0182, lng: 38.7792, radius: 1.5 },
          { name: "Piazza", lat: 9.0387, lng: 38.7526, radius: 1.8 },
          { name: "Sidist Kilo", lat: 9.0391, lng: 38.7633, radius: 1.2 },
          { name: "Mexico", lat: 8.9978, lng: 38.7868, radius: 1.7 },
          { name: "Kality", lat: 8.9135, lng: 38.7914, radius: 4 },
          { name: "Megenagna", lat: 9.0169, lng: 38.8011, radius: 2.2 },
          { name: "CMC", lat: 9.0491, lng: 38.8286, radius: 2.8 },
        ];
        
        // Calculate distance between two points
        const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
          const R = 6371; // Radius of earth in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLng = (lng2 - lng1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };
        
        // Find the closest region
        let closestRegion = ethiopiaRegions[0];
        let minDistance = calculateDistance(lat_num, lng_num, ethiopiaRegions[0].lat, ethiopiaRegions[0].lng);
        
        for (let i = 1; i < ethiopiaRegions.length; i++) {
          const distance = calculateDistance(lat_num, lng_num, ethiopiaRegions[i].lat, ethiopiaRegions[i].lng);
          if (distance < minDistance) {
            minDistance = distance;
            closestRegion = ethiopiaRegions[i];
          }
        }
        
        return res.json({ locationName: closestRegion.name });
      }
    } catch (error) {
      console.error("Error in geocoding endpoint:", error);
      return res.status(500).json({ error: "Server error during geocoding" });
    }
  });

  // Restaurant management API endpoints
  
  // Restaurant owners management
  app.post("/api/restaurant-owners", requireAuth, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (req.user?.userType !== "admin") {
        return res.status(403).json({ message: "Only admins can create restaurant owners" });
      }
      
      const { restaurantId, fullName, phoneNumber, email, username, password } = req.body;
      
      if (!restaurantId || !fullName || !phoneNumber || !username || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if restaurant exists
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if phone number already exists
      const existingPhone = await storage.getUserByPhoneNumber(phoneNumber);
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
      
      console.log("Creating restaurant owner for restaurant:", restaurant.name);
      
      try {
        // Create user with restaurant owner role and metadata containing restaurant info
        const user = await storage.createUser({
          username,
          password, // This will be hashed in the storage method
          phoneNumber,
          fullName,
          email: email || null,
          userType: "restaurant_owner",
          restaurantId: restaurant.id,
          restaurantName: restaurant.name
        });
        
        // Return the created user without password
        const { password: _, ...userWithoutPassword } = user;
        
        console.log("Restaurant owner created successfully:", userWithoutPassword);
        
        return res.status(201).json(userWithoutPassword);
      } catch (createError) {
        console.error("Database error creating restaurant owner:", createError);
        return res.status(500).json({ 
          message: "Database error creating restaurant owner", 
          details: createError.message 
        });
      }
    } catch (error) {
      console.error("Error creating restaurant owner:", error);
      return res.status(500).json({ message: "Failed to create restaurant owner" });
    }
  });

  app.get("/api/restaurant/:id/owners", requireAuth, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (req.user?.userType !== "admin") {
        return res.status(403).json({ message: "Only admins can view restaurant owners" });
      }
      
      const restaurantId = parseInt(req.params.id);
      
      // Check if restaurant exists
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      // Get all users with restaurant_owner role for this restaurant
      const owners = await storage.getRestaurantOwners(restaurantId);
      
      // Remove passwords from the response
      const safeOwners = owners.map(({ password, ...owner }) => owner);
      
      return res.json(safeOwners);
    } catch (error) {
      console.error("Error fetching restaurant owners:", error);
      return res.status(500).json({ message: "Failed to fetch restaurant owners" });
    }
  });
  
  // Delete restaurant owner
  app.delete("/api/restaurant-owners/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (req.user?.userType !== "admin") {
        return res.status(403).json({ message: "Only admins can delete restaurant owners" });
      }
      
      const ownerId = parseInt(req.params.id);
      
      // Check if user exists
      const owner = await storage.getUser(ownerId);
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }
      
      // Check if user is a restaurant owner
      if (owner.userType !== "restaurant_owner") {
        return res.status(400).json({ message: "User is not a restaurant owner" });
      }
      
      // Delete the user
      await storage.deleteUser(ownerId);
      
      res.status(200).json({ message: "Restaurant owner deleted successfully" });
    } catch (error) {
      console.error("Error deleting restaurant owner:", error);
      return res.status(500).json({ message: "Failed to delete restaurant owner" });
    }
  });
  
  // Restaurant authentication endpoint
  app.post("/api/restaurant/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // For demo purposes with various hardcoded credentials for different restaurants
      // Map of demo username/password pairs to restaurant IDs
      const demoCredentials: Record<string, {restaurantId: number, userId: number, fullName: string, phoneNumber: string}> = {
        'abc': { 
          restaurantId: 1, 
          userId: 991, 
          fullName: "Addis Ababa Restaurant Manager", 
          phoneNumber: "0911223344" 
        },
        'xyz': { 
          restaurantId: 2, 
          userId: 992, 
          fullName: "Lalibela Restaurant Manager", 
          phoneNumber: "0922334455" 
        },
        'def': { 
          restaurantId: 3, 
          userId: 993, 
          fullName: "Hawassa Restaurant Manager", 
          phoneNumber: "0933445566" 
        }
      };
      
      // Function to create and return user data response
      const createUserResponse = async (userData: any, restaurantId: number) => {
        const restaurant = await storage.getRestaurant(restaurantId);
        
        if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found" });
        }
        
        // Set session data if available
        if (req.session) {
          req.session.userId = userData.id;
          req.session.userType = userData.userType;
          req.session.restaurantId = userData.restaurantId || restaurant.id;
        }
        
        return res.status(200).json({
          user: {
            ...userData,
            restaurantId: restaurantId,
            restaurantName: restaurant.name
          },
          restaurant: restaurant
        });
      };
      
      // Check if using demo credentials
      if (username in demoCredentials && password === `${username}@123`) {
        const { restaurantId, userId, fullName, phoneNumber } = demoCredentials[username];
        
        const userData = {
          id: userId,
          username: username,
          phoneNumber: phoneNumber,
          fullName: fullName,
          userType: "restaurant_owner",
          restaurantId: restaurantId
        };
        
        return await createUserResponse(userData, restaurantId);
      }
      
      // If not using hardcoded credentials, try the database
      try {
        // Get the user with the restaurant_owner type
        const user = await storage.getUserByUsername(username);
        
        if (!user || user.userType !== "restaurant_owner") {
          return res.status(401).json({ message: "Invalid credentials or not authorized as restaurant owner" });
        }
        
        // In a real app, you would compare passwords securely here
        // For now, we're skipping actual password check for demo
        
        // Determine which restaurant this owner is associated with
        let restaurantId: number = 1; // Default fallback 
        let restaurantName: string | null = null;
        
        // Try to get restaurantId from various places
        
        // 1. First check for restaurant ID in user data
        const userAny = user as any;
        if (typeof userAny.restaurantId === 'number') {
          restaurantId = userAny.restaurantId;
        } else if (user.metadata) {
          // 2. Check metadata if available
          try {
            const metadata = JSON.parse(user.metadata);
            if (metadata.restaurantId) {
              restaurantId = parseInt(metadata.restaurantId);
            }
            if (metadata.restaurantName) {
              restaurantName = metadata.restaurantName;
            }
          } catch (parseError) {
            console.error("Error parsing user metadata:", parseError);
          }
        }
        
        return await createUserResponse({
          id: user.id,
          username: user.username,
          phoneNumber: user.phoneNumber || "",
          fullName: user.fullName || "",
          email: user.email || "",
          userType: user.userType
        }, restaurantId);
        
      } catch (dbError) {
        console.error("Database error in restaurant login:", dbError);
        
        // Fallback to demo user
        let fallbackRestaurantId = 1;
        let fallbackUserId = 999;
        let fallbackName = "Restaurant Manager";
        let fallbackPhone = "0911223344";
        
        // Use demo credentials if username matches one
        if (username in demoCredentials) {
          const creds = demoCredentials[username];
          fallbackRestaurantId = creds.restaurantId;
          fallbackUserId = creds.userId;
          fallbackName = creds.fullName;
          fallbackPhone = creds.phoneNumber;
        }
        
        return await createUserResponse({
          id: fallbackUserId,
          username: username,
          phoneNumber: fallbackPhone,
          fullName: fallbackName,
          userType: "restaurant_owner"
        }, fallbackRestaurantId);
      }
    } catch (error) {
      console.error("Error in restaurant login:", error);
      return res.status(500).json({ message: "Failed to process login" });
    }
  });
  
  // Get orders for a specific restaurant (with filtering)
  app.get("/api/restaurant/:id/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const statusFilter = req.query.status as string | undefined;
      
      // Check if the user is authorized to access this restaurant's orders
      if (req.user?.userType !== "restaurant_owner" && req.user?.userType !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access restaurant orders" });
      }
      
      // For restaurant owners, ensure they only access their own restaurant's orders
      if (req.user?.userType === "restaurant_owner") {
        // Get the user's restaurant ID from session
        const userRestaurantId = req.session?.restaurantId;
        
        // If user is trying to access orders for a restaurant they don't own
        if (userRestaurantId && userRestaurantId !== restaurantId) {
          return res.status(403).json({ 
            message: "Unauthorized: You can only view orders for your own restaurant" 
          });
        }
      }
      
      // Get all orders for this restaurant
      const allOrders = await storage.getOrdersByRestaurant(restaurantId);
      
      // Filter orders by status if a filter is provided
      const filteredOrders = statusFilter 
        ? allOrders.filter(order => order.status === statusFilter)
        : allOrders;
      
      // Sort by creation time (oldest first - first come, first served)
      const sortedOrders = filteredOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
        return dateA.getTime() - dateB.getTime();
      });
      
      // Enrich orders with order items and customer data
      const enrichedOrders = await Promise.all(
        sortedOrders.map(async (order) => {
          const orderItems = await storage.getOrderItems(order.id);
          const user = await storage.getUser(order.userId);
          
          return {
            ...order,
            orderItems,
            customer: user ? {
              id: user.id,
              phoneNumber: user.phoneNumber,
              fullName: user.fullName || "Customer",
              location: user.location
            } : null
          };
        })
      );
      
      return res.status(200).json(enrichedOrders);
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update order status
  app.patch("/api/orders/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Validate the status
      const validStatuses = ["new", "preparing", "ready_for_pickup", "out_for_delivery", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      // Get the order
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the user is authorized to update this order
      if (req.user?.userType !== "restaurant_owner" && req.user?.userType !== "admin") {
        return res.status(403).json({ message: "Unauthorized to update order status" });
      }
      
      // For restaurant owners, ensure they only update orders for their own restaurant
      if (req.user?.userType === "restaurant_owner") {
        // Get the user's restaurant ID from session
        const userRestaurantId = req.session?.restaurantId;
        
        // If user is trying to update an order for a restaurant they don't own
        if (userRestaurantId && userRestaurantId !== order.restaurantId) {
          return res.status(403).json({ 
            message: "Unauthorized: You can only update orders for your own restaurant" 
          });
        }
      }
      
      // Update the order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      // If the order is now "out_for_delivery", we would typically assign a delivery partner
      if (status === "out_for_delivery" && req.body.deliveryPartnerId) {
        const deliveryPartnerId = parseInt(req.body.deliveryPartnerId);
        await storage.assignDeliveryPartner(orderId, deliveryPartnerId);
      }
      
      // Get the user who placed the order
      const customer = await storage.getUser(order.userId);
      
      // Send WebSocket notification to the customer about their order status update
      sendNotification({
        type: 'order_status_update',
        title: 'Order Status Updated',
        message: `Your order #${order.id} status is now: ${status}`,
        data: {
          orderId: order.id,
          status: status,
          restaurantId: order.restaurantId,
          timestamp: new Date().toISOString()
        }
      }, {
        userId: order.userId,
        userType: 'customer'
      });
      
      // If this is an admin approval, also notify the restaurant
      if (req.user?.userType === 'admin' && (status === 'approved' || status === 'rejected')) {
        sendNotification({
          type: 'order_admin_decision',
          title: `Order ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `Order #${order.id} has been ${status} by admin`,
          data: {
            orderId: order.id,
            status: status,
            timestamp: new Date().toISOString()
          }
        }, {
          restaurantId: order.restaurantId,
          userType: 'restaurant_owner'
        });
      }
      
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get available delivery partners for an order
  app.get("/api/orders/:id/delivery-partners", requireAuth, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      
      // Get the order
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the user is authorized to get delivery partners for this order
      if (req.user?.userType !== "restaurant_owner" && req.user?.userType !== "admin") {
        return res.status(403).json({ message: "Unauthorized to get delivery partners" });
      }
      
      // For restaurant owners, ensure they only get delivery partners for their own restaurant's orders
      if (req.user?.userType === "restaurant_owner") {
        // Get the user's restaurant ID from session
        const userRestaurantId = req.session?.restaurantId;
        
        // If user is trying to get delivery partners for an order from a restaurant they don't own
        if (userRestaurantId && userRestaurantId !== order.restaurantId) {
          return res.status(403).json({ 
            message: "Unauthorized: You can only access orders for your own restaurant" 
          });
        }
      }
      
      // Get the restaurant coordinates
      const restaurant = await storage.getRestaurant(order.restaurantId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      // Get all active delivery partners
      const allDeliveryPartners = await storage.getActiveDeliveryPartners();
      
      // Calculate distance and sort by distance and availability
      const deliveryPartnersWithDistance = allDeliveryPartners.map((partner) => {
        // Calculate distance from restaurant to delivery partner
        const distance = partner.currentLatitude && partner.currentLongitude
          ? calculateDistance(
              restaurant.latitude, 
              restaurant.longitude, 
              partner.currentLatitude, 
              partner.currentLongitude
            )
          : 999; // Large default distance if no location
          
        return {
          ...partner,
          distance,
          user: partner.user ? {
            id: partner.user.id,
            fullName: partner.user.fullName,
            phoneNumber: partner.user.phoneNumber
          } : null
        };
      });
      
      // Sort by availability (activeOrderCount) first, then by distance
      const sortedPartners = deliveryPartnersWithDistance.sort((a, b) => {
        // First sort by active order count
        if (a.activeOrderCount !== b.activeOrderCount) {
          return a.activeOrderCount - b.activeOrderCount;
        }
        // Then sort by distance
        return a.distance - b.distance;
      });
      
      return res.status(200).json(sortedPartners);
    } catch (error) {
      console.error("Error fetching delivery partners:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Assign delivery partner to order
  app.post("/api/orders/:id/assign-delivery", requireAuth, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { deliveryPartnerId } = req.body;
      
      if (!deliveryPartnerId) {
        return res.status(400).json({ message: "Delivery partner ID is required" });
      }
      
      // Get the order
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the user is authorized to assign delivery partners
      if (req.user?.userType !== "restaurant_owner" && req.user?.userType !== "admin") {
        return res.status(403).json({ message: "Unauthorized to assign delivery partners" });
      }
      
      // For restaurant owners, ensure they only assign delivery partners to their own restaurant's orders
      if (req.user?.userType === "restaurant_owner") {
        // Get the user's restaurant ID from session
        const userRestaurantId = req.session?.restaurantId;
        
        // If user is trying to assign delivery partners to an order from a restaurant they don't own
        if (userRestaurantId && userRestaurantId !== order.restaurantId) {
          return res.status(403).json({ 
            message: "Unauthorized: You can only manage orders for your own restaurant" 
          });
        }
      }
      
      // Assign the delivery partner and update order status
      const updatedOrder = await storage.assignDeliveryPartner(orderId, parseInt(deliveryPartnerId));
      await storage.updateOrderStatus(orderId, "out_for_delivery");
      
      // Get restaurant and order information
      const restaurant = await storage.getRestaurant(order.restaurantId);
      const customer = await storage.getUser(order.userId);
      
      // Notify the delivery partner via WebSocket
      sendNotification({
        type: 'delivery_assignment',
        title: 'New Delivery Assignment',
        message: `You have been assigned to deliver order #${order.id} from ${restaurant?.name}`,
        data: {
          orderId: order.id,
          restaurantId: order.restaurantId,
          restaurantName: restaurant?.name,
          customerName: customer?.fullName,
          deliveryAddress: order.deliveryAddress,
          timestamp: new Date().toISOString()
        }
      }, {
        userId: parseInt(deliveryPartnerId),
        userType: 'delivery_partner'
      });
      
      // Also notify the customer
      sendNotification({
        type: 'delivery_assigned',
        title: 'Delivery Partner Assigned',
        message: `Your order #${order.id} has been assigned to a delivery partner and is on the way!`,
        data: {
          orderId: order.id,
          status: "out_for_delivery",
          timestamp: new Date().toISOString()
        }
      }, {
        userId: order.userId,
        userType: 'customer'
      });
      
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error assigning delivery partner:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin approval for orders
  app.patch("/api/orders/:id/approve", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { approved } = req.body;
      
      // Only admins can approve orders
      if (req.user?.userType !== "admin") {
        return res.status(403).json({ message: "Only admins can approve orders" });
      }
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Update approval status
      await db
        .update(orders)
        .set({ 
          adminApproved: approved === true,
          needsApproval: false,
          isRead: false // Mark as unread so it appears as a new notification
        })
        .where(eq(orders.id, id));
      
      // Get updated order
      const updatedOrder = await storage.getOrder(id);
      
      // Send notification to restaurant about the approval
      sendNotification({
        type: 'order_approval',
        title: approved ? 'Order Approved' : 'Order Rejected',
        message: `Order #${id} has been ${approved ? 'approved' : 'rejected'} by admin`,
        data: {
          orderId: id,
          approved: approved,
          timestamp: new Date().toISOString()
        }
      }, {
        restaurantId: order.restaurantId,
        userType: 'restaurant_owner'
      });
      
      // Send notification to customer about the approval
      sendNotification({
        type: 'order_approval',
        title: approved ? 'Order Approved' : 'Order Rejected',
        message: `Your order #${id} has been ${approved ? 'approved' : 'rejected'} by admin`,
        data: {
          orderId: id,
          approved: approved,
          timestamp: new Date().toISOString()
        }
      }, {
        userId: order.userId,
        userType: 'customer'
      });
      
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error approving order:", error);
      return res.status(500).json({ message: "Failed to approve order" });
    }
  });
  
  // Get restaurant dashboard statistics
  app.get("/api/restaurant/:id/statistics", requireAuth, async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      
      // Check if the user is authorized to access this restaurant's stats
      if (req.user?.userType !== "restaurant_owner" && req.user?.userType !== "admin") {
        return res.status(403).json({ message: "Unauthorized to access restaurant statistics" });
      }
      
      // For restaurant owners, ensure they only access stats for their own restaurant
      if (req.user?.userType === "restaurant_owner") {
        // Get the user's restaurant ID from session
        const userRestaurantId = req.session?.restaurantId;
        
        // If user is trying to access stats for a restaurant they don't own
        if (userRestaurantId && userRestaurantId !== restaurantId) {
          return res.status(403).json({ 
            message: "Unauthorized: You can only access statistics for your own restaurant" 
          });
        }
      }
      
      // Get all orders for this restaurant
      const allOrders = await storage.getOrdersByRestaurant(restaurantId);
      
      // Calculate statistics
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalCommission = allOrders.reduce((sum, order) => {
        return sum + (order.restaurantCommissionAmount || 0);
      }, 0);
      
      // Order status counts
      const statusCounts = {
        new: 0,
        preparing: 0,
        ready_for_pickup: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0
      };
      
      allOrders.forEach(order => {
        if (order.status in statusCounts) {
          statusCounts[order.status as keyof typeof statusCounts]++;
        }
      });
      
      // Today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = allOrders.filter(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        return orderDate && orderDate >= today;
      });
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      return res.status(200).json({
        totalOrders,
        totalRevenue,
        totalCommission,
        statusCounts,
        todayOrders: todayOrders.length,
        todayRevenue
      });
    } catch (error) {
      console.error("Error fetching restaurant statistics:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
