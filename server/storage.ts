import { 
  type User, type InsertUser, 
  type Restaurant, type InsertRestaurant,
  type RestaurantOwner, type InsertRestaurantOwner,
  type FoodCategory, type InsertFoodCategory,
  type FoodItem, type InsertFoodItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Review, type InsertReview,
  type FinancialTransaction, type InsertFinancialTransaction,
  users, restaurants, restaurantOwners, foodCategories, foodItems, 
  orders, orderItems, reviews, financialTransactions
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
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Restaurant methods
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getAllRestaurants(): Promise<Restaurant[]>;
  getActiveRestaurants(): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant>;
  deleteRestaurant(id: number): Promise<void>;
  approveRestaurant(id: number): Promise<Restaurant>;
  
  // Restaurant Owner methods
  getRestaurantOwner(id: number): Promise<RestaurantOwner | undefined>;
  getRestaurantOwnerByUserId(userId: number): Promise<RestaurantOwner | undefined>;
  getRestaurantOwners(restaurantId: number): Promise<User[]>;
  createRestaurantOwner(owner: InsertRestaurantOwner): Promise<RestaurantOwner>;
  updateRestaurantOwner(id: number, ownerData: Partial<InsertRestaurantOwner>): Promise<RestaurantOwner>;
  deleteRestaurantOwner(id: number): Promise<void>;
  
  // Food Category methods
  getFoodCategory(id: number): Promise<FoodCategory | undefined>;
  getAllFoodCategories(): Promise<FoodCategory[]>;
  getActiveFoodCategories(): Promise<FoodCategory[]>;
  createFoodCategory(category: InsertFoodCategory): Promise<FoodCategory>;
  updateFoodCategory(id: number, categoryData: Partial<InsertFoodCategory>): Promise<FoodCategory>;
  deleteFoodCategory(id: number): Promise<void>;
  
  // Food item methods
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  getFoodItemsByRestaurant(restaurantId: number): Promise<FoodItem[]>;
  getFoodItemsByCategory(categoryId: number): Promise<FoodItem[]>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: number, foodItemData: Partial<InsertFoodItem>): Promise<FoodItem>;
  deleteFoodItem(id: number): Promise<void>;
  approveFoodItem(id: number): Promise<FoodItem>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByRestaurant(restaurantId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  assignDeliveryPartner(orderId: number, deliveryPartnerId: number): Promise<Order>;
  approveOrder(id: number): Promise<Order>;
  
  // Order item methods
  getOrderItem(id: number): Promise<OrderItem | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: number, itemData: Partial<InsertOrderItem>): Promise<OrderItem>;
  deleteOrderItem(id: number): Promise<void>;
  
  // Delivery methods
  getActiveDeliveryPartners(): Promise<any[]>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByRestaurant(restaurantId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: number): Promise<void>;
  
  // Financial Transaction methods
  getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined>;
  getFinancialTransactionsByOrder(orderId: number): Promise<FinancialTransaction[]>;
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;
  updateFinancialTransactionStatus(id: number, status: string): Promise<FinancialTransaction>;
  
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
      // Use raw SQL to avoid field name issues with camelCase vs snake_case
      const result = await db.execute(
        sql`SELECT * FROM users WHERE username = ${username}`
      );
      
      if (!result.rows || result.rows.length === 0) return undefined;
      
      // Map the raw database row to our User type
      const user = {
        id: result.rows[0].id,
        username: result.rows[0].username,
        phoneNumber: result.rows[0].phone_number,
        password: result.rows[0].password,
        location: result.rows[0].location,
        fullName: result.rows[0].full_name,
        email: result.rows[0].email,
        idNumber: result.rows[0].id_number,
        idVerified: result.rows[0].id_verified,
        userType: result.rows[0].user_type,
        metadata: result.rows[0].metadata,
        createdAt: result.rows[0].created_at
      };
      
      // Process metadata using our helper function
      const metadata = parseMetadata(user.metadata);
      
      // Return the user with metadata fields
      return {
        ...user,
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
      // Use raw SQL to avoid field name issues with camelCase vs snake_case
      const result = await db.execute(
        sql`SELECT * FROM users WHERE phone_number = ${phoneNumber}`
      );
      
      if (!result.rows || result.rows.length === 0) return undefined;
      
      // Map the raw database row to our User type
      const user = {
        id: result.rows[0].id,
        username: result.rows[0].username,
        phoneNumber: result.rows[0].phone_number,
        password: result.rows[0].password,
        location: result.rows[0].location,
        fullName: result.rows[0].full_name,
        email: result.rows[0].email,
        idNumber: result.rows[0].id_number,
        idVerified: result.rows[0].id_verified,
        userType: result.rows[0].user_type,
        metadata: result.rows[0].metadata,
        createdAt: result.rows[0].created_at
      };
      
      // Process metadata using our helper function
      const metadata = parseMetadata(user.metadata);
      
      // Return the user with metadata fields
      return {
        ...user,
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
        console.log("Creating restaurant owner with metadata:", metadataObj);
      }
      
      // Map camelCase to snake_case for database columns
      // We need to do this explicitly since the actual column names are snake_case in the DB
      const query = sql`
        INSERT INTO users (
          username, phone_number, password, location, full_name, 
          email, id_number, id_verified, user_type, metadata, created_at
        ) 
        VALUES (
          ${userData.username}, 
          ${userData.phoneNumber}, 
          ${userData.password}, 
          ${userData.location || null}, 
          ${userData.fullName || null},
          ${userData.email || null}, 
          ${userData.idNumber || null}, 
          ${false}, 
          ${userData.userType || 'customer'}, 
          ${userData.metadata || '{}'}, 
          ${new Date()}
        )
        RETURNING *
      `;
      
      console.log("Creating user with data:", {
        username: userData.username,
        phoneNumber: userData.phoneNumber,
        password: "****", // Mask password in logs
        userType: userData.userType,
        fullName: userData.fullName
      });
      
      // Execute the SQL query
      const result = await db.execute(query);
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error("Failed to create user - no result returned");
      }
      
      // Map the raw database row to our User type
      const user = {
        id: result.rows[0].id,
        username: result.rows[0].username,
        phoneNumber: result.rows[0].phone_number,
        password: result.rows[0].password,
        location: result.rows[0].location,
        fullName: result.rows[0].full_name,
        email: result.rows[0].email,
        idNumber: result.rows[0].id_number,
        idVerified: result.rows[0].id_verified,
        userType: result.rows[0].user_type,
        metadata: result.rows[0].metadata,
        createdAt: result.rows[0].created_at
      };
      
      // Process metadata using our helper function
      const metadata = parseMetadata(user.metadata);
      
      return {
        ...user,
        restaurantId: metadata.restaurantId ? parseInt(metadata.restaurantId as string) : undefined,
        restaurantName: metadata.restaurantName as string || undefined,
      } as User;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    try {
      // Handle restaurant owner metadata
      const { restaurantId, restaurantName, ...userUpdateData } = userData as Partial<InsertUser> & { 
        restaurantId?: number;
        restaurantName?: string;
      };
      
      // If updating a restaurant owner with restaurant info, update metadata
      let metadataUpdate = '';
      if (restaurantId !== undefined || restaurantName !== undefined) {
        // Get current user to retrieve existing metadata
        const currentUser = await this.getUser(id);
        if (!currentUser) {
          throw new Error(`User with ID ${id} not found`);
        }
        
        // Parse current metadata
        const currentMetadata = parseMetadata(typeof currentUser.metadata === 'string' 
          ? currentUser.metadata 
          : JSON.stringify(currentUser.metadata || {}));
        
        // Update metadata with new values
        const updatedMetadata = {
          ...currentMetadata,
          ...(restaurantId !== undefined ? { restaurantId } : {}),
          ...(restaurantName !== undefined ? { restaurantName } : {})
        };
        
        // Set metadata update SQL
        metadataUpdate = `, metadata = '${JSON.stringify(updatedMetadata)}'`;
      }
      
      // Build SET clauses for SQL update
      const setClauses: string[] = [];
      if (userUpdateData.username) setClauses.push(`username = '${userUpdateData.username}'`);
      if (userUpdateData.phoneNumber) setClauses.push(`phone_number = '${userUpdateData.phoneNumber}'`);
      if (userUpdateData.password) setClauses.push(`password = '${userUpdateData.password}'`);
      if (userUpdateData.location) setClauses.push(`location = '${userUpdateData.location}'`);
      if (userUpdateData.fullName) setClauses.push(`full_name = '${userUpdateData.fullName}'`);
      if (userUpdateData.email) setClauses.push(`email = '${userUpdateData.email}'`);
      if (userUpdateData.idNumber) setClauses.push(`id_number = '${userUpdateData.idNumber}'`);
      if (userUpdateData.idVerified !== undefined) setClauses.push(`id_verified = ${userUpdateData.idVerified}`);
      if (userUpdateData.userType) setClauses.push(`user_type = '${userUpdateData.userType}'`);
      
      // If no fields to update, return the existing user
      if (setClauses.length === 0 && !metadataUpdate) {
        return await this.getUser(id) as User;
      }
      
      // Construct the SQL query
      const setClause = setClauses.join(', ') + metadataUpdate;
      const query = `
        UPDATE users 
        SET ${setClause}
        WHERE id = ${id}
        RETURNING *
      `;
      
      console.log(`Updating user ${id} with:`, {
        ...userUpdateData,
        password: userUpdateData.password ? "****" : undefined, // Mask password in logs
        metadataUpdated: metadataUpdate.length > 0
      });
      
      // Execute the SQL query
      const result = await db.execute(sql`${query}`);
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error(`Failed to update user ${id} - no result returned`);
      }
      
      // Map the raw database row to our User type
      const user = {
        id: result.rows[0].id,
        username: result.rows[0].username,
        phoneNumber: result.rows[0].phone_number,
        password: result.rows[0].password,
        location: result.rows[0].location,
        fullName: result.rows[0].full_name,
        email: result.rows[0].email,
        idNumber: result.rows[0].id_number,
        idVerified: result.rows[0].id_verified,
        userType: result.rows[0].user_type,
        metadata: result.rows[0].metadata,
        createdAt: result.rows[0].created_at
      };
      
      // Process metadata using our helper function
      const metadata = parseMetadata(user.metadata);
      
      return {
        ...user,
        restaurantId: metadata.restaurantId ? parseInt(metadata.restaurantId as string) : undefined,
        restaurantName: metadata.restaurantName as string || undefined,
      } as User;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }
  
  async deleteUser(id: number): Promise<void> {
    try {
      console.log(`Deleting user with ID: ${id}`);
      // Using raw SQL to avoid field name issues
      await db.execute(sql`DELETE FROM users WHERE id = ${id}`);
      console.log(`User ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
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
  
  async getActiveRestaurants(): Promise<Restaurant[]> {
    return await db.select()
      .from(restaurants)
      .where(eq(restaurants.active, true));
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
  
  async deleteRestaurant(id: number): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }
  
  async approveRestaurant(id: number): Promise<Restaurant> {
    const result = await db
      .update(restaurants)
      .set({ 
        approved: true,
        active: true
      })
      .where(eq(restaurants.id, id))
      .returning();
    return result[0];
  }
  
  // Restaurant Owner methods
  async getRestaurantOwner(id: number): Promise<RestaurantOwner | undefined> {
    const result = await db.select().from(restaurantOwners).where(eq(restaurantOwners.id, id));
    return result[0];
  }
  
  async getRestaurantOwnerByUserId(userId: number): Promise<RestaurantOwner | undefined> {
    const result = await db.select().from(restaurantOwners).where(eq(restaurantOwners.userId, userId));
    return result[0];
  }
  
  async createRestaurantOwner(owner: InsertRestaurantOwner): Promise<RestaurantOwner> {
    const result = await db.insert(restaurantOwners).values(owner).returning();
    return result[0];
  }
  
  async updateRestaurantOwner(id: number, ownerData: Partial<InsertRestaurantOwner>): Promise<RestaurantOwner> {
    const result = await db
      .update(restaurantOwners)
      .set(ownerData)
      .where(eq(restaurantOwners.id, id))
      .returning();
    return result[0];
  }
  
  async deleteRestaurantOwner(id: number): Promise<void> {
    await db.delete(restaurantOwners).where(eq(restaurantOwners.id, id));
  }
  
  // Food Category methods
  async getFoodCategory(id: number): Promise<FoodCategory | undefined> {
    const result = await db.select().from(foodCategories).where(eq(foodCategories.id, id));
    return result[0];
  }
  
  async getAllFoodCategories(): Promise<FoodCategory[]> {
    return await db.select().from(foodCategories);
  }
  
  async getActiveFoodCategories(): Promise<FoodCategory[]> {
    return await db.select()
      .from(foodCategories)
      .where(eq(foodCategories.active, true));
  }
  
  async createFoodCategory(category: InsertFoodCategory): Promise<FoodCategory> {
    const result = await db.insert(foodCategories).values(category).returning();
    return result[0];
  }
  
  async updateFoodCategory(id: number, categoryData: Partial<InsertFoodCategory>): Promise<FoodCategory> {
    const result = await db
      .update(foodCategories)
      .set(categoryData)
      .where(eq(foodCategories.id, id))
      .returning();
    return result[0];
  }
  
  async deleteFoodCategory(id: number): Promise<void> {
    await db.delete(foodCategories).where(eq(foodCategories.id, id));
  }
  
  async getRestaurantOwners(restaurantId: number): Promise<User[]> {
    try {
      // Use raw SQL instead of the query builder to avoid type issues with metadata
      const query = sql`
        SELECT * FROM users
        WHERE user_type = 'restaurant_owner'
        AND metadata::jsonb->>'restaurantId' = ${restaurantId.toString()}
      `;
      
      const result = await db.execute(query);
      
      if (!result.rows || result.rows.length === 0) {
        return [];
      }
      
      // Map the database rows to User objects
      return result.rows.map((row: any) => {
        // Process metadata
        const metadata = parseMetadata(row.metadata);
        
        // Create User object
        return {
          id: row.id,
          username: row.username,
          phoneNumber: row.phone_number,
          password: row.password,
          location: row.location,
          fullName: row.full_name,
          email: row.email,
          idNumber: row.id_number,
          idVerified: row.id_verified,
          userType: row.user_type,
          createdAt: row.created_at,
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
    try {
      // Use raw SQL to get around schema mismatches
      const query = sql`
        SELECT * FROM food_items 
        WHERE restaurant_id = ${restaurantId}
      `;
      
      const result = await db.execute(query);
      
      if (!result.rows || result.rows.length === 0) {
        return [];
      }
      
      // Transform the raw data into our FoodItem type
      return result.rows.map((row: any) => {
        return {
          id: row.id,
          restaurantId: row.restaurant_id,
          name: row.name,
          description: row.description,
          categoryId: row.category_id || 0, // Handle missing categoryId
          price: row.price,
          imageUrl: row.image_url,
          isAvailable: row.is_available,
          isApproved: row.is_approved,
          isSpecial: row.is_special || false,
          isVegetarian: row.is_vegetarian || false,
          isSpicy: row.is_spicy || false,
          needsApproval: row.needs_approval || true,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          // Keep the text category as well for compatibility
          category: row.category
        } as FoodItem;
      });
    } catch (error) {
      console.error("Error fetching food items by restaurant:", error);
      return [];
    }
  }
  
  async getFoodItemsByCategory(categoryId: number): Promise<FoodItem[]> {
    return await db.select().from(foodItems).where(eq(foodItems.categoryId, categoryId));
  }
  
  async createFoodItem(insertFoodItem: InsertFoodItem): Promise<FoodItem> {
    try {
      // Handle the case where we're transitioning from category string to categoryId
      const data = { ...insertFoodItem };
      
      // If we have a category string coming in but no categoryId, 
      // use the category string and ensure we save both for compatibility
      if (!data.categoryId && data.category) {
        // Just use the category text field for now
        // In a production app, we would look up or create the category ID
      }
      
      // Use raw SQL to insert with both fields
      const query = sql`
        INSERT INTO food_items (
          restaurant_id, 
          name, 
          description,
          category, 
          category_id,
          price, 
          image_url, 
          is_approved, 
          is_available
        ) VALUES (
          ${data.restaurantId}, 
          ${data.name}, 
          ${data.description}, 
          ${data.category || 'Uncategorized'},
          ${data.categoryId || null},
          ${data.price},
          ${data.imageUrl || null},
          ${data.isApproved ?? false},
          ${data.isAvailable ?? true}
        )
        RETURNING *
      `;
      
      const result = await db.execute(query);
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error('Failed to create food item');
      }
      
      const row = result.rows[0];
      
      // Transform DB row to FoodItem type
      return {
        id: row.id,
        restaurantId: row.restaurant_id,
        name: row.name,
        description: row.description,
        categoryId: row.category_id || 0,
        category: row.category,
        price: row.price,
        imageUrl: row.image_url,
        isAvailable: row.is_available,
        isApproved: row.is_approved,
        isSpecial: row.is_special || false,
        isVegetarian: row.is_vegetarian || false,
        isSpicy: row.is_spicy || false,
        needsApproval: row.needs_approval || true,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as FoodItem;
    } catch (error) {
      console.error("Error creating food item:", error);
      throw error;
    }
  }
  
  async updateFoodItem(id: number, foodItemData: Partial<InsertFoodItem>): Promise<FoodItem> {
    const result = await db
      .update(foodItems)
      .set(foodItemData)
      .where(eq(foodItems.id, id))
      .returning();
    return result[0];
  }
  
  async deleteFoodItem(id: number): Promise<void> {
    await db.delete(foodItems).where(eq(foodItems.id, id));
  }
  
  async approveFoodItem(id: number): Promise<FoodItem> {
    const result = await db
      .update(foodItems)
      .set({ 
        isApproved: true,
        isAvailable: true
      })
      .where(eq(foodItems.id, id))
      .returning();
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
  
  async updateOrderItem(id: number, itemData: Partial<InsertOrderItem>): Promise<OrderItem> {
    const result = await db
      .update(orderItems)
      .set(itemData)
      .where(eq(orderItems.id, id))
      .returning();
    return result[0];
  }
  
  async deleteOrderItem(id: number): Promise<void> {
    await db.delete(orderItems).where(eq(orderItems.id, id));
  }
  
  // New methods for Restaurant Management
  
  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    try {
      // Use raw SQL to avoid column mismatch issues
      const query = sql`
        SELECT * FROM orders 
        WHERE restaurant_id = ${restaurantId}
        ORDER BY created_at DESC
      `;
      
      const result = await db.execute(query);
      
      if (!result.rows || result.rows.length === 0) {
        return [];
      }
      
      // Map database rows to Order objects
      return result.rows.map((row: any) => {
        return {
          id: row.id,
          userId: row.user_id,
          restaurantId: row.restaurant_id,
          deliveryPartnerId: row.delivery_partner_id,
          status: row.status,
          totalAmount: row.total_amount,
          deliveryFee: row.delivery_fee,
          serviceFee: row.service_fee || 0,
          restaurantCommissionAmount: row.restaurant_commission_amount || 0,
          deliveryPartnerAmount: row.delivery_partner_amount || 0,
          platformAmount: row.platform_amount || 0,
          instructions: row.instructions,
          paymentMethod: row.payment_method,
          paymentStatus: row.payment_status,
          estimatedDeliveryTime: row.estimated_delivery_time,
          actualDeliveryTime: row.actual_delivery_time,
          deliveryAddress: row.delivery_address,
          deliveryLatitude: row.delivery_latitude,
          deliveryLongitude: row.delivery_longitude,
          isRead: row.is_read || false,
          needsApproval: row.needs_approval || true,
          adminApproved: row.admin_approved || false,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as Order;
      });
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      return [];
    }
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
  
  async approveOrder(id: number): Promise<Order> {
    const result = await db
      .update(orders)
      .set({ 
        adminApproved: true,
        needsApproval: false,
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id))
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
  
  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }
  
  // Financial Transaction methods
  async getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined> {
    const result = await db.select().from(financialTransactions).where(eq(financialTransactions.id, id));
    return result[0];
  }
  
  async getFinancialTransactionsByOrder(orderId: number): Promise<FinancialTransaction[]> {
    return await db.select().from(financialTransactions).where(eq(financialTransactions.orderId, orderId));
  }
  
  async createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    const result = await db.insert(financialTransactions).values(transaction).returning();
    return result[0];
  }
  
  async updateFinancialTransactionStatus(id: number, status: string): Promise<FinancialTransaction> {
    const result = await db
      .update(financialTransactions)
      .set({ status })
      .where(eq(financialTransactions.id, id))
      .returning();
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
      // Create a pizza category first
      const pizzaCategory = await this.createFoodCategory({
        name: "Pizza",
        description: "Italian dish consisting of a flattened disk of bread dough topped with tomato sauce, cheese, and various toppings",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant1.id,
        name: "Margherita Pizza",
        description: "Classic tomato sauce, mozzarella cheese, and fresh basil",
        categoryId: pizzaCategory.id,
        price: 180,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant1.id,
        name: "Pepperoni Pizza",
        description: "Tomato sauce, mozzarella, and pepperoni slices",
        categoryId: pizzaCategory.id,
        price: 210,
        imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300&auto=format&fit=crop"
      });
      
      // Create pasta category
      const pastaCategory = await this.createFoodCategory({
        name: "Pasta",
        description: "Italian dish made of unleavened dough of wheat flour mixed with water or eggs",
        imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant1.id,
        name: "Spaghetti Carbonara",
        description: "Creamy sauce with eggs, cheese, pancetta, and black pepper",
        categoryId: pastaCategory.id,
        price: 160,
        imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant1.id,
        name: "Fettuccine Alfredo",
        description: "Creamy Parmesan sauce with butter and fresh parsley",
        categoryId: pastaCategory.id,
        price: 170,
        imageUrl: "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=300&auto=format&fit=crop"
      });
      
      // Create main course category
      const mainCourseCategory = await this.createFoodCategory({
        name: "Main Course",
        description: "Primary dish in a meal",
        imageUrl: "https://images.unsplash.com/photo-1567888033478-593a83beca49?w=300&auto=format&fit=crop"
      });
      
      // Create mock food items for other restaurants
      await this.createFoodItem({
        restaurantId: restaurant2.id,
        name: "Doro Wat",
        description: "Spicy chicken stew served with injera",
        categoryId: mainCourseCategory.id,
        price: 220,
        imageUrl: "https://images.unsplash.com/photo-1567888033478-593a83beca49?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant2.id,
        name: "Tibs",
        description: "Sautéed meat with vegetables and spices",
        categoryId: mainCourseCategory.id,
        price: 190,
        imageUrl: "https://images.unsplash.com/photo-1530990457142-bb18a120834d?w=300&auto=format&fit=crop"
      });
      
      // Create burgers category
      const burgersCategory = await this.createFoodCategory({
        name: "Burgers",
        description: "Sandwich consisting of one or more cooked patties, placed inside a sliced bun",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant3.id,
        name: "Classic Cheeseburger",
        description: "Beef patty with cheese, lettuce, tomato, and special sauce",
        categoryId: burgersCategory.id,
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop"
      });
      
      await this.createFoodItem({
        restaurantId: restaurant3.id,
        name: "Crispy Chicken Burger",
        description: "Crispy chicken fillet with lettuce, pickles, and mayo",
        categoryId: burgersCategory.id,
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
