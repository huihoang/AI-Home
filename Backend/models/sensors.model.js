const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  time: { type: Date, default: Date.now },
  value: { type: String, required: true },
  dId: { type: String, required: true },
});

const Sensor = mongoose.model("Sensor", SensorSchema);
module.exports = Sensor;
