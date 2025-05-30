import axios from "axios";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";
import { getIO } from "../middleware/socket.js";
import adafruitService from "../utils/adafruitService.js";

let lastAlertTime = {};
let currentState = {};

const sendNotification = async (userId, msg, lv) => {
  const notification = new Notification({
    user_id: userId,
    message: msg,
    status: "unread",
    alertLevel: lv,
  });
  await notification.save();
  await notification.save();
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

const checkBright = async () => {
  const io = getIO();
  const value = await fetchLatestSensorData("sensor-light");
  console.log("value:", value);
  if (value === null) return;

  const rooms = io.sockets.adapter.rooms;
  const onlineUsers = [];
  for (const [room, clients] of rooms) {
    if (room.startsWith("user-")) {
      const userId = room.split("user-")[1];
      onlineUsers.push(userId);
    }
  }
  const userConfigs = await UserConfig.find({
    user_id: { $in: onlineUsers },
  });

  for (const userConfig of userConfigs) {
    const userId = userConfig.user_id;
    const { high, low } = userConfig.thresholds.brightness;
    const now = new Date();
    let msg = "";
    let isOverThreshold = false;

    if (!currentState[userId]) currentState[userId] = "NORMAL";

    if (value > high) {
      isOverThreshold = true;
      msg = `Độ sáng cao: ${value}% (Ngưỡng: ${high}%)!`;
      if (currentState[userId] !== "HIGH") {
        currentState[userId] = "HIGH";
        lastAlertTime[userId] = now;
        await sendNotification(userId, msg);
        console.log(`[EMIT] sensor-update → user-${userId}: ${msg}`);
        
        io.to(`user-${userId}`).emit("sensor-update", {
          sensorType: "brightness",
          value,
          msg,
          isOverThreshold,
        });
      } else if (lastAlertTime[userId] && now - lastAlertTime[userId] >= 3000) {
        lastAlertTime[userId] = now;
        await sendNotification(userId, msg, "CAO");
        io.to(`user-${userId}`).emit("sensor-update", {
          sensorType: "brightness",
          value,
          msg,
          isOverThreshold,
        });
      }
    } else if (value < low) {
      isOverThreshold = true;
      msg = `Độ sáng thấp: ${value}% (Ngưỡng: ${low}%)!`;
      if (currentState[userId] !== "LOW") {
        currentState[userId] = "LOW";
        lastAlertTime[userId] = now;
        await sendNotification(userId, msg, "THẤP");
        io.to(`user-${userId}`).emit("sensor-update", {
          sensorType: "brightness",
          value,
          msg,
          isOverThreshold,
        });
      } else if (lastAlertTime[userId] && now - lastAlertTime[userId] >= 3000) {
        lastAlertTime[userId] = now;
        await sendNotification(userId, msg, "THẤP");
        io.to(`user-${userId}`).emit("sensor-update", {
          sensorType: "brightness",
          value,
          msg,
          isOverThreshold,
        });
      }
    } else {
      if (currentState[userId] !== "NORMAL") {
        msg = `Độ sáng ổn định: ${value}%.`;
        currentState[userId] = "NORMAL";
        lastAlertTime[userId] = null;
        // await sendNotification(userId, msg);
        // io.to(`user-${userId}`).emit("sensor-update", {
        //   sensorType: "brightness",
        //   value,
        //   msg,
        //   isOverThreshold,
        // });
      }
    }
  }
};

export default { checkBright };
