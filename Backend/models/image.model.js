import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  timestamp: {
    type: String
  },
  classification: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);
export default Image;