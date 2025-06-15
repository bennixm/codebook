const User = require('../models/user');
const admin = require('../firebase');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendPasswordChangedEmail,sendPasswordSetConfirmationEmail } = require('../services/mailService');
const { extractFirebasePath }   = require('../utils/extract-firebase-path');

const bucket = admin.storage().bucket();

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  }
  catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const isTheSame = await bcrypt.compare(newPassword, user.password);
    if (isTheSame) {
      return res.status(400).json({ error: 'Your new password must be different from your current one.' });
    }

    user.password = newPassword;
    await user.save();

    sendPasswordChangedEmail(user).catch(err => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to send welcome email:', err);
      }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error changing password:', err);
    }
    res.status(500).json({ error: 'Something went wrong: ' + err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, bio } = req.body || {};
  const userId = req.user.id;

  let newAvatarUrl = '';

  try {
    const user = await User.findById(userId);
    if (!user) {
      if (process.env.NODE_ENV !== 'test') {
        console.log('❌ User not found');
      }
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.fileBuffer && req.fileMeta) {
      const filePath = `avatars/${userId}/avatar_${Date.now()}.${req.fileMeta.ext}`;
      const fileUpload = bucket.file(filePath);

      await fileUpload.save(req.fileBuffer, {
        metadata: { contentType: req.fileMeta.mime },
        public: true,
      });

      newAvatarUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      if (user.avatar) {
        const oldFilePath = extractFirebasePath(user.avatar);
        if (oldFilePath) {
          try {
            await bucket.file(oldFilePath).delete();
          } catch (err) {
            if (process.env.NODE_ENV !== 'test') {
              console.warn('⚠️ Failed to delete old avatar:', err.message);
            }
          }
        }
      }
    } else {
      const oldFilePath = extractFirebasePath(user.avatar);
      if (oldFilePath) {
        try {
          await bucket.file(oldFilePath).delete();
        } catch (err) {
          if (process.env.NODE_ENV !== 'test') {
            console.warn('⚠️ Failed to delete old avatar:', err.message);
          }
        }
      }
    }

    user.name = name;
    user.bio = bio;
    user.avatar = newAvatarUrl;

    const updated = await user.save();

    res.json({ success: true, user });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Server error:', err);
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.setBio = async (req, res) => {
  const { bio } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.bio = bio;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Server error:', err);
    }
    res.status(500).json({ error: 'Failed to update bio' });
  }
};
exports.setPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, confirmPassword } = req.body;

  

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
  
    user.password = newPassword;
    user.provider = 'local';
    await user.save();

    sendPasswordSetConfirmationEmail(user).catch(console.error);

    res.json({ message: 'Password set successfully.' });
  } catch (err) {
    console.error('setPassword error:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { following: targetUserId } },
      { new: true }
    );

    const targetUser = await User.findByIdAndUpdate(
      targetUserId,
      { $addToSet: { followers: currentUserId } },
      { new: true }
    );

    if (!targetUser) {
      return res.status(404).json({ error: 'User to follow not found.' });
    }

    res.status(200).json({
      message: `You are now following ${targetUser.name}.`,
      following: currentUser.following,
      followersCount: targetUser.followers.length
    });
  } catch (err) {
    console.error('❌ followUser error:', err);
    next(err);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ error: 'You cannot unfollow yourself.' });
    }

    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { following: targetUserId } },
      { new: true }
    );

    const targetUser = await User.findByIdAndUpdate(
      targetUserId,
      { $pull: { followers: currentUserId } },
      { new: true }
    );

    if (!targetUser) {
      return res.status(404).json({ error: 'User to unfollow not found.' });
    }

    res.status(200).json({
      message: `You have unfollowed ${targetUser.name}.`,
      following: currentUser.following,
      followersCount: targetUser.followers.length
    });
  } catch (err) {
    console.error('❌ unfollowUser error:', err);
    next(err);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate('followers', 'name avatar')
      .select('followers');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ followers: user.followers });
  } catch (err) {
    console.error('❌ getFollowers error:', err);
    next(err);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate('following', 'name avatar')
      .select('following');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ following: user.following });
  } catch (err) {
    console.error('❌ getFollowing error:', err);
    next(err);
  }
};


