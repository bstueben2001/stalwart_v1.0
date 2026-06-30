const mongoose = require('mongoose');

const battleItemSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  date:        { type: String, required: true },
  description: { type: String, default: '' },
  category:    { type: String, default: 'battle' },
  difficulty:  {
    type:    String,
    enum:    ['Minion', 'Champion', 'Overlord', 'Emperor'],
    default: 'Minion',
  },
}, { timestamps: true });

module.exports = mongoose.model('BattleItem', battleItemSchema);
