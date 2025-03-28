const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  severity: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: Date, default: Date.now },
  dId: { type: String, required: true },
});

const Alert = mongoose.model("Alert", AlertSchema);
module.exports = Alert;
