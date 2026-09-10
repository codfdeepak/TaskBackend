const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) throw new AppError('Authentication required', 401);
  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch (_error) {
    throw new AppError('Invalid or expired access token', 401);
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new AppError('The user for this token no longer exists', 401);
  req.user = user;
  next();
});

module.exports = { protect };
