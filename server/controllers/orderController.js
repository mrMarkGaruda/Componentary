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