// models/Guest.js
const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  guestId:   { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  guestName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema);
