const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

class RecommendationService {
  constructor(neo4jDriver, redisClient) {
    this.neo4jDriver = neo4jDriver;
    this.redisClient = redisClient;
  }

  // Enhanced purchase relationship creation with product compatibility
  async createPurchaseRelationship(userId, productIds) {
    const session = this.neo4jDriver.session();
    try {
      // Create user node with enhanced properties
      await session.run(`
        MERGE (u:User {id: $userId})
        ON CREATE SET u.created = datetime(), u.totalOrders = 1, u.totalSpent = 0
        ON MATCH SET u.totalOrders = COALESCE(u.totalOrders, 0) + 1, u.lastOrder = datetime()
      `, { userId });
      
      // Get product details for compatibility analysis
      const products = await Product.find({ _id: { $in: productIds } }).lean();
      
      // Create product nodes with enhanced properties
      for (const product of products) {
        await session.run(`
          MERGE (p:Product {id: $productId})
          ON CREATE SET 
            p.category = $category, 
            p.brand = $brand, 
            p.price = $price,
            p.compatibility = $compatibility,
            p.created = datetime()
          ON MATCH SET 
            p.totalSales = COALESCE(p.totalSales, 0) + 1,
            p.lastSold = datetime()
        `, { 
          productId: product._id.toString(),
          category: product.category,
          brand: product.brand || '',
          price: product.price,
          compatibility: JSON.stringify(product.compatibility || {})
        });

        // Create purchase relationship with value tracking
        await session.run(`
          MATCH (u:User {id: $userId})
          MATCH (p:Product {id: $productId})
          MERGE (u)-[r:PURCHASED]->(p)
          ON CREATE SET 
            r.timestamp = datetime(), 
            r.count = 1, 
            r.price = $price,
            r.satisfaction = 5.0
          ON MATCH SET 
            r.count = COALESCE(r.count, 0) + 1, 
            r.lastPurchased = datetime(),
            r.totalValue = COALESCE(r.totalValue, 0) + $price
        `, { userId, productId: product._id.toString(), price: product.price });

        // Create category relationships for better filtering
        await session.run(`
          MERGE (c:Category {name: $category})
          MERGE (p:Product {id: $productId})
          MERGE (p)-[:BELONGS_TO]->(c)
          MERGE (u:User {id: $userId})
          MERGE (u)-[r:INTERESTED_IN]->(c)
          ON CREATE SET r.score = 1, r.firstInteraction = datetime()
          ON MATCH SET r.score = r.score + 1, r.lastInteraction = datetime()
        `, { userId, productId: product._id.toString(), category: product.category });
      }

      // Enhanced "bought together" relationships with compatibility scoring
      if (productIds.length > 1) {
        for (let i = 0; i < products.length; i++) {
          for (let j = i + 1; j < products.length; j++) {
            const product1 = products[i];
            const product2 = products[j];
            const compatibilityScore = this.calculateCompatibilityScore(product1, product2);
            
            await session.run(`
              MATCH (p1:Product {id: $product1})
              MATCH (p2:Product {id: $product2})
              MERGE (p1)-[r:BOUGHT_TOGETHER]->(p2)
              MERGE (p2)-[r2:BOUGHT_TOGETHER]->(p1)
              ON CREATE SET 
                r.count = 1, r2.count = 1, 
                r.compatibilityScore = $compatibilityScore,
                r2.compatibilityScore = $compatibilityScore,
                r.created = datetime(), r2.created = datetime()
              ON MATCH SET 
                r.count = r.count + 1, 
                r2.count = r2.count + 1, 
                r.updated = datetime(), 
                r2.updated = datetime(),
                r.compatibilityScore = (r.compatibilityScore + $compatibilityScore) / 2,
                r2.compatibilityScore = (r2.compatibilityScore + $compatibilityScore) / 2
            `, { 
              product1: product1._id.toString(), 
              product2: product2._id.toString(),
              compatibilityScore
            });
          }
        }
      }

      // Clear cache for affected users and products
      await this.clearUserRecommendationCache(userId);
      await this.clearProductRecommendationCache(productIds);
    } finally {
      await session.close();
    }
  }

