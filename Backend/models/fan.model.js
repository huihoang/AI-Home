import mongoose from "mongoose";

const fanSchema = new mongoose.Schema({
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
    ref: 'Device'
  }
}, {
  collection: 'button-fan'
});

const FanFeed = mongoose.model('FanFeed', fanSchema);

export default FanFeed;