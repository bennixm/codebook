const Notification = require('../models/Notification');
const mongoose     = require('mongoose');

async function createNotification({
  app,
  recipient,
  actorUser,
  actorGuest,
  type,
  targetType,
  targetId
}) {

  if (
    actorUser &&
    recipient.toString() === actorUser.toString()
  ) return;

  if (!recipient || !targetId) {
    console.warn('Missing recipient or targetId');
    return;
  }

  const notif = await Notification.create({
    recipient,
    actorUser,
    actorGuest,
    type,
    targetType,
    targetId
  });

  // populate whichever actor field you used
  await notif.populate([
    { path: 'actorUser',  select: 'name avatar username'   },
    { path: 'actorGuest', select: 'guestName'     }
  ]);

  app.locals.io
  .to(recipient.toString())
  .emit('notification', notif)


  return notif;
}

module.exports = { createNotification };
