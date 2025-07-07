const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const qs       = require('querystring');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail,sendForgotPasswordEmail,sendPasswordResetSuccessEmail, sendGoogleWelcomeEmail} = require('../services/mailService');
const { generateUniqueUsername } = require('../utils/generateUniqueUsername');

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

    const rawToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    newUser.resetToken = hashedToken;
    newUser.resetTokenExpires = Date.now() + 24 * 60 * 60e3;
    await newUser.save({ validateBeforeSave: false });

    sendWelcomeEmail(newUser, rawToken).catch(err => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to send welcome email:', err);
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id
    });

  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('createUser ERROR:', err);
    }
    res.status(500).json({ error: 'Something went wrong: ' + err.message });
  }
};
exports.googleCallback = async (req, res) => {
  try {
    const code = req.query.code;

    
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      qs.stringify({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  process.env.API_URL + '/auth/google/callback',
        grant_type:    'authorization_code'
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token } = tokenRes.data;

   
    const profileRes = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const { id, email, name, picture } = profileRes.data;

    let user = await User.findOne({ googleId: id });
   
    const username = await generateUniqueUsername(email,User);
    const raw = crypto.randomBytes(32).toString('hex');
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId     = id;
        user.name         = user.name   || name;
        user.avatar       = user.avatar || picture;
        await user.save();
      }
      else{
        user = await User.create({
          provider: 'google',
          googleId: id,
          email,
          isVerified: true,
          username,
          password: raw, 
          name,
          avatar: picture
        });
       sendGoogleWelcomeEmail(user).catch(err => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Failed to send welcome email:', err);
        }
      });
      }
    }
   
   
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    res.cookie('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      expires:  expiresAt
    });

    
    res.redirect(process.env.PRODUCT_URL + '/panel/dashboard');

  } catch (err) {
    console.error('Google OAuth error', err);
    res.redirect(process.env.PRODUCT_URL + '/auth?error=oauth_failed');
  }
};

exports.activateUser = async (req, res) => {
  const { userId, token } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  if (user.isVerified) {
    return res.status(200).json({ message: 'Your account is already activated.' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  if (user.resetToken !== hashedToken || user.resetTokenExpires < Date.now()) {
    return res.status(400).json({ error: 'Activation link is invalid or has expired.' });
  }

  user.isVerified = true;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Account activated successfully. You can now log in.' });
};

exports.resendActivation = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already activated.' });
    }

    const rawToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendWelcomeEmail(user, rawToken);

    res.json({
      message: 'Activation link resent! Check your inbox (and spam folder).'
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('resendActivation error:', err);
    }
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Incorrect email or password' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Incorrect email or password' });

  if (!user.isVerified) {
    return res.status(403).json({
      error: 'ACCOUNT_NOT_ACTIVATED',
      message: 'Your account isn’t activated yet.',
      canResend: true
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    expires: expiresAt,
  });

  res.json({ token });
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();
    await sendForgotPasswordEmail(user,token);

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    console.error('Error sending reset email:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.resetPassword = async (req, res) => {
 
  const { token, password } = req.body;
  


  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;

    await user.save();
    await sendPasswordResetSuccessEmail(user);


    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


exports.logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};
