const mongoose = require('mongoose');

async function connectDatabase(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error));
  console.log('Connected to MongoDB');
}

module.exports = { connectDatabase };
