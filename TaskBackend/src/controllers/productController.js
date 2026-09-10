const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

const writable = ['name', 'description', 'price', 'stockQuantity', 'category'];
function pickProduct(body) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => writable.includes(key)));
}

exports.create = asyncHandler(async (req, res) => {
  const product = await Product.create(pickProduct(req.body));
  res.status(201).json({ success: true, product });
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.category) filter.category = String(req.query.category).trim().toLowerCase();
  if (req.query.search) filter.name = { $regex: String(req.query.search).trim(), $options: 'i' };
  if (req.query.inStock !== undefined) {
    if (!['true', 'false'].includes(String(req.query.inStock))) throw new AppError('inStock must be true or false', 400);
    filter.stockQuantity = String(req.query.inStock) === 'true' ? { $gt: 0 } : 0;
  }
  const [products, total] = await Promise.all([Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), Product.countDocuments(filter)]);
  res.json({ success: true, products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

exports.getOne = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

exports.update = asyncHandler(async (req, res) => {
  const updates = pickProduct(req.body);
  if (!Object.keys(updates).length) throw new AppError('No valid product fields supplied', 400);
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(204).send();
});
