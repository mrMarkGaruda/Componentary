// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the componentary database
db = db.getSiblingDB('componentary');

// Create collections with indexes for better performance
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('chats');

// Create indexes for better query performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "seller": 1 });
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "averageRating": 1 });
db.products.createIndex({ "createdAt": 1 });

db.orders.createIndex({ "user": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": 1 });

db.chats.createIndex({ "participants": 1 });
db.chats.createIndex({ "lastMessage": 1 });

// Insert some sample data for development
db.users.insertMany([
  {
    name: "John Doe",
    email: "john@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGVbR0QaZPqVD0i", // password123
    preferences: {
      categories: ["Electronics", "Books"],
      priceRange: { min: 0, max: 500 }
    },
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      country: "USA"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGVbR0QaZPqVD0i", // password123
    preferences: {
      categories: ["Clothing", "Home"],
      priceRange: { min: 0, max: 200 }
    },
    address: {
      street: "456 Oak Ave",
      city: "Another City",
      state: "NY",
      zipCode: "67890",
      country: "USA"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Get user IDs for sample products
const users = db.users.find().toArray();
const johnId = users[0]._id;
const janeId = users[1]._id;

db.products.insertMany([
  {
    name: "MacBook Pro 16-inch",
    description: "Powerful laptop for professionals with M3 chip and 16GB RAM",
    price: 2499,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500",
    category: "Electronics",
    tags: ["laptop", "apple", "professional", "m3"],
    stock: 10,
    seller: johnId,
    ratings: [
      {
        user: janeId,
        rating: 5,
        comment: "Excellent laptop, very fast!",
        createdAt: new Date()
      }
    ],
    averageRating: 5,
    totalRatings: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Vintage Leather Jacket",
    description: "Classic brown leather jacket in excellent condition",
    price: 150,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
    category: "Clothing",
    tags: ["jacket", "leather", "vintage", "brown"],
    stock: 5,
    seller: janeId,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "JavaScript: The Definitive Guide",
    description: "Comprehensive guide to JavaScript programming, 7th edition",
    price: 45,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
    category: "Books",
    tags: ["javascript", "programming", "guide", "technical"],
    stock: 20,
    seller: johnId,
    ratings: [
      {
        user: janeId,
        rating: 4,
        comment: "Great reference book for JS developers",
        createdAt: new Date()
      }
    ],
    averageRating: 4,
    totalRatings: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 handmade ceramic coffee mugs in earth tones",
    price: 32,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500",
    category: "Home",
    tags: ["ceramic", "coffee", "mug", "handmade", "set"],
    stock: 15,
    seller: janeId,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("MongoDB initialization completed successfully!");
print("Created collections: users, products, orders, chats");
print("Added indexes for better performance");
print("Inserted sample data for development");
print("Sample users: john@example.com and jane@example.com (password: password123)");