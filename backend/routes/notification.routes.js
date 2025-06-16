const express = require('express');
const router  = express.Router();
const auth = require('../middleware/auth/authMiddleware');
const notifC  = require('../controllers/notification.controller');

router.get('/',auth,notifC.getNotifications);
router.post('/:id/read', auth,notifC.markRead);
router.post('/read-all',auth,notifC.markAllRead);

module.exports = router;
