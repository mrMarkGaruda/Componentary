// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the componentary database
db = db.getSiblingDB('componentary');

// Create collections with indexes for better performance
// Ensure collections are created if they don't exist.
// Using createCollection is idempotent.
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('reviews'); // Added reviews collection from new data
db.createCollection('chats'); // Kept chats collection

// Drop existing sample data to avoid conflicts if script is re-run on a persistent volume
// For a clean seed, it might be better to drop collections or specific data
// However, for simplicity in this step, we'll rely on MongoDB's behavior with insertMany
// or ensure this script only truly runs "once" against a fresh DB.
// A more robust approach for development might involve checking if data exists or dropping.

// Create indexes for better query performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true }); // Added for new user schema
db.users.createIndex({ "createdAt": 1 });

db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category": 1 });
// db.products.createIndex({ "seller": 1 }); // Seller field not in new product data
db.products.createIndex({ "brand": 1 }); // Added for new product data
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "averageRating": 1 });
db.products.createIndex({ "createdAt": 1 });

db.orders.createIndex({ "user": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": 1 });

db.reviews.createIndex({ "product": 1 }); // Assuming reviews are linked to products
db.reviews.createIndex({ "user": 1 });    // Assuming reviews are linked to users
db.reviews.createIndex({ "rating": 1 });
db.reviews.createIndex({ "createdAt": 1 });

db.chats.createIndex({ "participants": 1 });
db.chats.createIndex({ "lastMessage": 1 });

// Remove existing sample data to prevent duplication or conflicts
// This is a simple way for a seeding script.
// More sophisticated checks could be done (e.g., if collections are empty).
db.products.deleteMany({});
db.users.deleteMany({});
// db.orders.deleteMany({}); // Decide if orders should be cleared too
// db.reviews.deleteMany({}); // Decide if reviews should be cleared

// Sample Products (New data)
const productsToInsert = [
  {
    name: 'Laptop Pro 15',
    description: 'High-performance laptop for professionals. Features a 15-inch Retina display, M2 Pro chip, 16GB RAM, and 512GB SSD.',
    price: 1999.99,
    category: 'Electronics',
    brand: 'TechCorp',
    stock: 50,
    imageUrl: 'https://via.placeholder.com/300/0000FF/808080?Text=LaptopPro15',
    attributes: [
      { name: 'Display', value: '15-inch Retina' },
      { name: 'Processor', value: 'M2 Pro' },
      { name: 'RAM', value: '16GB' },
      { name: 'Storage', value: '512GB SSD' }
    ],
    tags: ['laptop', 'professional', 'high-performance', 'TechCorp'],
    averageRating: 4.8,
    reviewsCount: 120, // This field suggests a denormalized count, ensure your app logic maintains it or calculates it
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Smartphone X',
    description: 'Latest generation smartphone with a stunning OLED display, advanced camera system, and all-day battery life.',
    price: 999.00,
    category: 'Electronics',
    brand: 'ConnectMe',
    stock: 150,
    imageUrl: 'https://via.placeholder.com/300/FF0000/FFFFFF?Text=SmartphoneX',
    attributes: [
      { name: 'Display', value: '6.7-inch OLED' },
      { name: 'Camera', value: '48MP Triple Lens' },
      { name: 'Battery', value: '4500mAh' }
    ],
    tags: ['smartphone', 'mobile', 'camera', 'ConnectMe'],
    averageRating: 4.5,
    reviewsCount: 250,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones with superior sound quality and comfortable design for long listening sessions.',
    price: 249.50,
    category: 'Electronics',
    brand: 'AudioPhile',
    stock: 200,
    imageUrl: 'https://via.placeholder.com/300/008000/FFFFFF?Text=WirelessHeadphones',
    attributes: [
      { name: 'Type', value: 'Over-ear' },
      { name: 'Connectivity', value: 'Bluetooth 5.2' },
      { name: 'Feature', value: 'Active Noise Cancellation' }
    ],
    tags: ['headphones', 'audio', 'wireless', 'noise-cancelling', 'AudioPhile'],
    averageRating: 4.7,
    reviewsCount: 300,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Smart Watch Series 7',
    description: 'Stay connected and track your fitness with the new Smart Watch Series 7. Brighter display and faster charging.',
    price: 399.00,
    category: 'Wearables',
    brand: 'FitTech',
    stock: 120,
    imageUrl: 'https://via.placeholder.com/300/FFFF00/000000?Text=SmartWatch7',
    attributes: [
      { name: 'Display', value: 'Always-On Retina' },
      { name: 'Sensors', value: 'ECG, SpO2' },
      { name: 'Water Resistance', value: '50 meters' }
    ],
    tags: ['smartwatch', 'wearable', 'fitness', 'health', 'FitTech'],
    averageRating: 4.6,
    reviewsCount: 180,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Gaming Console NextGen',
    description: 'Experience next-generation gaming with ultra-fast load times, 4K graphics, and an immersive controller.',
    price: 499.99,
    category: 'Gaming',
    brand: 'GameOn',
    stock: 75,
    imageUrl: 'https://via.placeholder.com/300/800080/FFFFFF?Text=GamingConsole',
    attributes: [
      { name: 'Resolution', value: '4K UHD' },
      { name: 'Storage', value: '1TB NVMe SSD' },
      { name: 'Controller', value: 'Haptic Feedback' }
    ],
    tags: ['gaming', 'console', '4K', 'entertainment', 'GameOn'],
    averageRating: 4.9,
    reviewsCount: 95,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

if (productsToInsert.length > 0) {
  db.products.insertMany(productsToInsert);
  print(productsToInsert.length + ' sample products inserted.');
} else {
  print('No sample products to insert.');
}


// Sample Users (New data - Passwords should be hashed in a real application)
// For a seeding script, plain text passwords are okay for dev, but ensure they are not used in production.
// The server-side application should handle hashing upon user registration.
const usersToInsert = [
  {
    username: 'john_doe',
    email: 'john.doe@example.com',
    password: 'password123', // Plain text for seeding; should be hashed by the application if this were a real user creation flow
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    addresses: [
      { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '90210', country: 'USA', isDefault: true }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'jane_smith',
    email: 'jane.smith@example.com',
    password: 'password456', // Plain text for seeding
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user',
    addresses: [
      { street: '456 Oak Ave', city: 'Otherville', state: 'NY', zip: '10001', country: 'USA', isDefault: true }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'admin_user',
    email: 'admin@componentary.com',
    password: 'adminpassword', // Plain text for seeding
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

if (usersToInsert.length > 0) {
  db.users.insertMany(usersToInsert);
  print(usersToInsert.length + ' sample users inserted.');
} else {
  print('No sample users to insert.');
}

// Example of creating a sample order (optional, can be expanded)
/*
const userJohn = db.users.findOne({ username: 'john_doe' });
const productLaptop = db.products.findOne({ name: 'Laptop Pro 15' });

if (userJohn && productLaptop) {
  const ordersToInsert = [
    {
      user: userJohn._id, // Link to user ID
      items: [
        {
          product: productLaptop._id, // Link to product ID
          name: productLaptop.name,
          quantity: 1,
          price: productLaptop.price,
          imageUrl: productLaptop.imageUrl
        }
      ],
      totalAmount: productLaptop.price,
      shippingAddress: userJohn.addresses.find(a => a.isDefault), // Use user's default address
      status: 'Pending', // Example status
      paymentDetails: {
        paymentMethod: 'Credit Card', // Example
        transactionId: 'txn_' + new Date().getTime() // Example transaction ID
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  db.orders.insertMany(ordersToInsert);
  print(ordersToInsert.length + ' sample order(s) inserted.');
}
*/

print('-----------------------------------------------------');
print('MongoDB initialization script completed.');
print('Database: ' + db.getName());
print('Collections created/verified: users, products, orders, reviews, chats.');
print('Indexes created.');
print('Sample data inserted for products and users.');
print('-----------------------------------------------------');