import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  type: {
    type:String,
  },
  severity: {
    type: String,
    enum:['Low', 'Medium', 'High'],
    default: 'Low'
  },
  time: {
    type: Date,
    default: Date.now
  },
  device_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Device'
  }
});

const Alert = mongoose.model('Alert', AlertSchema);
export default Alert