  import axios from "axios";
  import UserConfig from "../models/userConfig.model.js";
  import Notification from "../models/notification.model.js";
  import { getIO } from "../middleware/socket.js";
  import adafruitService from "../utils/adafruitService.js";

const sendNotification = async (userId, msg, lv) => {
  const notification = new Notification({
    user_id: userId,
    message: msg,
    status: "unread",
    alertLevel: lv,
  });
  // await notification.save();
  console.log(`Đã gửi thông báo cho user ${userId}: ${msg}`);
};

  const fetchLatestSensorData = async (feed) => {
    try {
      const response = await axios.get(
        `https://io.adafruit.com/api/v2/${process.env.ADAFRUIT_USERNAME}/feeds/${feed}/data`
      );
      console.log(response.data[0].value);
      return parseFloat(response.data[0].value);
    } catch (error) {
      console.error(
        `Lỗi khi lấy dữ liệu từ Adafruit IO (${feed}):`,
        error.message
      );
      return null;
    }
  };

  const checkTemperature = async () => {
    const io = getIO();
    const value = await fetchLatestSensorData("sensor-temperature");
    if (value === null) return;

<<<<<<< HEAD
    const rooms = io.sockets.adapter.rooms;
    const onlineUsers = [];
    for (const [room, clients] of rooms) {
      if (room.startsWith("user-")) {
        const userId = room.split("user-")[1];
        onlineUsers.push(userId);
      }
    }
=======
  for (const userConfig of userConfigs) {
    const userId = userConfig.user_id;
    const { high, low } = userConfig.thresholds.temperature;
>>>>>>> BE_SERVER

    const userConfigs = await UserConfig.find({
      user_id: { $in: onlineUsers },
    });

<<<<<<< HEAD
    for (const userConfig of userConfigs) {
      const userId = userConfig.user_id;
      const { high, low } = userConfig.thresholds.temperature;
      const now = new Date();

      let msg = "";
      let isOverThreshold = false;

      if (!currentState[userId]) currentState[userId] = "NORMAL";

=======
>>>>>>> BE_SERVER
    if (value > high) {
      isOverThreshold = true;
      msg = `Nhiệt độ cao: ${value}°C (Ngưỡng: ${high}°C)!`;
      await sendNotification(userId, msg, "CAO");
      io.to(`user-${userId}`).emit("sensor-update", {
        sensorType: "temperature",
        value,
        msg,
        isOverThreshold,
      });
    } else if (value < low) {
      isOverThreshold = true;
      msg = `Nhiệt độ thấp: ${value}°C (Ngưỡng: ${low}°C)!`;
      await sendNotification(userId, msg, "THẤP");
      io.to(`user-${userId}`).emit("sensor-update", {
        sensorType: "temperature",
        value,
        msg,
        isOverThreshold,
      });
    } else {
      msg = `Nhiệt độ ổn định: ${value}°C.`;
    }
  }
};

  export default { checkTemperature };
