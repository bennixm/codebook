// routes/tags.js
const express = require('express');
const router = express.Router();
const { getAllTags } = require('../controllers/tag.controller')
router.get('/tags', getAllTags)
module.exports = router
