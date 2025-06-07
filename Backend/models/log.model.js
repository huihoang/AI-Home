import mongoose from "mongoose";

const LogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    device_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Device",
    },
    sensor_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Sensor",
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", LogSchema);
export default Log;
