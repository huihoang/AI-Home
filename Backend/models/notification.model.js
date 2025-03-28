import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["read", "unread"],
    default: "unread",
  },
  time: {
    type: Date,
    default: Date.now,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
