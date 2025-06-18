const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
  const coll = mongoose.connection.collection('guests');
  try {
    await coll.dropIndex('guestId_1');
    console.log('✅ Dropped guests.guestId_1 index');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('ℹ️ guests.guestId_1 index not found, skipping drop');
    } else {
      console.error('❌ Error dropping guestId_1 index:', err);
    }
  }
};

module.exports = connectDB;
