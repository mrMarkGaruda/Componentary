class RecommendationService {
  constructor(neo4jDriver, redisClient) {
    this.neo4jDriver = neo4jDriver
    this.redisClient = redisClient
  }

  async createPurchaseRelationship(userId, productIds) {
    const session = this.neo4jDriver.session()
    try {
      await session.run(`MERGE (u:User {id: $userId})`, { userId })
      for (const productId of productIds) {
        await session.run(`
          MERGE (p:Product {id: $productId})
          MERGE (u:User {id: $userId})
          MERGE (u)-[r:PURCHASED]->(p)
          ON CREATE SET r.timestamp = datetime()
          ON MATCH SET r.count = COALESCE(r.count, 0) + 1
        `, { userId, productId })
      }
      if (productIds.length > 1) {
        for (let i = 0; i < productIds.length; i++) {
          for (let j = i + 1; j < productIds.length; j++) {
            await session.run(`
              MATCH (p1:Product {id: $product1})
              MATCH (p2:Product {id: $product2})
              MERGE (p1)-[r:BOUGHT_TOGETHER]->(p2)
              MERGE (p2)-[r2:BOUGHT_TOGETHER]->(p1)
              ON CREATE SET r.count = 1, r2.count = 1
              ON MATCH SET r.count = r.count + 1, r2.count = r2.count + 1
            `, { product1: productIds[i], product2: productIds[j] })
          }
        }
      }
    } finally {
      await session.close()
    }
  }

  async getBoughtTogether(productId) {
    const session = this.neo4jDriver.session()
    try {
      const result = await session.run(`
        MATCH (p:Product {id: $productId})-[r:BOUGHT_TOGETHER]->(rec:Product)
        RETURN rec.id as productId, r.count as frequency
        ORDER BY r.count DESC
        LIMIT 5
      `, { productId })
      return result.records.map(record => ({
        productId: record.get('productId'),
        frequency: record.get('frequency').toNumber()
      }))
    } finally {
      await session.close()
    }
  }

  async getPersonalizedRecommendations(userId) {
    const session = this.neo4jDriver.session()
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:PURCHASED]->(p:Product)
        MATCH (p)-[:BOUGHT_TOGETHER]->(rec:Product)
        WHERE NOT (u)-[:PURCHASED]->(rec)
        RETURN rec.id as productId, COUNT(*) as score
        ORDER BY score DESC
        LIMIT 10
      `, { userId })
      return result.records.map(record => ({
        productId: record.get('productId'),
        score: record.get('score').toNumber()
      }))
    } finally {
      await session.close()
    }
  }

  async getSimilarUsersRecommendations(userId) {
    const session = this.neo4jDriver.session()
    try {
      const result = await session.run(`
        MATCH (u1:User {id: $userId})-[:PURCHASED]->(p:Product)<-[:PURCHASED]-(u2:User)
        WHERE u1 <> u2
        WITH u2, COUNT(p) as commonProducts
        MATCH (u2)-[:PURCHASED]->(rec:Product)
        WHERE NOT (u1)-[:PURCHASED]->(rec)
        RETURN rec.id as productId, commonProducts, COUNT(*) as recommendations
        ORDER BY commonProducts DESC, recommendations DESC
        LIMIT 8
      `, { userId })
      return result.records.map(record => ({
        productId: record.get('productId'),
        commonProducts: record.get('commonProducts').toNumber(),
        recommendations: record.get('recommendations').toNumber()
      }))
    } finally {
      await session.close()
    }
  }

  async getTrendingProducts() {
    const session = this.neo4jDriver.session()
    try {
      const result = await session.run(`
        MATCH (p:Product)<-[r:PURCHASED]-(u:User)
        WHERE r.timestamp > datetime() - duration('P7D')
        RETURN p.id as productId, COUNT(r) as purchases
        ORDER BY purchases DESC
        LIMIT 10
      `)
      return result.records.map(record => ({
        productId: record.get('productId'),
        purchases: record.get('purchases').toNumber()
      }))
    } finally {
      await session.close()
    }
  }
}

module.exports = RecommendationService