const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ username: 1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toUpperCase() }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { username, password, fullName, email, role } = req.body;
    const exists = await User.findOne({ username: username.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Username already exists' });
    const user = await User.create({ username, password, fullName, email, role });
    res.status(201).json({ message: 'User created', username: user.username, role: user.role });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:username', adminOnly, async (req, res) => {
  try {
    const { role, isLocked, fullName, email } = req.body;
    const user = await User.findOneAndUpdate(
      { username: req.params.username.toUpperCase() },
      { role, isLocked, fullName, email },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:username/lock', adminOnly, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username.toUpperCase() },
      { isLocked: true }, { new: true }
    ).select('-password');
    res.json({ message: `User ${user.username} locked`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:username/unlock', adminOnly, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username.toUpperCase() },
      { isLocked: false }, { new: true }
    ).select('-password');
    res.json({ message: `User ${user.username} unlocked`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
