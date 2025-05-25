const User = require('../models/user');

// controllers/user.controller.js
exports.userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
