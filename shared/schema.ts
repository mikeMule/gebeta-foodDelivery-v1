import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  phoneNumber: text("phone_number").notNull().unique(),
  password: text("password").notNull(),
  location: text("location"),
  fullName: text("full_name"),
  email: text("email"),
  idNumber: text("id_number"),
  idVerified: boolean("id_verified").default(false),
  userType: text("user_type").notNull().default("customer"), // customer, restaurant_owner, delivery_partner, admin
  metadata: text("metadata").notNull().default("{}"), // JSON field for additional data like restaurantId, restaurantName
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  phoneNumber: true,
  password: true,
  location: true,
  fullName: true,
  email: true,
  idNumber: true,
  userType: true,
  metadata: true,
})
.extend({
  // These fields are stored in the metadata JSON field but exposed as top-level properties
  restaurantId: z.number().optional(),
  restaurantName: z.string().optional(),
});

// Restaurant table
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  categories: text("categories").notNull(),
  rating: doublePrecision("rating").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  distance: doublePrecision("distance").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  openingHours: text("opening_hours").notNull().default("09:00"),
  closingHours: text("closing_hours").notNull().default("21:00"),
  phone: text("phone").notNull().default("+251-11-111-1111"),
  address: text("address").notNull().default("Addis Ababa, Ethiopia"),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).pick({
  name: true,
  description: true,
  imageUrl: true,
  categories: true,
  rating: true,
  deliveryTime: true,
  deliveryFee: true,
  distance: true,
  latitude: true,
  longitude: true,
  openingHours: true,
  closingHours: true,
  phone: true,
  address: true,
});

// Food item table
export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).pick({
  restaurantId: true,
  name: true,
  description: true,
  category: true,
  price: true,
  imageUrl: true,
});

// Order table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  deliveryPartnerId: integer("delivery_partner_id"),
  status: text("status").notNull(),
  totalAmount: integer("total_amount").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  serviceFee: integer("service_fee").notNull(),
  restaurantCommissionAmount: integer("restaurant_commission_amount"), // calculated amount
  deliveryPartnerAmount: integer("delivery_partner_amount"), // calculated amount
  platformAmount: integer("platform_amount"), // calculated amount
  instructions: text("instructions"),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  estimatedDeliveryTime: text("estimated_delivery_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLatitude: doublePrecision("delivery_latitude"),
  deliveryLongitude: doublePrecision("delivery_longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  restaurantId: true,
  deliveryPartnerId: true,
  status: true,
  totalAmount: true,
  deliveryFee: true,
  serviceFee: true,
  instructions: true,
  paymentMethod: true,
  paymentStatus: true,
  estimatedDeliveryTime: true,
  deliveryAddress: true,
  deliveryLatitude: true,
  deliveryLongitude: true,
  updatedAt: true,
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  foodItemId: integer("food_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  notes: text("notes"),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  foodItemId: true,
  quantity: true,
  price: true,
  notes: true,
});

// Delivery Partner Profile
export const deliveryPartners = pgTable("delivery_partners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // reference to user with delivery_partner type
  vehicleType: text("vehicle_type").notNull(), // motorcycle, bicycle, car, etc.
  licensePlate: text("license_plate"),
  vehicleColor: text("vehicle_color"),
  rating: doublePrecision("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  active: boolean("active").default(true),
  currentLatitude: doublePrecision("current_latitude"),
  currentLongitude: doublePrecision("current_longitude"),
  lastLocationUpdate: timestamp("last_location_update"),
  maxDeliveryDistance: integer("max_delivery_distance").default(10000), // in meters
  commissionRate: doublePrecision("commission_rate").default(70.0), // percentage of delivery fee
  completedDeliveries: integer("completed_deliveries").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeliveryPartnerSchema = createInsertSchema(deliveryPartners).pick({
  userId: true,
  vehicleType: true,
  licensePlate: true,
  vehicleColor: true,
  maxDeliveryDistance: true,
  commissionRate: true,
});

// Reviews table for restaurants
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  restaurantId: true,
  rating: true,
  comment: true,
});

// Reviews for delivery partners
export const deliveryReviews = pgTable("delivery_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deliveryPartnerId: integer("delivery_partner_id").notNull(),
  orderId: integer("order_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeliveryReviewSchema = createInsertSchema(deliveryReviews).pick({
  userId: true,
  deliveryPartnerId: true,
  orderId: true,
  rating: true,
  comment: true,
});

// Types exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type DeliveryPartner = typeof deliveryPartners.$inferSelect;
export type InsertDeliveryPartner = z.infer<typeof insertDeliveryPartnerSchema>;

export type DeliveryReview = typeof deliveryReviews.$inferSelect;
export type InsertDeliveryReview = z.infer<typeof insertDeliveryReviewSchema>;

// Add financial transactions table before exports
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  type: text("type").notNull(), // 'restaurant_commission', 'delivery_partner_payment', 'platform_fee'
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed'
  recipientType: text("recipient_type").notNull(), // 'restaurant', 'delivery_partner', 'platform'
  recipientId: integer("recipient_id").notNull(), // restaurant_id or delivery_partner_id or null for platform
  transactionDate: timestamp("transaction_date").defaultNow(),
  paymentMethod: text("payment_method"),
  transactionReference: text("transaction_reference"),
  notes: text("notes"),
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).pick({
  orderId: true,
  type: true,
  amount: true,
  status: true,
  recipientType: true,
  recipientId: true,
  paymentMethod: true,
  transactionReference: true,
  notes: true,
});

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
