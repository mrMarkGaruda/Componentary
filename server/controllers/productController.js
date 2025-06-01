const Product = require('../models/Product')
exports.createProduct = async (req, res) => {
  const product = new Product({ ...req.body, seller: req.user.id })
  await product.save()
  res.status(201).json(product)
}
exports.getProducts = async (req, res) => {
  const products = await Product.find().populate('seller', 'name email')
  res.json(products)
}
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name email')
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
}
exports.updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, seller: req.user.id },
    req.body,
    { new: true }
  )
  if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' })
  res.json(product)
}
exports.deleteProduct = async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.id })
  if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' })
  res.json({ message: 'Product deleted' })
}