import mongoose from "mongoose";

const SensorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["temperature", "motion", "light", "humidity", "other"],
    },
    location: {
      type: String,
      default: "home",
    },
    value: {
      type: Number,
      dafault: null,
    },
    unit: {
      type: String,
      default: "",
    },
    device_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Sensor = mongoose.model("Sensor", SensorSchema);
export default Sensor;
