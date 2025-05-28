import mongoose from "mongoose";

const hangClotheSchema= new mongoose.Schema({
  feed_id: {
    type: String,
    required: true,
    unique: true
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
  collection: 'button-hang-clothe'
});

const HangClotheFeed = mongoose.model('HangClotheFeed', hangClotheSchema);

export default HangClotheFeed;