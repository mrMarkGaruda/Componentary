const Product = require('../models/Product')
const Order = require('../models/Order')

exports.createOrder = async (req, res) => {
  const order = new Order({ ...req.body, user: req.user.id })
  await order.save()
  res.status(201).json(order)
}
exports.getOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate('items.product', 'name price image').sort({ createdAt: -1 })
  res.json(orders)
}
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('user', 'name email')
  if (!order) return res.status(404).json({ message: 'Order not found' })
  res.json(order)
}

// Simple recommendations based on user's order history (brand/type)
exports.getSimpleRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find all products the user has ordered
    const orders = await Order.find({ user: userId }).populate('items.product');
    const boughtProducts = orders.flatMap(order => order.items.map(item => item.product));
    if (!boughtProducts.length) return res.json([]);

    // Get unique brands and categories
    const brands = [...new Set(boughtProducts.map(p => p.brand).filter(Boolean))];
    const categories = [...new Set(boughtProducts.map(p => p.category).filter(Boolean))];

    // Recommend products with same brand or category, not already bought
    const recommended = await Product.find({
      $or: [
        { brand: { $in: brands } },
        { category: { $in: categories } }
      ],
      _id: { $nin: boughtProducts.map(p => p._id) }
    }).limit(parseInt(req.query.limit) || 10);

    res.json(recommended);
  } catch (error) {
    console.error('Simple recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
};