  // Calculate compatibility score between products
  calculateCompatibilityScore(product1, product2) {
    let score = 0.5; // Base compatibility
    
    // Same category products are often compatible
    if (product1.category === product2.category) {
      score += 0.3;
    }
    
    // Check for known compatibility patterns
    const compatibilityPatterns = {
      'CPU': ['Motherboard', 'CPU Cooler', 'RAM'],
      'GPU': ['Monitor', 'PSU', 'Case'],
      'Motherboard': ['CPU', 'RAM', 'Storage'],
      'RAM': ['CPU', 'Motherboard'],
      'Storage': ['Motherboard', 'Case'],
      'PSU': ['GPU', 'CPU', 'Motherboard'],
      'Case': ['Motherboard', 'GPU', 'PSU', 'Storage'],
      'Monitor': ['GPU', 'Keyboard', 'Mouse'],
      'Keyboard': ['Mouse', 'Monitor'],
      'Mouse': ['Keyboard', 'Monitor']
    };
    
    if (compatibilityPatterns[product1.category]?.includes(product2.category)) {
      score += 0.4;
    }
    
    // Price range compatibility (similar price ranges often bought together)
    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    const priceCompatibility = Math.max(0, 1 - (priceDiff / avgPrice));
    score += priceCompatibility * 0.2;
    
    return Math.min(1.0, score);
  }

  // Enhanced product view recording with session tracking
  async recordProductView(userId, productId, category = null, sessionData = {}) {
    const session = this.neo4jDriver.session();
    try {
      // Record view with context
      await session.run(`
        MERGE (u:User {id: $userId})
        MERGE (p:Product {id: $productId})
        MERGE (u)-[r:VIEWED]->(p)
        ON CREATE SET 
          r.count = 1, 
          r.firstViewed = datetime(), 
          r.lastViewed = datetime(),
          r.sessionViews = 1,
          r.avgTimeSpent = $timeSpent,
          r.source = $source
        ON MATCH SET 
          r.count = r.count + 1, 
          r.lastViewed = datetime(),
          r.sessionViews = CASE WHEN duration.between(r.lastViewed, datetime()).minutes < 30 
                          THEN r.sessionViews + 1 
                          ELSE 1 END,
          r.avgTimeSpent = (COALESCE(r.avgTimeSpent, 0) + $timeSpent) / 2,
          r.source = $source
      `, { 
        userId, 
        productId, 
        timeSpent: sessionData.timeSpent || 30,
        source: sessionData.source || 'direct'
      });

      // Enhanced category interest tracking
      if (category) {
        await session.run(`
          MERGE (u:User {id: $userId})
          MERGE (c:Category {name: $category})
          MERGE (u)-[r:INTERESTED_IN]->(c)
          ON CREATE SET 
            r.score = 1, 
            r.firstInteraction = datetime(),
            r.viewCount = 1,
            r.sessionViews = 1
          ON MATCH SET 
            r.score = r.score + 0.1,
            r.lastInteraction = datetime(),
            r.viewCount = r.viewCount + 1,
            r.sessionViews = CASE WHEN duration.between(r.lastInteraction, datetime()).minutes < 30 
                            THEN r.sessionViews + 1 
                            ELSE 1 END
        `, { userId, category });

        // Track category transitions for better understanding of user journey
        if (sessionData.previousCategory && sessionData.previousCategory !== category) {
          await session.run(`
            MERGE (c1:Category {name: $prevCategory})
            MERGE (c2:Category {name: $category})
            MERGE (c1)-[r:FLOWS_TO]->(c2)
            ON CREATE SET r.count = 1, r.created = datetime()
            ON MATCH SET r.count = r.count + 1, r.updated = datetime()
          `, { 
            prevCategory: sessionData.previousCategory, 
            category 
          });
        }
      }

      // Track search context if provided
      if (sessionData.searchQuery) {
        await session.run(`
          MERGE (u:User {id: $userId})
          MERGE (q:SearchQuery {query: $searchQuery})
          MERGE (p:Product {id: $productId})
          MERGE (u)-[r:SEARCHED]->(q)
          MERGE (q)-[r2:RESULTED_IN]->(p)
          ON CREATE SET r.count = 1, r2.count = 1, r.created = datetime(), r2.created = datetime()
          ON MATCH SET r.count = r.count + 1, r2.count = r2.count + 1, r.updated = datetime(), r2.updated = datetime()
        `, { userId, productId, searchQuery: sessionData.searchQuery });
      }
    } finally {
      await session.close();
    }
  }

