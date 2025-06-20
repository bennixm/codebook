const Category = require('../models/Category');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .select('name slug')
      .sort({ name: 1 }); 
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};
