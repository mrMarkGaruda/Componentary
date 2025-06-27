const request = require('supertest');
const app = require('../server/app');

describe('API Endpoints', () => {
  describe('Health Check', () => {
    test('GET /health should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('Products API', () => {
    test('GET /api/products should return products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);
      
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('GET /api/products/filters should return filter options', async () => {
      const response = await request(app)
        .get('/api/products/filters')
        .expect(200);
      
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('manufacturers');
      expect(response.body).toHaveProperty('priceRange');
    });
  });

  describe('Authentication API', () => {
    test('POST /api/auth/signup should create new user', async () => {
      const userData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
    });

    test('POST /api/auth/login should authenticate user', async () => {
      // First create a user
      const userData = {
        name: 'Login Test User',
        email: `logintest${Date.now()}@example.com`,
        password: 'password123',
        role: 'customer'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData);

      // Then try to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('POST /api/auth/login should reject invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });
});
