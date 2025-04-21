import { 
  type User, type InsertUser, 
  type Restaurant, type InsertRestaurant,
  type FoodItem, type InsertFoodItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Review, type InsertReview
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private restaurants: Map<number, Restaurant>;
  private foodItems: Map<number, FoodItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  
  private userId: number;
  private restaurantId: number;
  private foodItemId: number;
  private orderId: number;
  private orderItemId: number;
  private reviewId: number;

  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.foodItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    
    this.userId = 1;
    this.restaurantId = 1;
    this.foodItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.reviewId = 1;
    
    // Initialize with some mock data
    this.initializeMockData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phoneNumber === phoneNumber
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }
  
  async getAllRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }
  
  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.restaurantId++;
    const restaurant: Restaurant = { ...insertRestaurant, id };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }
  
  // Food item methods
  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }
  
  async getFoodItemsByRestaurant(restaurantId: number): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(
      (item) => item.restaurantId === restaurantId
    );
  }
  
  async createFoodItem(insertFoodItem: InsertFoodItem): Promise<FoodItem> {
    const id = this.foodItemId++;
    const foodItem: FoodItem = { ...insertFoodItem, id };
    this.foodItems.set(id, foodItem);
    return foodItem;
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const order: Order = { ...insertOrder, id, createdAt: new Date() };
    this.orders.set(id, order);
    return order;
  }
  
  // Order item methods
  async getOrderItem(id: number): Promise<OrderItem | undefined> {
    return this.orderItems.get(id);
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByRestaurant(restaurantId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.restaurantId === restaurantId
    );
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const review: Review = { ...insertReview, id, createdAt: new Date() };
    this.reviews.set(id, review);
    return review;
  }
  
  // Category methods
  async getAllCategories(): Promise<string[]> {
    const categories = new Set<string>();
    
    // Extract categories from all restaurants
    for (const restaurant of this.restaurants.values()) {
      const restaurantCategories = restaurant.categories.split(", ");
      restaurantCategories.forEach(category => categories.add(category));
    }
    
    return Array.from(categories);
  }
  
  // Initialize with mock data
  private initializeMockData() {
    // Create mock users
    this.createUser({
      username: "user1",
      phoneNumber: "0916182957",
      password: "password",
      location: "Bole, Addis Ababa"
    });
    
    // Create mock restaurants
    const restaurant1 = this.createRestaurant({
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
    
    this.createRestaurant({
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
    
    this.createRestaurant({
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
    this.createFoodItem({
      restaurantId: 1,
      name: "Margherita Pizza",
      description: "Classic tomato sauce, mozzarella cheese, and fresh basil",
      category: "Pizza",
      price: 180,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop"
    });
    
    this.createFoodItem({
      restaurantId: 1,
      name: "Pepperoni Pizza",
      description: "Tomato sauce, mozzarella, and pepperoni slices",
      category: "Pizza",
      price: 210,
      imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300&auto=format&fit=crop"
    });
    
    this.createFoodItem({
      restaurantId: 1,
      name: "Spaghetti Carbonara",
      description: "Creamy sauce with eggs, cheese, pancetta, and black pepper",
      category: "Pasta",
      price: 160,
      imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&auto=format&fit=crop"
    });
    
    this.createFoodItem({
      restaurantId: 1,
      name: "Fettuccine Alfredo",
      description: "Creamy Parmesan sauce with butter and fresh parsley",
      category: "Pasta",
      price: 170,
      imageUrl: "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=300&auto=format&fit=crop"
    });
    
    // Create mock food items for other restaurants
    this.createFoodItem({
      restaurantId: 2,
      name: "Doro Wat",
      description: "Spicy chicken stew served with injera",
      category: "Main Course",
      price: 220,
      imageUrl: "https://images.unsplash.com/photo-1567888033478-593a83beca49?w=300&auto=format&fit=crop"
    });
    
    this.createFoodItem({
      restaurantId: 2,
      name: "Tibs",
      description: "Sautéed meat with vegetables and spices",
      category: "Main Course",
      price: 190,
      imageUrl: "https://images.unsplash.com/photo-1530990457142-bb18a120834d?w=300&auto=format&fit=crop"
    });
    
    this.createFoodItem({
      restaurantId: 3,
      name: "Classic Cheeseburger",
      description: "Beef patty with cheese, lettuce, tomato, and special sauce",
      category: "Burgers",
      price: 150,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop"
    });
    
    this.createFoodItem({
      restaurantId: 3,
      name: "Crispy Chicken Burger",
      description: "Crispy chicken fillet with lettuce, pickles, and mayo",
      category: "Burgers",
      price: 140,
      imageUrl: "https://images.unsplash.com/photo-1626078299034-58cd871ee9c3?w=300&auto=format&fit=crop"
    });
    
    // Create mock reviews
    this.createReview({
      userId: 1,
      restaurantId: 1,
      rating: 5,
      comment: "Amazing food, fast delivery!"
    });
    
    this.createReview({
      userId: 1,
      restaurantId: 2,
      rating: 4,
      comment: "Authentic Ethiopian food, loved it."
    });
  }
}

export const storage = new MemStorage();
