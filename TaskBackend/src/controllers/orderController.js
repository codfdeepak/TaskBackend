const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw new AppError('items must be a non-empty array', 400);
  const quantities = new Map();
  for (const item of items) {
    if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new AppError('Every item needs a valid productId and positive integer quantity', 400);
    }
    quantities.set(String(item.productId), (quantities.get(String(item.productId)) || 0) + item.quantity);
  }
  return [...quantities.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

exports.create = asyncHandler(async (req, res) => {
  const requestedItems = normalizeItems(req.body.items);
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const orderItems = [];
      for (const item of requestedItems) {
        // Conditional atomic decrement prevents overselling even under concurrent requests.
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, stockQuantity: { $gte: item.quantity } },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true, session }
        );
        if (!product) throw new AppError(`Product ${item.productId} does not exist or has insufficient stock`, 409);
        orderItems.push({ product: product._id, name: product.name, priceAtPurchase: product.price, quantity: item.quantity });
      }
      const totalAmount = orderItems.reduce((total, item) => total + item.priceAtPurchase * item.quantity, 0);
      [order] = await Order.create([{ user: req.user._id, items: orderItems, totalAmount }], { session });
    });
  } finally { await session.endSession(); }
  res.status(201).json({ success: true, order });
});

exports.listMine = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { user: req.user._id };
  const [orders, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), Order.countDocuments(filter)]);
  res.json({ success: true, orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

exports.getMine = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, order });
});
