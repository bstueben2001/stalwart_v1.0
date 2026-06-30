//after following "councilRouter.js" and selecting "Diplomacy Advisor", this route will present the Diplomacy Dashboard
const express = require('express');
const router = express.Router();
const DiplomacyRelation = require('../Models/diplomacyRelationSchema');

router.get('/', async (req, res) => {
  try {
    const relations = await DiplomacyRelation.find().sort({ name: 1 });
    res.json(relations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const relation = await DiplomacyRelation.create(req.body);
    res.status(201).json(relation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const relation = await DiplomacyRelation.findByIdAndUpdate(
      req.params.id,
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
    await DiplomacyRelation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
