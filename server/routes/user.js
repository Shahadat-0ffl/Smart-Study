const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddlewares = require('../middlewares/authMiddlewares');
const router = express.Router();

const POINTS_PER_INTERVAL = 10;

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User already exists' });

    user = new User({ username, email, password });
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({
      success: true,
      token,
      user: { id: user._id, username, email, bonusPoints: user.bonusPoints },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email, bonusPoints: user.bonusPoints },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get User
router.get('/user/:id', authMiddlewares, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bonusPoints: user.bonusPoints,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Time
router.post('/update-time', authMiddlewares, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.bonusPoints += POINTS_PER_INTERVAL;
    await user.save();

    res.json({
      success: true,
      message: `You earned ${POINTS_PER_INTERVAL} bonus points.`,
      points: user.bonusPoints,
    });
  } catch (error) {
    console.error('Error updating time:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;