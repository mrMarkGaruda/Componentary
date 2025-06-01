const express = require('express')
const router = express.Router()
const RecommendationService = require('../services/RecommendationService')
const neo4jDriver = require('../config/neo4j')
const redisClient = require('../config/redis')

const service = new RecommendationService(neo4jDriver, redisClient)

router.get('/bought-together/:productId', async (req, res) => {
  try {
    const data = await service.getBoughtTogether(req.params.productId)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/for-user/:userId', async (req, res) => {
  try {
    const data = await service.getPersonalizedRecommendations(req.params.userId)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/similar-users/:userId', async (req, res) => {
  try {
    const data = await service.getSimilarUsersRecommendations(req.params.userId)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/trending', async (req, res) => {
  try {
    const data = await service.getTrendingProducts()
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/record-purchase', async (req, res) => {
  try {
    const { userId, productIds } = req.body
    await service.createPurchaseRelationship(userId, productIds)
    res.json({ message: 'Purchase recorded for recommendations' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router