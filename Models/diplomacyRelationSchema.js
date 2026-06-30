const mongoose = require('mongoose');

const diplomacyRelationSchema = new mongoose.Schema({
  name:               { type: String, required: true, trim: true },
  birthday:           { type: String },
  favorites:          [{ type: String }],
  relationshipStatus: {
    type:    String,
    enum:    ['great', 'good', 'distant', 'strained', 'complicated'],
    default: 'good',
  },
}, { timestamps: true });

module.exports = mongoose.model('DiplomacyRelation', diplomacyRelationSchema);
