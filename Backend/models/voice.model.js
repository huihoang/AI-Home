import mongoose from "mongoose";

const voiceSchema = new mongoose.Schema({
  feed_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
  value: {
    type: String, 
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
    ref: 'Device'
  }
}, {
  collection: 'log-voice'
});

const VoiceFeed = mongoose.model('VoiceFeed', voiceSchema);

export default VoiceFeed;