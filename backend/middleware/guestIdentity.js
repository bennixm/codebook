// middleware/guestIdentity.js
const mongoose = require('mongoose');
const randomGuestName = require('../utils/randomName');

module.exports = (req, res, next) => {
 
  let { guestId, guestName } = req.cookies || {};

  if (!guestId) {
    guestId = new mongoose.Types.ObjectId();
    res.cookie('guestId', guestId, {
      httpOnly: true,    
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
  }

  if (!guestName) {
    guestName = randomGuestName();
    res.cookie('guestName', guestName, {
      httpOnly: false,   
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
  }

  
  req.guest = { guestId, guestName };
  next();
};
