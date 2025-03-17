const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  device_id: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
});

const Device = mongoose.model('Device', DeviceSchema);
module.exports = Device;