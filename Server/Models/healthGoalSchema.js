const mongoose = require('mongoose');

const healthGoalSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  date:        { type: String, required: true },
  description: { type: String, default: '' },
  category:    { type: String, default: 'health' },
  subcategory: {
    type:    String,
    enum:    ['fitness', 'mental-mood', 'nutrition-water', 'nutrition-calories', 'log'],
    default: 'log',
  },
  value: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('HealthGoal', healthGoalSchema);
