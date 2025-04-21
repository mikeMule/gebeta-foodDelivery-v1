import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = z.object({ phoneNumber: z.string() }).parse(req.body);
      const user = await storage.getUserByPhoneNumber(phoneNumber);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // In a real app, you'd verify credentials and set up sessions
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post("/api/verify-otp", async (req: Request, res: Response) => {
    try {
      const { phoneNumber, otp } = z.object({ 
        phoneNumber: z.string(),
        otp: z.string() 
      }).parse(req.body);
      
      // Verify OTP with mock data (1234)
      if (otp !== "1234") {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      
      const user = await storage.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        // Create a new user if not found
        const newUser = await storage.createUser({ 
          username: `user_${Date.now()}`,
          phoneNumber, 
          password: "default_password",
          location: "Bole, Addis Ababa"
        });
        return res.json(newUser);
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid verification data" });
    }
  });

  // Restaurant routes
  app.get("/api/restaurants", async (req: Request, res: Response) => {
    const restaurants = await storage.getAllRestaurants();
    res.json(restaurants);
  });

  app.get("/api/restaurants/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const restaurant = await storage.getRestaurant(id);
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    res.json(restaurant);
  });

  // Food item routes
  app.get("/api/restaurants/:id/food-items", async (req: Request, res: Response) => {
    const restaurantId = parseInt(req.params.id);
    const foodItems = await storage.getFoodItemsByRestaurant(restaurantId);
    res.json(foodItems);
  });

  // Order routes
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const { orderItems } = req.body;
      if (Array.isArray(orderItems)) {
        for (const item of orderItems) {
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
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const orderItems = await storage.getOrderItems(id);
    res.json({ ...order, items: orderItems });
  });

  // Review routes
  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  app.get("/api/restaurants/:id/reviews", async (req: Request, res: Response) => {
    const restaurantId = parseInt(req.params.id);
    const reviews = await storage.getReviewsByRestaurant(restaurantId);
    res.json(reviews);
  });

  // Categories route
  app.get("/api/categories", async (req: Request, res: Response) => {
    const categories = await storage.getAllCategories();
    res.json(categories);
  });

  const httpServer = createServer(app);
  return httpServer;
}
