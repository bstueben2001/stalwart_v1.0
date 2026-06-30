const mongoose = require('mongoose');

const battleItemSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  date:        { type: String, required: true },
  description: { type: String, default: '' },
  category:    { type: String, default: 'battle' },
  difficulty:  {
    type:    String,
    enum:    ['Minion', 'Captain', 'Champion', 'Commander', 'General', 'Overlord', 'Prophet', 'Emperor', 'God'],
    default: 'Minion',
  },
}, { timestamps: true });

module.exports = mongoose.model('BattleItem', battleItemSchema);
