import { 
  type User, type InsertUser, 
  type Restaurant, type InsertRestaurant,
  type FoodItem, type InsertFoodItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Review, type InsertReview,
  users, restaurants, foodItems, orders, orderItems, reviews
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const PostgresSessionStore = connectPg(session);

// Helper function to safely parse metadata JSON
function parseMetadata(metadataStr: string | null): Record<string, any> {
  if (!metadataStr) return {};
  
  try {
    return JSON.parse(metadataStr);
  } catch (e) {
    console.error("Error parsing metadata:", e);
    return {};
  }
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Restaurant methods
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getAllRestaurants(): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant>;
  getRestaurantOwners(restaurantId: number): Promise<User[]>;
  
  // Food item methods
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  getFoodItemsByRestaurant(restaurantId: number): Promise<FoodItem[]>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  deleteFoodItem(id: number): Promise<void>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByRestaurant(restaurantId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  assignDeliveryPartner(orderId: number, deliveryPartnerId: number): Promise<Order>;
  
  // Order item methods
  getOrderItem(id: number): Promise<OrderItem | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Delivery methods
  getActiveDeliveryPartners(): Promise<any[]>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByRestaurant(restaurantId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Category methods
  getAllCategories(): Promise<string[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
    
    // Initialize the database with sample data once
    this.initializeDbIfNeeded();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      // We need to select all fields except fullName which has naming mismatch issues
      const result = await db.select({
        id: users.id,
        username: users.username,
        phoneNumber: users.phoneNumber,
        password: users.password,
        location: users.location,
        email: users.email,
        idNumber: users.idNumber,
        idVerified: users.idVerified,
        userType: users.userType,
        metadata: users.metadata,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, id));
      
      if (!result.length) return undefined;
      
      // Process metadata using our helper function
      const metadata = parseMetadata(result[0].metadata);
      
      // Return the user with metadata fields
      return {
        ...result[0],
        restaurantId: metadata.restaurantId ? parseInt(metadata.restaurantId as string) : undefined,
        restaurantName: metadata.restaurantName as string || undefined
      } as User;
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select({
        id: users.id,
        username: users.username,
        phoneNumber: users.phoneNumber,
        password: users.password,
        location: users.location,
        fullName: users.fullName,
        email: users.email,
        idNumber: users.idNumber,
        idVerified: users.idVerified,
        userType: users.userType,
        metadata: users.metadata,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.username, username));
      
      if (!result.length) return undefined;
      
      // Process metadata using our helper function
      const metadata = parseMetadata(result[0].metadata);
      
      // Return the user with metadata fields
      return {
        ...result[0],
        restaurantId: metadata.restaurantId ? parseInt(metadata.restaurantId as string) : undefined,
        restaurantName: metadata.restaurantName as string || undefined
      } as User;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return undefined;
    }
  }
  
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    try {
      const result = await db.select({
        id: users.id,
        username: users.username,
        phoneNumber: users.phoneNumber,
        password: users.password,
        location: users.location,
        fullName: users.fullName,
        email: users.email,
        idNumber: users.idNumber,
        idVerified: users.idVerified,
        userType: users.userType,
        metadata: users.metadata,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber));
      
      if (!result.length) return undefined;
      
      // Process metadata using our helper function
      const metadata = parseMetadata(result[0].metadata);
      
      // Return the user with metadata fields
      return {
        ...result[0],
        restaurantId: metadata.restaurantId ? parseInt(metadata.restaurantId as string) : undefined,
        restaurantName: metadata.restaurantName as string || undefined
      } as User;
    } catch (error) {
      console.error("Error in getUserByPhoneNumber:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Handle restaurant owner metadata
      const { restaurantId, restaurantName, ...userData } = insertUser as InsertUser & { 
        restaurantId?: number;
        restaurantName?: string;
      };
      
      // If this is a restaurant owner with restaurant info, store in metadata
      if (userData.userType === "restaurant_owner" && (restaurantId || restaurantName)) {
        const metadataObj = { restaurantId, restaurantName };
        userData.metadata = JSON.stringify(metadataObj);
      }
      
      console.log("Creating user with metadata:", userData.metadata);
      
      const result = await db.insert(users).values({
        ...userData,
        createdAt: new Date()
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  
  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const result = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return result[0];
  }
  
  async getAllRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants);
  }
  
  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const result = await db.insert(restaurants).values(insertRestaurant).returning();
    return result[0];
  }
  
  async updateRestaurant(id: number, restaurantData: Partial<InsertRestaurant>): Promise<Restaurant> {
    const result = await db
      .update(restaurants)
      .set(restaurantData)
      .where(eq(restaurants.id, id))
      .returning();
    return result[0];
  }
  
  async getRestaurantOwners(restaurantId: number): Promise<User[]> {
    try {
      // Get all users with type "restaurant_owner" and matching restaurantId
      const ownersResult = await db
        .select({
          id: users.id,
          username: users.username,
          phoneNumber: users.phoneNumber,
          password: users.password,
          location: users.location,
          fullName: users.fullName,
          email: users.email,
          idNumber: users.idNumber,
          idVerified: users.idVerified,
          userType: users.userType,
          metadata: users.metadata,
          createdAt: users.createdAt
        })
        .from(users)
        .where(
          and(
            eq(users.userType, "restaurant_owner"),
            // Using the metadata JSON field to check for restaurant ID
            sql`CAST(${users.metadata}->>'restaurantId' AS INTEGER) = ${restaurantId}`
          )
        );
      
      // Convert database fields to User objects with the restaurantId property
      return ownersResult.map(owner => {
        // Process metadata using our helper function
        const metadata = parseMetadata(owner.metadata);
        
        // Return User object with restaurantId from metadata
        return {
          ...owner,
          restaurantId: metadata.restaurantId ? parseInt(metadata.restaurantId as string) : restaurantId,
          restaurantName: metadata.restaurantName as string || null
        } as User;
      });
    } catch (error) {
      console.error("Error in getRestaurantOwners:", error);
      return []; // Return empty array in case of error
    }
  }
  
  // Food item methods
  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    const result = await db.select().from(foodItems).where(eq(foodItems.id, id));
    return result[0];
  }
  
  async getFoodItemsByRestaurant(restaurantId: number): Promise<FoodItem[]> {
    return await db.select().from(foodItems).where(eq(foodItems.restaurantId, restaurantId));
  }
  
  async createFoodItem(insertFoodItem: InsertFoodItem): Promise<FoodItem> {
    const result = await db.insert(foodItems).values(insertFoodItem).returning();
    return result[0];
  }
  
  async deleteFoodItem(id: number): Promise<void> {
    await db.delete(foodItems).where(eq(foodItems.id, id));
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values({
      ...insertOrder,
      createdAt: new Date()
    }).returning();
    return result[0];
  }
  
  // Order item methods
  async getOrderItem(id: number): Promise<OrderItem | undefined> {
    const result = await db.select().from(orderItems).where(eq(orderItems.id, id));
    return result[0];
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(insertOrderItem).returning();
    return result[0];
  }
  
  // New methods for Restaurant Management
  
  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.restaurantId, restaurantId));
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const result = await db
      .update(orders)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }
  
  async assignDeliveryPartner(orderId: number, deliveryPartnerId: number): Promise<Order> {
    const result = await db
      .update(orders)
      .set({ 
        deliveryPartnerId, 
        status: "out_for_delivery",
        updatedAt: new Date() 
      })
      .where(eq(orders.id, orderId))
      .returning();
    return result[0];
  }
  
  async getActiveDeliveryPartners(): Promise<any[]> {
    // In a real app, we'd query a delivery_partners table
    // For now, we'll return mock data
    return [
      {
        id: 1,
        userId: 101,
        vehicleType: "Motorcycle",
        plateNumber: "ET-125-4567",
        activeOrderCount: 0,
        rating: 4.8,
        status: "available",
        currentLatitude: 9.0278,
        currentLongitude: 38.7577,
        user: {
          id: 101,
          fullName: "Abel Tesfaye",
          phoneNumber: "0932456789"
        }
      },
      {
        id: 2,
        userId: 102,
        vehicleType: "Bicycle",
        plateNumber: null,
        activeOrderCount: 1,
        rating: 4.6,
        status: "available",
        currentLatitude: 9.0298,
        currentLongitude: 38.7623,
        user: {
          id: 102,
          fullName: "Frehiwot Abebe",
          phoneNumber: "0911345678"
        }
      },
      {
        id: 3,
        userId: 103,
        vehicleType: "Motorcycle",
        plateNumber: "ET-872-1234",
        activeOrderCount: 0,
        rating: 4.9,
        status: "available",
        currentLatitude: 9.0315,
        currentLongitude: 38.7521,
        user: {
          id: 103,
          fullName: "Samuel Mekonen",
          phoneNumber: "0935678901"
        }
      }
    ];
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(eq(reviews.id, id));
    return result[0];
  }
  
  async getReviewsByRestaurant(restaurantId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.restaurantId, restaurantId));
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values({
      ...insertReview,
      createdAt: new Date()
    }).returning();
    return result[0];
  }
  
  // Category methods
  async getAllCategories(): Promise<string[]> {
    try {
      // Get all restaurants first
      const restaurants = await this.getAllRestaurants();
      
      // Extract and flatten categories
      const categorySet = new Set<string>();
      
      restaurants.forEach(restaurant => {
        const categories = restaurant.categories.split(', ');
        categories.forEach(category => categorySet.add(category));
      });
      
      // Convert to array and sort
      return Array.from(categorySet).sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }
  
  // Helper method to check if database has been initialized
  private async initializeDbIfNeeded() {
    // Check if we already have restaurants
    const existingRestaurants = await db.select().from(restaurants);
    
    if (existingRestaurants.length === 0) {
      await this.initializeMockData();
    }
  }
  
  // Initialize with mock data
  private async initializeMockData() {
    try {
      // Create mock users with properly hashed password
      const hashedPassword = await (async () => {
        const salt = randomBytes(16).toString("hex");
        const buf = await scryptAsync("password", salt, 64) as Buffer;
        return `${buf.toString("hex")}.${salt}`;
      })();
      
      const user = await this.createUser({
        username: "user1",
        phoneNumber: "0916182957",
        password: hashedPassword,
        location: "Bole, Addis Ababa"
      });
      
      // Create mock restaurants
      const restaurant1 = await this.createRestaurant({
        name: "Gusto Restaurant",
        description: "Authentic Italian cuisine",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop",
        categories: "Italian, Pizza, Pasta",
        rating: 4.8,
        deliveryTime: "15-25 min",
        deliveryFee: 0,
        distance: 1.2,
        latitude: 9.0292,
        longitude: 38.7469
      });
      
      const restaurant2 = await this.createRestaurant({
        name: "Abyssinia Kitchen",
        description: "Traditional Ethiopian food",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop",
        categories: "Ethiopian, Traditional",
        rating: 4.5,
        deliveryTime: "25-35 min",
        deliveryFee: 20,
        distance: 0.8,
        latitude: 9.0259,
        longitude: 38.7578
      });
      
      const restaurant3 = await this.createRestaurant({
        name: "Burger House",
        description: "Best burgers in town",
        imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop",
        categories: "Fast Food, Burgers, Fries",
        rating: 4.7,
        deliveryTime: "15-20 min",
        deliveryFee: 0,
        distance: 1.5,
        latitude: 9.0323,
        longitude: 38.7612
      });
      
      // Create mock food items for the first restaurant
      await this.createFoodItem({
        restaurantId: restaurant1.id,
        name: "Margherita Pizza",
        description: "Classic tomato sauce, mozzarella cheese, and fresh basil",
        category: "Pizza",
        price: 180,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant1.id,
        name: "Pepperoni Pizza",
        description: "Tomato sauce, mozzarella, and pepperoni slices",
        category: "Pizza",
        price: 210,
        imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant1.id,
        name: "Spaghetti Carbonara",
        description: "Creamy sauce with eggs, cheese, pancetta, and black pepper",
        category: "Pasta",
        price: 160,
        imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant1.id,
        name: "Fettuccine Alfredo",
        description: "Creamy Parmesan sauce with butter and fresh parsley",
        category: "Pasta",
        price: 170,
        imageUrl: "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=300&auto=format&fit=crop"
      });
      
      // Create mock food items for other restaurants
      await this.createFoodItem({
        restaurantId: restaurant2.id,
        name: "Doro Wat",
        description: "Spicy chicken stew served with injera",
        category: "Main Course",
        price: 220,
        imageUrl: "https://images.unsplash.com/photo-1567888033478-593a83beca49?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant2.id,
        name: "Tibs",
        description: "Sautéed meat with vegetables and spices",
        category: "Main Course",
        price: 190,
        imageUrl: "https://images.unsplash.com/photo-1530990457142-bb18a120834d?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant3.id,
        name: "Classic Cheeseburger",
        description: "Beef patty with cheese, lettuce, tomato, and special sauce",
        category: "Burgers",
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant3.id,
        name: "Crispy Chicken Burger",
        description: "Crispy chicken fillet with lettuce, pickles, and mayo",
        category: "Burgers",
        price: 140,
        imageUrl: "https://images.unsplash.com/photo-1626078299034-58cd871ee9c3?w=300&auto=format&fit=crop"
      });
      
      // Create mock reviews
      await this.createReview({
        userId: user.id,
        restaurantId: restaurant1.id,
        rating: 5,
        comment: "Amazing food, fast delivery!"
      });
      
      await this.createReview({
        userId: user.id,
        restaurantId: restaurant2.id,
        rating: 4,
        comment: "Authentic Ethiopian food, loved it."
      });
      
      console.log("Database initialized with mock data");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
}

export const storage = new DatabaseStorage();
