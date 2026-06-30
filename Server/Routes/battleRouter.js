const express = require('express');
const router = express.Router();
const BattleItem = require('../Models/battleItemSchema');
const User = require('../Models/userSchema');
const auth = require('../Middleware/authMiddleware');

router.use(auth);

router.get('/kills', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('killCounts');
    res.json(Object.fromEntries(user?.killCounts || []));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/slay', async (req, res) => {
  try {
    const item = await BattleItem.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await User.findByIdAndUpdate(req.user.id, { $inc: { [`killCounts.${item.difficulty}`]: 1 } });
    await item.deleteOne();
    res.json({ difficulty: item.difficulty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await BattleItem.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await BattleItem.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await BattleItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await BattleItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
