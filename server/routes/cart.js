const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const cartKey = `cart:${req.user.id}`
    // Use hgetall to retrieve all fields from the hash, which will include the 'items' field
    const cartData = await req.redisClient.hgetall(cartKey)
    // Parse the 'items' field if it exists, otherwise return an empty array
    const cart = cartData && cartData.items ? JSON.parse(cartData.items) : []
    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    const cartKey = `cart:${req.user.id}`

    // Retrieve existing cart data using hgetall
    let cartData = await req.redisClient.hgetall(cartKey)
    // Parse the 'items' field from the hash, or initialize as an empty array
    let cart = cartData && cartData.items ? JSON.parse(cartData.items) : []

    const existingItem = cart.find(item => item.productId === productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ productId, quantity, addedAt: new Date() })
    }

    // Use HSET to store the cart items as a field within the hash
    await req.redisClient.hset(cartKey, 'items', JSON.stringify(cart))
    // Set the expiry for the entire hash key separately, as HSET doesn't have an expiry option
    await req.redisClient.expire(cartKey, 86400) // 86400 seconds = 24 hours

    res.json({ message: 'Item added to cart', cart })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const cartKey = `cart:${req.user.id}`
    // Retrieve existing cart data using hgetall
    let cartData = await req.redisClient.hgetall(cartKey)
    // Parse the 'items' field from the hash, or initialize as an empty array
    let cart = cartData && cartData.items ? JSON.parse(cartData.items) : []

    // Filter out the item to be removed
    cart = cart.filter(item => item.productId !== req.params.productId)

    // Update the 'items' field in the hash with the modified cart
    await req.redisClient.hset(cartKey, 'items', JSON.stringify(cart))
    // Re-set the expiry for the entire hash key
    await req.redisClient.expire(cartKey, 86400)

    res.json({ message: 'Item removed from cart', cart })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/clear', auth, async (req, res) => {
  try {
    const cartKey = `cart:${req.user.id}`
    // DEL works for any key type, including hashes
    await req.redisClient.del(cartKey)
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router