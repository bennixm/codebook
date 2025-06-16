const Notification = require('../models/Notification');

async function createNotification({ app, recipient, actor, type, targetType, targetId }) {
  // avoid self-notifs
  if (actor.toString() === recipient.toString()) return;

  const notif = await Notification.create({
    recipient, actor, type, targetType, targetId
  });

  // real-time push via Socket.io
  const io = app.locals.io;
  io.to(`user_${recipient}`).emit('notification', notif);

  return notif;
}

module.exports = { createNotification };
