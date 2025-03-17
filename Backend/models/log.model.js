const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  log_id: { type: String, required: true },
  event: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

const Log = mongoose.model('Log', LogSchema);
module.exports = Log;