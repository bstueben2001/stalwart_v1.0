const express = require('express');
const router = express.Router();
const HealthGoal = require('../Models/healthGoalSchema');
const auth = require('../Middleware/authMiddleware');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const goals = await HealthGoal.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const goal = await HealthGoal.create({ ...req.body, userId: req.user.id });
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const goal = await HealthGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const goal = await HealthGoal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
