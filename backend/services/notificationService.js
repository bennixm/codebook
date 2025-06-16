const Notification = require('../models/Notification');

async function createNotification({ app, recipient, actor, type, targetType, targetId }) {
 
  if (actor && recipient && actor.toString() === recipient.toString()) return;

  if (!recipient || !targetId) {
    console.warn('Missing recipient or targetId in createNotification');
    return;
  }

  let notif = await Notification.create({
    recipient, actor, type, targetType, targetId
  });

notif = await notif.populate('actor', 'name avatar');
const io = app.locals.io;
io.to(`user_${recipient}`).emit('notification', notif);

  return notif;
}

module.exports = { createNotification };
