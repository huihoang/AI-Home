import mongoose from "mongoose";

const doorSchema = new mongoose.Schema({
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
  collection: 'button-door'
});

const DoorFeed = mongoose.model('DoorFeed', doorSchema);

export default DoorFeed;