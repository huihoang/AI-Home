import mongoose from "mongoose";

const cameraSchema = new mongoose.Schema({
  feed_id: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String, 
    required: true,
  },
  created_epoch: {
    type: Number,
    required: true
  },
  expiration: {
    type: Date, 
    required: true,
  },
  create_at: {
    type: Date,
    required: true,
  },
  sensor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
  }
}, {
  collection: 'feed_camera' 
});

const CameraFeed = mongoose.model('CameraFeed', cameraSchema);

export default CameraFeed;