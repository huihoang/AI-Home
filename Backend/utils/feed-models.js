import BrightFeed from '../models/bright.model.js';
import CameraFeed from '../models/camera.model.js';
import HumidityFeed from '../models/humidity.model.js';
import MotionFeed from '../models/motion.model.js';
import TempFeed from '../models/temp.model.js';
import LedFeed from '../models/led.model.js';
import DoorFeed from '../models/door.model.js';
import FanFeed from '../models/fan.model.js';
import HangClotheFeed from '../models/hangCloth.model.js';
import VoiceFeed from '../models/voice.model.js';

/**
 * 
 * @param {string} feedKey 
 * @returns {mongoose.Model} 
 */
export const getFeedModel = (feedKey) => {
  console.log(feedKey)
  switch (feedKey) {
    case 'sensor-light':
      return BrightFeed;
    case 'sensor-camera':
      return CameraFeed;
    case 'sensor-humidity':
      return HumidityFeed;
    case 'sensor-motion':
      return MotionFeed;
    case 'sensor-temperature':
      return TempFeed;
    case 'button-led':
      return LedFeed;
    case 'button-door':
      return DoorFeed;
    case 'button-fan':
      return FanFeed;
    case 'button-hang-clothe':
      return HangClotheFeed;
    case 'log-voice':
      return VoiceFeed;
    default:
      throw new Error(`Invalid feed key: ${feedKey}`);
  }
};

export default getFeedModel;