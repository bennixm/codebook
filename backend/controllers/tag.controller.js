// controllers/tagController.js
const Tag = require('../models/Tag')

exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.find()
      .select('name slug')
      .sort({ name: 1 })       
    res.json({ tags })
  } catch (err) {
    next(err)
  }
}
