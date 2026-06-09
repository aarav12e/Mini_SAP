const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '8h' });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    const user = await User.findOne({ username: username.toUpperCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isLocked) return res.status(403).json({ message: 'User account is locked. Contact administrator.' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, fullName: user.fullName, role: user.role, client: user.client }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register (admin creates users)
router.post('/register', protect, async (req, res) => {
  try {
    const { username, password, fullName, email, role } = req.body;
    const exists = await User.findOne({ username: username.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Username already exists' });
    const user = await User.create({ username, password, fullName, email, role });
    res.status(201).json({ message: 'User created', username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// POST /api/auth/seed - creates default admin (run once)
router.post('/seed', async (req, res) => {
  try {
    const existing = await User.findOne({ username: 'ADMIN' });
    if (existing) return res.status(400).json({ message: 'Admin already seeded' });
    await User.create({ username: 'ADMIN', password: 'Admin@1234', fullName: 'System Administrator', email: 'admin@erp.local', role: 'ADMIN' });
    res.json({ message: 'Admin user created. Username: ADMIN, Password: Admin@1234' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
