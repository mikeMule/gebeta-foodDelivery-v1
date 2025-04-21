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

// Middleware to check if user is authenticated
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Restaurant routes
  app.get("/api/restaurants", async (req: Request, res: Response) => {
    try {
      const restaurants = await storage.getAllRestaurants();
      res.json(restaurants);
    } catch (error) {
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
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Enforce that the userId in the order matches the authenticated user
      if (orderData.userId !== req.user.id) {
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
      if (order.userId !== req.user.id) {
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
      const orders = await storage.getOrdersByUser(req.user.id);
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
        userId: req.user.id // Set the userId from the authenticated user
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

  const httpServer = createServer(app);
  return httpServer;
}
