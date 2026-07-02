//after following "councilRouter.js" and selecting "Diplomacy Advisor", this route will present the Diplomacy Dashboard
const express = require('express');
const router = express.Router();
const DiplomacyRelation = require('../Models/diplomacyRelationSchema');
const authMiddleware = require('../Middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const relations = await DiplomacyRelation.find({ userId: req.user.id }).sort({ name: 1 });
    res.json(relations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const relation = await DiplomacyRelation.create({ ...req.body, userId: req.user.id });
    res.status(201).json(relation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const relation = await DiplomacyRelation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!relation) return res.status(404).json({ error: 'Relation not found' });
    res.json(relation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await DiplomacyRelation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
