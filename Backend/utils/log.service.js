import Log from '../models/log.model.js';

const createLog = async (event, message, details = {}) => {
  try {
    const log = new Log({
      event,
      message,
      user_id: details.user_id,
      device_id: details.device_id ,
      sensor_id: details.sensor_id 
    });
    
    await log.save();
    return log;
  } catch (error) {
    console.error("Error creating log:", error);
  }
};

export default { createLog };