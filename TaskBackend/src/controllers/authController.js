const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function tokenFor(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new AppError('name, email and password are required', 400);
  if (String(password).length < 8) throw new AppError('Password must be at least 8 characters', 400);
  const user = await User.create({ name, email, password });
  res.status(201).json({ success: true, token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('email and password are required', 400);
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password', 401);
  res.json({ success: true, token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
});
