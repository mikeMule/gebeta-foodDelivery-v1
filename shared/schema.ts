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
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  phoneNumber: true,
  password: true,
  location: true,
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
  status: text("status").notNull(),
  totalAmount: integer("total_amount").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  serviceFee: integer("service_fee").notNull(),
  instructions: text("instructions"),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  restaurantId: true,
  status: true,
  totalAmount: true,
  deliveryFee: true,
  serviceFee: true,
  instructions: true,
  paymentMethod: true,
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

// Reviews table
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
