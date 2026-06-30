//after following "councilRouter.js" and selecting "Health Advisor", this route will present the Health Dashboard
const express = require('express');
const router = express.Router();
const HealthGoal = require('../Models/healthGoalSchema');

router.get('/', async (req, res) => {
  try {
    const goals = await HealthGoal.find().sort({ date: 1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const goal = await HealthGoal.create(req.body);
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const goal = await HealthGoal.findByIdAndUpdate(
      req.params.id,
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
    await HealthGoal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
