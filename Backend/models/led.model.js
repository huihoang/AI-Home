import mongoose from "mongoose";

const ledSchema = new mongoose.Schema({
  feed_id: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Number, 
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
  collection: 'feed_led'
});

const LedFeed = mongoose.model('LedFeed', ledSchema);

export default LedFeed;