  // Enhanced frequently bought together with compatibility and context
  async getBoughtTogether(productId, limit = 6, userId = null) {
    const cacheKey = `bought_together:${productId}:${userId || 'anonymous'}`;
    
    try {
      // Check cache first
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const session = this.neo4jDriver.session();
      try {
        // Enhanced query with compatibility scoring and user context
        let query = `
          MATCH (p:Product {id: $productId})-[r:BOUGHT_TOGETHER]->(rec:Product)
          WHERE rec.id <> $productId
        `;
        
        let params = { productId, limit };
        
        // Exclude already purchased products if user is provided
        if (userId) {
          query += `
            AND NOT EXISTS((u:User {id: $userId})-[:PURCHASED]->(rec))
          `;
          params.userId = userId;
        }
        
        query += `
          RETURN 
            rec.id as productId, 
            r.count as frequency,
            r.compatibilityScore as compatibility,
            rec.category as category,
            rec.price as price
          ORDER BY (r.count * r.compatibilityScore) DESC
          LIMIT $limit
        `;

        const result = await session.run(query, params);

        const recommendations = result.records.map(record => ({
          productId: record.get('productId'),
          frequency: record.get('frequency').toNumber(),
          compatibility: record.get('compatibility') || 0.5,
          category: record.get('category'),
          price: record.get('price')
        }));

        // Fetch product details with enhanced information
        const productIds = recommendations.map(r => r.productId);
        const products = await Product.find({ _id: { $in: productIds } })
          .populate('seller', 'name rating')
          .lean();
        
        const enrichedRecommendations = recommendations.map(rec => {
          const product = products.find(p => p._id.toString() === rec.productId);
          return {
            ...rec,
            product: product || null,
            recommendationScore: rec.frequency * rec.compatibility,
            reason: this.generateRecommendationReason(rec, product)
          };
        }).filter(rec => rec.product);

        // Sort by recommendation score
        enrichedRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

        // Cache for 2 hours
        await this.redisClient.setex(cacheKey, 7200, JSON.stringify(enrichedRecommendations));
        return enrichedRecommendations;
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error('Error getting bought together products:', error);
      return [];
    }
  }

  // Generate contextual recommendation reasons
  generateRecommendationReason(recommendation, product) {
    const reasons = [];
    
    if (recommendation.frequency > 10) {
      reasons.push(`Frequently bought together by ${recommendation.frequency} customers`);
    } else if (recommendation.frequency > 5) {
      reasons.push(`Often purchased together`);
    } else {
      reasons.push(`Commonly paired together`);
    }
    
    if (recommendation.compatibility > 0.8) {
      reasons.push(`High compatibility match`);
    } else if (recommendation.compatibility > 0.6) {
      reasons.push(`Good compatibility`);
    }
    
    if (product && product.averageRating > 4.5) {
      reasons.push(`Highly rated (${product.averageRating.toFixed(1)}/5)`);
    }
    
    return reasons.join(' • ');
  }

  // Get personalized recommendations based on purchase history
  async getPersonalizedRecommendations(userId, limit = 10) {
    const cacheKey = `personalized:${userId}`;
    
    try {
      // Check cache first
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const session = this.neo4jDriver.session();
      try {
        // Multi-algorithm approach
        const [purchaseBasedResult, viewBasedResult, categoryBasedResult] = await Promise.all([
          // Purchase-based recommendations
          session.run(`
            MATCH (u:User {id: $userId})-[:PURCHASED]->(p:Product)
            MATCH (p)-[:BOUGHT_TOGETHER]->(rec:Product)
            WHERE NOT (u)-[:PURCHASED]->(rec)
            RETURN rec.id as productId, COUNT(*) * 3 as score, 'purchase' as source
            ORDER BY score DESC
            LIMIT $limit
          `, { userId, limit }),

          // View-based recommendations
          session.run(`
            MATCH (u:User {id: $userId})-[:VIEWED]->(p:Product)
            MATCH (p)-[:BOUGHT_TOGETHER]->(rec:Product)
            WHERE NOT (u)-[:PURCHASED]->(rec) AND NOT (u)-[:VIEWED]->(rec)
            RETURN rec.id as productId, COUNT(*) * 1 as score, 'view' as source
            ORDER BY score DESC
            LIMIT $limit
          `, { userId, limit }),

          // Category-based recommendations
          session.run(`
            MATCH (u:User {id: $userId})-[i:INTERESTED_IN]->(c:Category)
            MATCH (p:Product)-[:BELONGS_TO]->(c)
            WHERE NOT (u)-[:PURCHASED]->(p)
            RETURN p.id as productId, i.score * 2 as score, 'category' as source
            ORDER BY score DESC
            LIMIT $limit
          `, { userId, limit })
        ]);

        // Combine and deduplicate recommendations
        const allRecommendations = new Map();
        
        [purchaseBasedResult, viewBasedResult, categoryBasedResult].forEach(result => {
          result.records.forEach(record => {
            const productId = record.get('productId');
            const score = record.get('score').toNumber();
            const source = record.get('source');
            
            if (allRecommendations.has(productId)) {
              allRecommendations.get(productId).score += score;
              allRecommendations.get(productId).sources.push(source);
            } else {
              allRecommendations.set(productId, { productId, score, sources: [source] });
            }
          });
        });

        // Sort by combined score
        const sortedRecommendations = Array.from(allRecommendations.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        // Fetch product details
        const productIds = sortedRecommendations.map(r => r.productId);
        const products = await Product.find({ _id: { $in: productIds } }).lean();
        
        const enrichedRecommendations = sortedRecommendations.map(rec => {
          const product = products.find(p => p._id.toString() === rec.productId);
          return {
            ...rec,
            product: product || null
          };
        }).filter(rec => rec.product);

        // Cache for 30 minutes
        await this.redisClient.setex(cacheKey, 1800, JSON.stringify(enrichedRecommendations));
        return enrichedRecommendations;
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  // Get recommendations based on similar users
  async getSimilarUsersRecommendations(userId, limit = 8) {
    const session = this.neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (u1:User {id: $userId})-[:PURCHASED]->(p:Product)<-[:PURCHASED]-(u2:User)
        WHERE u1 <> u2
        WITH u2, COUNT(p) as commonProducts
        ORDER BY commonProducts DESC
        LIMIT 10
        MATCH (u2)-[:PURCHASED]->(rec:Product)
        WHERE NOT (u1)-[:PURCHASED]->(rec)
        RETURN rec.id as productId, SUM(commonProducts) as score
        ORDER BY score DESC
        LIMIT $limit
      `, { userId, limit });

      const recommendations = result.records.map(record => ({
        productId: record.get('productId'),
        score: record.get('score').toNumber()
      }));

      // Fetch product details
      const productIds = recommendations.map(r => r.productId);
      const products = await Product.find({ _id: { $in: productIds } }).lean();
      
      return recommendations.map(rec => {
        const product = products.find(p => p._id.toString() === rec.productId);
        return {
          ...rec,
          product: product || null
        };
      }).filter(rec => rec.product);
    } finally {
      await session.close();
    }
  }

  // Get trending products (last 7 days)
  async getTrendingProducts(limit = 10) {
    const cacheKey = 'trending_products';
    
    try {
      // Check cache first
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const session = this.neo4jDriver.session();
      try {
        const result = await session.run(`
          MATCH (p:Product)<-[r:PURCHASED]-(u:User)
          WHERE r.timestamp > datetime() - duration('P7D')
          RETURN p.id as productId, COUNT(r) as purchases
          ORDER BY purchases DESC
          LIMIT $limit
        `, { limit });

        const trending = result.records.map(record => ({
          productId: record.get('productId'),
          purchases: record.get('purchases').toNumber()
        }));

        // Fetch product details
        const productIds = trending.map(t => t.productId);
        const products = await Product.find({ _id: { $in: productIds } }).lean();
        
        const enrichedTrending = trending.map(trend => {
          const product = products.find(p => p._id.toString() === trend.productId);
          return {
            ...trend,
            product: product || null
          };
        }).filter(trend => trend.product);

        // Cache for 15 minutes
        await this.redisClient.setex(cacheKey, 900, JSON.stringify(enrichedTrending));
        return enrichedTrending;
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }

  // Clear user recommendation cache
  async clearUserRecommendationCache(userId) {
    try {
      const keys = [
        `personalized:${userId}`,
        'trending_products'
      ];
      
      for (const key of keys) {
        await this.redisClient.del(key);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Clear product-specific recommendation cache
  async clearProductRecommendationCache(productIds) {
    try {
      const patterns = productIds.map(id => `bought_together:${id}:*`);
      
      for (const pattern of patterns) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      }
    } catch (error) {
      console.error('Error clearing product cache:', error);
    }
  }

  // Get comprehensive recommendations for a user
  async getComprehensiveRecommendations(userId) {
    try {
      const [personalized, similarUsers, trending] = await Promise.all([
        this.getPersonalizedRecommendations(userId, 6),
        this.getSimilarUsersRecommendations(userId, 4),
        this.getTrendingProducts(4)
      ]);

      return {
        personalized: personalized.map(r => r.product),
        similarUsers: similarUsers.map(r => r.product),
        trending: trending.map(r => r.product)
      };
    } catch (error) {
      console.error('Error getting comprehensive recommendations:', error);
      return {
        personalized: [],
        similarUsers: [],
        trending: []
      };
    }
  }

  // Get build recommendations (complementary products for PC building)
  async getBuildRecommendations(productId, userBudget = null, limit = 8) {
    const session = this.neo4jDriver.session();
    try {
      const product = await Product.findById(productId).lean();
      if (!product) return [];

      // Define build requirements based on product category
      const buildRequirements = this.getBuildRequirements(product.category);
      
      let query = `
        MATCH (base:Product {id: $productId})
        MATCH (comp:Product)-[:BELONGS_TO]->(c:Category)
        WHERE c.name IN $requiredCategories
        AND comp.id <> $productId
      `;

      let params = { 
        productId, 
        requiredCategories: buildRequirements,
        limit 
      };

      // Add budget constraint if provided
      if (userBudget) {
        query += ` AND comp.price <= $maxPrice`;
        params.maxPrice = userBudget * 0.8; // Leave some budget room
      }

      query += `
        OPTIONAL MATCH (base)-[r:BOUGHT_TOGETHER]->(comp)
        RETURN 
          comp.id as productId,
          comp.category as category,
          comp.price as price,
          COALESCE(r.compatibilityScore, 0.5) as compatibility,
          COALESCE(r.count, 0) as frequency
        ORDER BY (compatibility * 2 + frequency * 0.1) DESC
        LIMIT $limit
      `;

      const result = await session.run(query, params);
      
      const recommendations = result.records.map(record => ({
        productId: record.get('productId'),
        category: record.get('category'),
        price: record.get('price'),
        compatibility: record.get('compatibility'),
        frequency: record.get('frequency').toNumber()
      }));

      // Fetch product details
      const productIds = recommendations.map(r => r.productId);
      const products = await Product.find({ _id: { $in: productIds } }).lean();
      
      return recommendations.map(rec => {
        const prod = products.find(p => p._id.toString() === rec.productId);
        return {
          ...rec,
          product: prod || null,
          buildRole: this.getBuildRole(rec.category, product.category)
        };
      }).filter(rec => rec.product);

    } finally {
      await session.close();
    }
  }

  // Get build requirements based on main component
  getBuildRequirements(category) {
    const requirements = {
      'CPU': ['Motherboard', 'RAM', 'CPU Cooler', 'PSU'],
      'GPU': ['PSU', 'Monitor', 'Case'],
      'Motherboard': ['CPU', 'RAM', 'Storage', 'PSU', 'Case'],
      'PSU': ['GPU', 'CPU', 'Motherboard', 'Storage'],
      'Case': ['Motherboard', 'PSU', 'Storage', 'Fan'],
      'Monitor': ['GPU', 'Keyboard', 'Mouse', 'Speakers'],
      'RAM': ['CPU', 'Motherboard'],
      'Storage': ['Motherboard', 'Case']
    };
    
    return requirements[category] || [];
  }

  // Get build role description
  getBuildRole(componentCategory, baseCategory) {
    const roles = {
      'CPU-Motherboard': 'Socket compatibility essential',
      'CPU-RAM': 'Memory controller compatibility',
      'GPU-PSU': 'Adequate power supply',
      'GPU-Monitor': 'Display output optimization',
      'Motherboard-RAM': 'Memory slot compatibility',
      'PSU-Case': 'Form factor compatibility'
    };
    
    return roles[`${baseCategory}-${componentCategory}`] || 'Complementary component';
  }
}

module.exports = RecommendationService;