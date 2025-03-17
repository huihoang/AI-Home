const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  severity: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

const Alert = mongoose.model('Alert', AlertSchema);
module.exports = Alert;