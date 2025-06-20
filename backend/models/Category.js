const mongoose = require('mongoose');
const slugify = require('slugify');
const { defaultCategories } = require('../constants/categories');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
}, {
  timestamps: true,
});

categorySchema.statics.seedDefaults = async function () {
  const docs = defaultCategories.map(name => ({
    name,
    slug: slugify(name, { lower: true, strict: true }),
  }));

  const ops = docs.map(doc => ({
    updateOne: {
      filter: { name: doc.name },
      update: { $setOnInsert: doc },
      upsert: true,
    },
  }));

  const res = await this.bulkWrite(ops);
  console.log(`✅ Default categories upserted: inserted ${res.upsertedCount}`);
};

module.exports = mongoose.model('Category', categorySchema);
