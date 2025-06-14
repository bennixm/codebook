// models/Guest.js
const mongoose = require('mongoose');
const guestSchema = new mongoose.Schema({
  guestId:   { type: String, required: true, unique: true },
  guestName: { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model('Guest', guestSchema);
