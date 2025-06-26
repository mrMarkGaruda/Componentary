# Testing Guide for Componentary

## Prerequisites
- Node.js and npm installed
- MongoDB running
- Redis running (optional, will use mock mode if not available)
- Neo4j running (optional, will skip if not available)

## Running Tests

### API Tests
```bash
cd server
npm test
```

### Frontend Component Tests
```bash
cd client
npm test
```

### Integration Tests
```bash
# Run full application
npm run dev

# Test endpoints manually
curl http://localhost:3001/health
curl http://localhost:3001/api/products
```

## Test Coverage

### Backend API Tests
- ✅ Health check endpoint
- ✅ Product endpoints (GET, POST, PUT, DELETE)
- ✅ Authentication (signup, login)
- ✅ Order management
- ✅ User profile management
- ✅ Admin dashboard functionality
- ✅ Seller dashboard functionality
- ✅ Chat functionality
- ✅ Product reviews and ratings
- ✅ Recommendation engine

### Frontend Component Tests
- ✅ ProductCard component
- ✅ Navbar component
- ✅ Cart functionality
- ✅ Authentication flows
- ✅ Product filtering and search
- ✅ Order placement
- ✅ User profile management

### Manual Testing Checklist

#### User Registration & Authentication
- [ ] Sign up with customer account
- [ ] Sign up with seller account
- [ ] Sign up with admin account
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality

#### Product Management
- [ ] View products on homepage
- [ ] Browse products page with filters
- [ ] Search products
- [ ] Sort products by different criteria
- [ ] View product details
- [ ] Add product (seller/admin)
- [ ] Edit product (seller/admin)
- [ ] Delete product (seller/admin)

#### Shopping Cart & Orders
- [ ] Add products to cart
- [ ] Update cart quantities
- [ ] Remove products from cart
- [ ] Proceed to checkout
- [ ] Place order
- [ ] View order history
- [ ] Track order status

#### User Profile
- [ ] View profile information
- [ ] Edit profile information
- [ ] Change password
- [ ] Update preferences

#### Admin Dashboard
- [ ] View user management
- [ ] View product management
- [ ] View order management
- [ ] View analytics
- [ ] Manage user accounts

#### Seller Dashboard
- [ ] View own products
- [ ] View orders for own products
- [ ] View sales analytics
- [ ] Manage inventory

#### Reviews & Ratings
- [ ] Add product review
- [ ] View product reviews
- [ ] Rating calculation
- [ ] Review validation

#### Chat Functionality
- [ ] Start chat with seller
- [ ] Send messages
- [ ] Receive messages
- [ ] Chat history persistence

#### Recommendations
- [ ] View frequently bought together
- [ ] Personalized recommendations
- [ ] Trending products

## Test Data Setup

### Sample Users
```javascript
// Admin user
{
  name: "Admin User",
  email: "admin@componentary.com",
  password: "admin123",
  role: "admin"
}

// Seller user
{
  name: "Tech Seller",
  email: "seller@componentary.com", 
  password: "seller123",
  role: "seller"
}

// Customer user
{
  name: "John Customer",
  email: "customer@componentary.com",
  password: "customer123", 
  role: "customer"
}
```

### Sample Products
```javascript
[
  {
    name: "Intel Core i9-13900K",
    price: 589.99,
    description: "High-performance desktop processor",
    category: "CPU",
    manufacturer: "Intel",
    tags: ["gaming", "workstation", "high-performance"]
  },
  {
    name: "NVIDIA RTX 4080",
    price: 1199.99,
    description: "Advanced graphics card for gaming and creative work",
    category: "GPU", 
    manufacturer: "NVIDIA",
    tags: ["gaming", "ray-tracing", "4k"]
  }
]
```

## Known Issues & Limitations
- Tests require real database connections
- Socket.IO tests need special handling
- Some UI tests may be flaky due to async operations
- File upload functionality not fully tested

## Performance Testing
- Load testing with multiple concurrent users
- Database query optimization
- Redis caching effectiveness
- Response time measurements
