const User = require('../models/user');

exports.createUser = async (req, res) => {
  const { name, email, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const newUser = await User.create({
      name,
      email,
      username,
      password
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id
    });

  } catch (err) {
    res.status(500).json({ error: 'Something went wrong: ' + err.message });
  }
};
