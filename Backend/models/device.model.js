import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["camera", "led", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "maintain", "error"],
      default: "offline",
      required: true,
    },
    location: {
      type: String,
      default: "Unknown",
    },
    connected: {
      type: Boolean,
      default: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Device = mongoose.model("Device", DeviceSchema);
export default Device;
