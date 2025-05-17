import mongoose from 'mongoose';
const imageSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  timestamp: {
    type: Date,
  },
  classification: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);
export default Image;