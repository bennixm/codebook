require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const connectDB = require('../config/db');
const { defaultCategories } = require('../constants/categories');
const Category = require('../models/Category');

async function seedCategories() {
  await connectDB();

  const ops = defaultCategories.map(name => ({
    updateOne: {
      filter: { name },
      update: {
        $setOnInsert: {
          name,
          slug: slugify(name, { lower: true, strict: true }),
        },
      },
      upsert: true,
    },
  }));

  const res = await Category.bulkWrite(ops);
  console.log(`✅ Default categories processed: inserted ${res.upsertedCount}, matched ${res.matchedCount}`);

  await mongoose.disconnect();
}

seedCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
