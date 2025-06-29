# 🛒 Componentary - Advanced E-commerce Platform

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **A modern, full-featured e-commerce platform for computer components with advanced AI integration, real-time chat, and comprehensive role-based management systems.**

![Platform Overview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

## 🌟 Project Overview

Componentary is a sophisticated e-commerce platform specifically designed for computer components and electronics. Built with modern web technologies, it offers a complete marketplace experience with advanced features like AI-powered customer service, real-time communication, comprehensive analytics, and a powerful recommendation engine.

### ✨ Key Highlights

- 🎯 **Multi-Role Architecture**: Customers, Sellers, and Administrators with distinct capabilities
- 🤖 **AI-Powered Chat**: SmolLM2 integration for intelligent customer service
- 📊 **Advanced Analytics**: Real-time dashboards with comprehensive metrics
- 🔍 **Smart Search & Filtering**: Advanced product discovery with multiple filter options
- 💬 **Real-Time Communication**: Socket.IO powered chat system
- 🛡️ **Security First**: JWT authentication with role-based access control
- 📱 **Responsive Design**: Mobile-optimized Bootstrap 5 interface

## 🏗️ Architecture & Technology Stack

### Backend Infrastructure
- **Runtime**: Node.js 18+ with Express.js framework
- **Database**: MongoDB 7.0 with Mongoose ODM for primary data
- **Cache Layer**: Redis for session management and performance optimization
- **Graph Database**: Neo4j for advanced recommendation algorithms
- **Real-Time**: Socket.IO for instant messaging and notifications
- **Security**: JWT tokens, bcrypt hashing, rate limiting
- **AI Service**: SmolLM2-135M for intelligent customer assistance

### Frontend Experience
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router for seamless navigation
- **Styling**: Bootstrap 5 with custom CSS variables for theming
- **State Management**: Context API for global state, localStorage for persistence
- **HTTP Client**: Native fetch API with custom error handling
- **Real-Time**: Socket.IO client for live chat features

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose for development
- **Environment Management**: Environment-specific configurations
- **Testing**: Vitest for unit tests, custom integration tests
- **Code Quality**: ESLint for code standards and consistency

## 🚀 Core Features

### 🛍️ E-Commerce Functionality
- **Product Catalog**: Comprehensive product management with rich metadata
- **Shopping Cart**: Persistent cart with real-time updates
- **Checkout System**: Multi-step checkout with order validation
- **Order Management**: Complete order lifecycle tracking
- **Payment Ready**: Prepared for payment gateway integration

### 👥 User Management & Roles

#### 🛡️ Administrators
- Complete user management (activate, deactivate, delete users)
- Product oversight and moderation
- Order management across all sellers
- Platform analytics and insights
- System configuration and settings

#### 🏪 Sellers
- Product management (CRUD operations)
- Inventory tracking and updates
- Order fulfillment for their products
- Sales analytics and reporting
- Customer communication tools

#### 🛒 Customers
- Product browsing and searching
- Shopping cart and order placement
- Order history and tracking
- Product reviews and ratings
- Direct chat with sellers

### 🔍 Advanced Product Discovery
- **Smart Search**: Full-text search across products and descriptions
- **Dynamic Filtering**: Category, manufacturer, price, ratings, specifications
- **Intelligent Sorting**: Price, popularity, ratings, date added
- **Pagination**: Efficient handling of large product catalogs

### 🤖 AI Integration & Communication
- **SmolLM2 AI Assistant**: Professional customer service automation
- **Context-Aware Responses**: Product-specific and page-aware assistance
- **Real-Time Chat**: Instant messaging between customers and sellers
- **Message History**: Persistent chat conversations with date grouping

### 📊 Analytics & Insights
- **Sales Metrics**: Revenue tracking, order analytics, performance indicators
- **User Analytics**: Registration trends, activity patterns, engagement metrics
- **Product Performance**: Best sellers, rating analysis, inventory insights
- **Real-Time Dashboards**: Live updates for all key metrics

### 🎯 Recommendation Engine
- **Collaborative Filtering**: Recommendations based on similar user behavior
- **Content-Based**: Product similarity and specification matching
- **Trending Products**: Real-time popularity tracking
- **Personalized Suggestions**: User-specific recommendations

## 📁 Project Structure

```
Componentary/
├── 🖥️ client/                    # React Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Chat.jsx         # Real-time messaging system
│   │   │   ├── Navbar.jsx       # Navigation with role-based menu
│   │   │   ├── ProductCard.jsx  # Product display component
│   │   │   ├── ProductFilters.jsx # Advanced filtering system
│   │   │   ├── ProductReviews.jsx # Rating and review system
│   │   │   ├── CartDrawer.jsx   # Shopping cart interface
│   │   │   └── WebsiteHelper.jsx # AI-powered help system
│   │   ├── pages/               # Main application pages
│   │   │   ├── HomePage.jsx     # Landing page with hero section
│   │   │   ├── ProductsPage.jsx # Main product catalog
│   │   │   ├── ProductDetailPage.jsx # Individual product view
│   │   │   ├── AdminDashboard.jsx # Admin management interface
│   │   │   ├── SellerDashboard.jsx # Seller management tools
│   │   │   ├── CheckoutPage.jsx # Order completion flow
│   │   │   └── UserProfilePage.jsx # User account management
│   │   ├── contexts/            # React context providers
│   │   │   ├── AuthContext.jsx  # Authentication state management
│   │   │   └── CartContext.jsx  # Shopping cart state
│   │   ├── utils/               # Utility functions
│   │   │   ├── api.js          # API communication layer
│   │   │   └── auth.js         # Authentication utilities
│   │   └── assets/              # Static resources
├── 🔧 server/                    # Node.js Backend API
│   ├── controllers/             # Business logic controllers
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product management
│   │   └── orderController.js   # Order processing
│   ├── middleware/              # Custom middleware functions
│   │   ├── auth.js             # JWT token validation
│   │   ├── roles.js            # Role-based access control
│   │   └── error.js            # Error handling
│   ├── models/                  # Database schema definitions
│   │   ├── User.js             # User account model
│   │   ├── Product.js          # Product catalog model
│   │   ├── Order.js            # Order management model
│   │   └── Chat.js             # Chat messaging model
│   ├── routes/                  # API endpoint definitions
│   │   ├── auth.js             # Authentication routes
│   │   ├── products.js         # Product CRUD operations
│   │   ├── admin.js            # Administrative functions
│   │   ├── seller.js           # Seller-specific operations
│   │   ├── chat.js             # Real-time messaging
│   │   └── recommendations.js   # Recommendation engine
│   ├── services/                # Business service layer
│   │   └── RecommendationService.js # ML recommendation logic
│   └── config/                  # Configuration files
│       ├── db.js               # MongoDB connection
│       ├── redis.js            # Redis cache setup
│       └── neo4j.js            # Neo4j graph database
├── 🐳 docker/                   # Container configurations
│   ├── docker-compose.yml      # Multi-service orchestration
│   ├── mongo-init.js           # Database initialization
│   └── bitnet-ai/              # AI service container
│       ├── app.py              # SmolLM2 AI service
│       ├── Dockerfile          # AI container build
│       └── requirements.txt    # Python dependencies
├── 🧪 tests/                    # Test suites
│   ├── api.test.js             # Backend API tests
│   └── components.test.js      # Frontend component tests
└── 📚 docs/                     # Documentation files
    ├── API_DOCUMENTATION.md    # Complete API reference
    ├── TESTING.md              # Testing guidelines
    └── AI_INTEGRATION_SUMMARY.md # AI implementation details
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Docker & Docker Compose** (for full development environment)
- **Git** for version control

### 1. Clone & Setup
```bash
# Clone the repository
git clone <repository-url>
cd Componentary

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp server/.env.example server/.env

# Configure your environment variables
# - Database connection strings
# - JWT secret key
# - API service URLs
# - Third-party service keys
```

### 3. Development with Docker (Recommended)
```bash
# Start all services with Docker Compose
cd docker
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:5000
# - Backend API: http://localhost:3001
# - MongoDB: localhost:27017
# - Redis: localhost:6379
# - Neo4j: http://localhost:7474
# - AI Service: http://localhost:8000
```

### 4. Manual Development Setup
```bash
# Terminal 1: Start MongoDB, Redis, Neo4j locally

# Terminal 2: Start backend server
cd server
npm run dev

# Terminal 3: Start frontend development server
cd client
npm run dev
```

## 🔐 Default Test Accounts

For testing and development purposes:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@componentary.com | admin123 | Full platform access |
| **Seller** | seller@componentary.com | seller123 | Product & order management |
| **Customer** | customer@componentary.com | customer123 | Shopping & reviews |

## 🧪 Testing & Quality Assurance

### Automated Testing
```bash
# Run backend API tests
cd server && npm test

# Run frontend component tests
cd client && npm test

# Run integration tests
npm run test:integration
```

### Manual Testing
- ✅ Complete user registration and authentication flows
- ✅ Product catalog browsing and filtering
- ✅ Shopping cart and checkout process
- ✅ Real-time chat functionality
- ✅ Admin dashboard operations
- ✅ Seller product and order management
- ✅ Review and rating system
- ✅ AI assistant interactions

### Performance Testing
- Load testing for high concurrent users
- Database query optimization
- Redis caching effectiveness
- API response time monitoring

## 📊 Feature Implementation Status

### ✅ Completed Features (100%)

#### Core E-Commerce
- [x] User Authentication & Authorization
- [x] Product Catalog with Advanced Filtering
- [x] Shopping Cart & Checkout
- [x] Order Management System
- [x] User Profile Management

#### Advanced Features
- [x] Real-time Chat System
- [x] AI-Powered Customer Service
- [x] Product Reviews & Ratings
- [x] Recommendation Engine
- [x] Analytics Dashboards

#### Admin & Seller Tools
- [x] Admin Dashboard (User/Product/Order Management)
- [x] Seller Dashboard (Product/Sales Management)
- [x] Role-based Access Control
- [x] Analytics & Reporting

#### Technical Excellence
- [x] Comprehensive API Documentation
- [x] Test Suite (Unit + Integration)
- [x] Responsive Design
- [x] Error Handling & Validation
- [x] Performance Optimization

## 🔌 API Reference

### Authentication Endpoints
```
POST /api/auth/signup      # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/me          # Update user profile
```

### Product Management
```
GET    /api/products       # List products with filtering
GET    /api/products/:id   # Get product details
POST   /api/products       # Create product (sellers)
PUT    /api/products/:id   # Update product (sellers)
DELETE /api/products/:id   # Delete product (sellers)
```

### Order Management
```
GET  /api/orders           # Get user orders
POST /api/orders           # Create new order
PUT  /api/orders/:id/status # Update order status
```

### Real-time Chat
```
GET  /api/chat/:sellerId   # Get chat history
POST /api/chat/send        # Send message
WebSocket events: join-chat, send-message, new-message
```

### Admin Operations
```
GET   /api/admin/users     # List all users
GET   /api/admin/products  # List all products
GET   /api/admin/orders    # List all orders
GET   /api/admin/analytics # Platform analytics
PATCH /api/admin/users/:id/:action # User management
```

*For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)*

## 🔮 Advanced Features

### AI Integration
- **SmolLM2-135M**: Lightweight language model for customer service
- **Context Awareness**: Product and page-specific responses
- **Professional Behavior**: Sales-focused, helpful interactions
- **Fallback System**: Graceful handling of AI limitations

### Real-time Capabilities
- **Live Chat**: Instant messaging with typing indicators
- **Order Updates**: Real-time status notifications
- **Inventory Updates**: Live stock level changes

### Analytics & Insights
- **Sales Dashboards**: Revenue, orders, customer metrics
- **Product Analytics**: Performance, ratings, inventory levels
- **User Behavior**: Activity patterns, engagement metrics
- **Real-time Reporting**: Live data updates and visualizations

## 🚀 Production Deployment

### Environment Setup
1. Configure production environment variables
2. Set up production databases (MongoDB, Redis, Neo4j)
3. Configure SSL certificates
4. Set up monitoring and logging

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Performance Optimizations
- Redis caching for frequently accessed data
- Database indexing for optimal query performance
- CDN integration for static assets
- Load balancing for high availability

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Submit a pull request with detailed description

### Development Standards
- Follow ESLint configuration
- Write comprehensive tests
- Document new features
- Follow semantic versioning

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **AI Integration**: [AI_INTEGRATION_SUMMARY.md](./AI_INTEGRATION_SUMMARY.md)
- **Implementation Details**: [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)

## 🎯 Project Status

**Status**: ✅ **Production Ready**

All planned features have been successfully implemented and tested. The platform is ready for production deployment with comprehensive documentation, test coverage, and performance optimizations.

### Recent Updates
- ✅ Enhanced AI chat system with SmolLM2 integration
- ✅ Improved product sorting and filtering
- ✅ Role-based dashboard improvements
- ✅ Comprehensive error handling and validation
- ✅ Performance optimizations and caching

---

<div align="center">

**Built with ❤️ using modern web technologies**

[React](https://reactjs.org/) • [Node.js](https://nodejs.org/) • [MongoDB](https://mongodb.com/) • [Docker](https://docker.com/)

</div>