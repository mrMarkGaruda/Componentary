# Componentary API Documentation

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "customer" | "seller" | "admin"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### Products (`/api/products`)

#### GET `/api/products`
Get all products with optional filtering, sorting, and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category
- `manufacturer`: Filter by manufacturer
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `searchTerm`: Search in product names and descriptions
- `sortBy`: Sort field (price, name, createdAt, averageRating)
- `sortOrder`: Sort order (asc, desc)
- `tags`: Comma-separated tags
- `minRating`: Minimum average rating
- `spec_*`: Specification filters (e.g., spec_cores=8)

**Response:**
```json
{
  "products": [
    {
      "_id": "string",
      "name": "string",
      "price": "number",
      "description": "string",
      "image": "string",
      "category": "string",
      "manufacturer": "string",
      "tags": ["string"],
      "specifications": "object",
      "averageRating": "number",
      "totalRatings": "number",
      "seller": {
        "_id": "string",
        "name": "string",
        "email": "string"
      }
    }
  ],
  "currentPage": "number",
  "totalPages": "number",
  "totalProducts": "number"
}
```

#### GET `/api/products/filters`
Get available filter options.

**Response:**
```json
{
  "categories": ["string"],
  "manufacturers": ["string"],
  "tags": ["string"],
  "priceRange": {
    "min": "number",
    "max": "number"
  },
  "specificationFilters": "object"
}
```

#### GET `/api/products/:id`
Get a single product by ID.

**Response:**
```json
{
  "_id": "string",
  "name": "string",
  "price": "number",
  "description": "string",
  "image": "string",
  "category": "string",
  "manufacturer": "string",
  "tags": ["string"],
  "specifications": "object",
  "ratings": [
    {
      "user": "object",
      "rating": "number",
      "comment": "string",
      "createdAt": "date"
    }
  ],
  "averageRating": "number",
  "totalRatings": "number",
  "seller": "object"
}
```

#### POST `/api/products` (Protected: Admin/Seller)
Create a new product.

**Request Body:**
```json
{
  "name": "string",
  "price": "number",
  "description": "string",
  "image": "string",
  "category": "string",
  "manufacturer": "string",
  "tags": ["string"],
  "specifications": "object"
}
```

#### PUT `/api/products/:id` (Protected: Admin/Seller)
Update an existing product.

#### DELETE `/api/products/:id` (Protected: Admin/Seller)
Delete a product.

#### POST `/api/products/:id/reviews` (Protected)
Add a review to a product.

**Request Body:**
```json
{
  "rating": "number (1-5)",
  "comment": "string"
}
```

#### GET `/api/products/:id/reviews`
Get reviews for a product.

### Orders (`/api/orders`)

#### POST `/api/orders` (Protected)
Create a new order.

**Request Body:**
```json
{
  "items": [
    {
      "product": "string (product ID)",
      "quantity": "number",
      "price": "number"
    }
  ],
  "totalAmount": "number",
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "paymentMethod": "credit_card" | "paypal" | "bank_transfer"
}
```

#### GET `/api/orders` (Protected)
Get user's orders.

#### PATCH `/api/orders/:id/status` (Protected: Admin/Seller)
Update order status.

**Request Body:**
```json
{
  "status": "pending" | "processing" | "shipped" | "delivered" | "cancelled"
}
```

### User Profile (`/api/user`)

#### GET `/api/user/profile` (Protected)
Get user profile.

#### PUT `/api/user/profile` (Protected)
Update user profile.

#### PUT `/api/user/password` (Protected)
Change user password.

### Admin (`/api/admin`)

#### GET `/api/admin/users` (Protected: Admin)
Get all users.

#### GET `/api/admin/products` (Protected: Admin)
Get all products.

#### GET `/api/admin/orders` (Protected: Admin)
Get all orders.

#### GET `/api/admin/analytics` (Protected: Admin)
Get analytics data.

#### PATCH `/api/admin/users/:id/:action` (Protected: Admin)
Perform action on user (activate, deactivate, delete).

### Seller (`/api/seller`)

#### GET `/api/seller/products` (Protected: Seller/Admin)
Get seller's products.

#### GET `/api/seller/orders` (Protected: Seller/Admin)
Get orders for seller's products.

#### GET `/api/seller/analytics` (Protected: Seller/Admin)
Get seller analytics.

### Chat (`/api/chat`)

#### GET `/api/chat/:sellerId` (Protected)
Get chat history with a seller.

#### POST `/api/chat` (Protected)
Send a chat message.

### Recommendations (`/api/recommendations`)

#### GET `/api/recommendations/bought-together/:productId`
Get frequently bought together products.

#### GET `/api/recommendations/for-user/:userId`
Get personalized recommendations.

#### GET `/api/recommendations/similar-users/:userId`
Get recommendations based on similar users.

#### GET `/api/recommendations/trending`
Get trending products.

#### POST `/api/recommendations/record-purchase`
Record a purchase for recommendation engine.

### Cart (`/api/cart`)

#### GET `/api/cart` (Protected)
Get user's cart.

#### POST `/api/cart` (Protected)
Add item to cart.

#### PUT `/api/cart/:productId` (Protected)
Update item quantity in cart.

#### DELETE `/api/cart/:productId` (Protected)
Remove item from cart.

#### DELETE `/api/cart` (Protected)
Clear entire cart.

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (e.g., email already exists)
- `500`: Internal Server Error

## Socket.IO Events

### Authentication
Socket connections require authentication via token in handshake.

### Events

#### `join-chat`
Join a chat room.
```javascript
socket.emit('join-chat', { userId: 'string', sellerId: 'string' });
```

#### `send-message`
Send a chat message.
```javascript
socket.emit('send-message', { 
  recipientId: 'string', 
  message: 'string' 
});
```

#### `new-message`
Receive a new chat message.
```javascript
socket.on('new-message', (message) => {
  // Handle incoming message
});
```
