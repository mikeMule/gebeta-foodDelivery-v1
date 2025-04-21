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
  
  // Food item methods
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  getFoodItemsByRestaurant(restaurantId: number): Promise<FoodItem[]>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Order item methods
  getOrderItem(id: number): Promise<OrderItem | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
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
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      createdAt: new Date()
    }).returning();
    return result[0];
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
    // Using a raw SQL query to extract and flatten categories from all restaurants
    const rows = await db.execute(sql`
      SELECT DISTINCT unnest(string_to_array(categories, ', ')) as category
      FROM restaurants
      ORDER BY category
    `);
    
    // Convert unknown type to any safely
    const result = rows as unknown as Array<{category: string}>;
    return result.map(row => row.category);
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
