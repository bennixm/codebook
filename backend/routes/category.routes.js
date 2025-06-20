const express = require('express');
const router = express.Router();
const { getAllCategories } = require('../controllers/category.controller');

router.get('/categories', getAllCategories);

module.exports = router;
