// models/Tag.js
const mongoose = require('mongoose');
const slugify = require('slugify');
const { programmingLanguages } = require('../constants/tags');

const tagSchema = new mongoose.Schema({
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


tagSchema.statics.seedDefaults = async function() {
  const docs = programmingLanguages.map(name => ({
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
  console.log(`✅ Default tags upserted: inserted ${res.upsertedCount}`);
};

module.exports = mongoose.model('Tag', tagSchema);
