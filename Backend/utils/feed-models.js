import BrightFeed from '../models/bright.model.js';
import CameraFeed from '../models/camera.model.js';
import HumidityFeed from '../models/humidity.model.js';
import LedFeed from '../models/led.model.js';
import MotionFeed from '../models/motion.model.js';
import TempFeed from '../models/temp.model.js';

/**
 * Lấy mô hình feed dựa trên khóa feed
 * @param {string} feedKey - Khóa feed (bbc-bright, bbc-camera, v.v.)
 * @returns {mongoose.Model} - Model tương ứng
 */
export const getFeedModel = (feedKey) => {
  switch (feedKey) {
    case 'bbc-bright':
      return BrightFeed;
    case 'bbc-camera':
      return CameraFeed;
    case 'bbc-humidity':
      return HumidityFeed;
    case 'bbc-led':
      return LedFeed;
    case 'bbc-motion':
      return MotionFeed;
    case 'bbc-temp':
      return TempFeed;
    default:
      throw new Error(`Invalid feed key: ${feedKey}`);
  }
};

export default getFeedModel;