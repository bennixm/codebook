const mongoose = require('mongoose');
const Blog = require('../models/Blog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
     // OPTIONAL: run this only once and then remove or guard it
     const result = await Blog.updateMany(
      { updatedAt: { $ne: null } }, // only update if updatedAt is set
      { $set: { updatedAt: null } }
    );

    if (result.modifiedCount > 0) {
      console.log(`🧹 Set updatedAt to null in ${result.modifiedCount} blogs`);
    }
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
  
};

module.exports = connectDB;
