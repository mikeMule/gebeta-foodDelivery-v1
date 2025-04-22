import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertOrderSchema, insertReviewSchema, User } from "@shared/schema";
import { setupAuth } from "./auth";

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
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  // User is authenticated, call next middleware
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

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
  
  // Restaurant authentication endpoint
  app.post("/api/restaurant/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // For demo purposes with the hardcoded credentials
      if (username === 'abc' && password === 'abc@123') {
        // Create a hardcoded restaurant owner response
        const restaurantId = 1; // Default restaurant ID
        const restaurant = await storage.getRestaurant(restaurantId);
        
        if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found" });
        }
        
        return res.status(200).json({
          user: {
            id: 999, // Demo ID
            username: username,
            phoneNumber: "0911223344",
            fullName: "Restaurant Manager",
            userType: "restaurant_owner"
          },
          restaurant: {
            id: restaurant.id,
            name: restaurant.name
          }
        });
      }
      
      // If not using hardcoded credentials, try the database
      try {
        // Get the user with the restaurant_owner type
        const user = await storage.getUserByUsername(username);
        
        if (!user || user.userType !== "restaurant_owner") {
          return res.status(401).json({ message: "Invalid credentials or not authorized as restaurant owner" });
        }
        
        // In a real app, you would compare passwords securely here
        
        // Return restaurant data
        const restaurantId = 1; // In a real app, this would be fetched from a restaurant_owners table
        const restaurant = await storage.getRestaurant(restaurantId);
        
        if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found" });
        }
        
        return res.status(200).json({
          user: {
            id: user.id,
            username: user.username,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            email: user.email,
            userType: user.userType
          },
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description,
            address: restaurant.address,
            phone: restaurant.phone,
            imageUrl: restaurant.imageUrl
          }
        });
      } catch (dbError) {
        console.error("Database error in restaurant login:", dbError);
        // Fall back to the demo user if there's a database error
        const restaurantId = 1;
        const restaurant = await storage.getRestaurant(restaurantId);
        
        if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found" });
        }
        
        return res.json({
          user: {
            id: 999,
            username: username,
            phoneNumber: "0911223344",
            fullName: "Restaurant Manager",
            userType: "restaurant_owner"
          },
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description,
            address: restaurant.address,
            phone: restaurant.phone,
            imageUrl: restaurant.imageUrl
          }
        });
      }
    } catch (error) {
      console.error("Error in restaurant login:", error);
      return res.status(500).json({ message: "Internal server error" });
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
      
      // Get all orders for this restaurant
      const allOrders = await storage.getOrdersByRestaurant(restaurantId);
      
      // Filter orders by status if a filter is provided
      const filteredOrders = statusFilter 
        ? allOrders.filter(order => order.status === statusFilter)
        : allOrders;
      
      // Sort by creation time (oldest first - first come, first served)
      const sortedOrders = filteredOrders.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
      
      // Update the order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      // If the order is now "out_for_delivery", we would typically assign a delivery partner
      if (status === "out_for_delivery" && req.body.deliveryPartnerId) {
        const deliveryPartnerId = parseInt(req.body.deliveryPartnerId);
        await storage.assignDeliveryPartner(orderId, deliveryPartnerId);
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
      
      // Assign the delivery partner and update order status
      const updatedOrder = await storage.assignDeliveryPartner(orderId, parseInt(deliveryPartnerId));
      await storage.updateOrderStatus(orderId, "out_for_delivery");
      
      // Notify the delivery partner (in a real app, you might use a real-time service)
      
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error assigning delivery partner:", error);
      return res.status(500).json({ message: "Internal server error" });
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
      const todayOrders = allOrders.filter(order => new Date(order.createdAt) >= today);
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

  const httpServer = createServer(app);
  return httpServer;
}
