const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const notifs = await Notification
    .find({ recipient: req.user.id })
    .populate('actorUser',  'name avatar username')
    .populate('actorGuest', 'guestName')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifs);
};

exports.markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.sendStatus(204);
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { read: true }
  );
  res.sendStatus(204);
};



