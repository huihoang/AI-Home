const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  event: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  deviceId: { type: String, required: true },
});

const Log = mongoose.model("Log", LogSchema);
module.exports = Log;
