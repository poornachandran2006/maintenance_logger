// models/shift.model.js
const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Shift 1
  start: { type: String }, // "08:00"
  end: { type: String },   // "16:00"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

ShiftSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Shift || mongoose.model('Shift', ShiftSchema);
