const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: Date, default: Date.now },
  userId: { type: String, required: true },
});

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
