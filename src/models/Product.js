const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 150, index: true },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, required: true, min: 0, validate: { validator: Number.isInteger, message: 'Stock quantity must be an integer' } },
  category: { type: String, required: true, trim: true, lowercase: true, maxlength: 80, index: true },
}, { timestamps: true, versionKey: false });

productSchema.index({ name: 'text' });
module.exports = mongoose.model('Product', productSchema);
