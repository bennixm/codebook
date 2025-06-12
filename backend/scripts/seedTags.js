// scripts/seedTags.js
require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const connectDB = require('../config/db');
const { programmingLanguages } = require('../constants/tags');
const Tag = require('../models/Tag');

async function seedTags() {
  await connectDB();

  const ops = programmingLanguages.map(name => ({
    updateOne: {
      filter: { name },
      update: {
        $setOnInsert: {
          name,
          slug: slugify(
            name
              .replace(/\+\+/g, ' plus-plus')
              .replace(/#/g, ' sharp'),
            { lower: true, strict: true }
          ),
        },
      },
      upsert: true,
    },
  }));

  const res = await Tag.bulkWrite(ops);
  console.log(`✅ Default tags processed: inserted ${res.upsertedCount}, matched ${res.matchedCount}`);

  await mongoose.disconnect();
}

seedTags()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
