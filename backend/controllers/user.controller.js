const User = require('../models/user');
const admin = require('../firebase');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendPasswordChangedEmail } = require('../services/mailService');


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
}
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

    
    user.password = newPassword;
    await user.save();
    sendPasswordChangedEmail(user).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Something went wrong: ' + err.message });
  }
};


exports.updateProfile = async (req, res) => {
  const { name, bio } = req.body || {};
  const userId = req.user.id;

  let newAvatarUrl='';

 

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
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
            console.warn('⚠️ Failed to delete old avatar:', err.message);
          }
        }
      }
    }else {
      const oldFilePath = extractFirebasePath(user.avatar);
        if (oldFilePath) {
          try {
            await bucket.file(oldFilePath).delete();
           
          } catch (err) {
            console.warn('⚠️ Failed to delete old avatar:', err.message);
          }
        }
    }

    user.name = name;
    user.bio = bio;
     user.avatar = newAvatarUrl;

    const updated = await user.save();
    

    res.json({ success: true, user });
  } catch (err) {
    console.error('❌ Server error:', err);
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
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Failed to update bio' });
  }
};

function extractFirebasePath(url) {
  try {
    const match = url.match(/https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
