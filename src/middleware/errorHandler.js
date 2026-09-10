const AppError = require('../utils/AppError');

function notFound(req, _res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} was not found`, 404));
}

function errorHandler(error, _req, res, _next) {
  let status = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  }
  if (error.name === 'CastError') { status = 400; message = 'Invalid resource id'; }
  if (error.code === 11000) { status = 409; message = 'A record with this value already exists'; }
  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, message, ...(details && { details }) });
}

module.exports = { notFound, errorHandler };
