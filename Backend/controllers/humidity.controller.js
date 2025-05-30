import axios from "axios";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";
import { getIO } from "../middleware/socket.js";
import adafruitService from "../utils/adafruitService.js";

let lastAlertTime = {};
let currentState = {};

const sendNotification = async (userId, msg, alertLevel) => {
  const notification = new Notification({
    user_id: userId,
    message: msg,
    status: "unread",
    alertLevel: alertLevel,
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

const checkHumidity = async () => {
  const io = getIO();
  const value = await fetchLatestSensorData("sensor-humidity");
  if (value === null) return;

  // Lấy danh sách user đang online từ WebSocket (nếu muốn tối ưu)
  const rooms = io.sockets.adapter.rooms;
  const onlineUsers = [];
  for (const [room, clients] of rooms) {
    if (room.startsWith("user-")) {
      const userId = room.split("user-")[1];
      onlineUsers.push(userId);
    }
  }

  // Lấy user từ database, nhưng chỉ xử lý cho user online
  const userConfigs = await UserConfig.find({
    user_id: { $in: onlineUsers },
  });

  for (const userConfig of userConfigs) {
    const userId = userConfig.user_id;
    const { high, low } = userConfig.thresholds.humidity;

    let isOverThreshold = false;
    let msg = "";
    let hangClotheStatus = "OFF";

    try {
      hangClotheStatus = await fetchLatestSensorData("button-hang-clothe");
    } catch (error) {
      console.error("Lỗi khi lấy trạng thái button-hang-clothe:", error);
    }

    if (value > high) {
      isOverThreshold = true;
      msg = `Độ ẩm vượt ngưỡng (${value}% so với ${high}%)!`;
<<<<<<< HEAD
      if (!currentState[userId] || currentState[userId] !== "HIGH") {
        currentState[userId] = "HIGH";
        await sendNotification(userId, msg);
        console.log(`[EMIT] sensor-update → user-${userId}: ${msg}`);
        io.to(`user-${userId}`).emit("sensor-update", {
          sensorType: "humidity",
          value,
          msg,
          isOverThreshold,
        });
=======
      //if (!currentState[userId] || currentState[userId] !== "HIGH") {
      currentState[userId] = "HIGH";
      await sendNotification(userId, msg, "CAO");
      io.to(`user-${userId}`).emit("sensor-update", {
        sensorType: "humidity",
        value,
        msg,
        isOverThreshold,
      });
      if (hangClotheStatus === "ON") {
>>>>>>> BE_SERVER
        adafruitService.client.publish(
          `${process.env.ADAFRUIT_USERNAME}/feeds/button-hang-clothe`,
          "OFF",
          (err) => {
            if (err) {
              console.error("Lỗi khi publish OFF cho button-hang-clothe:", err);
            } else {
              console.log("Đã publish OFF cho button-hang-clothe");
            }
          }
        );
      }
      //}
    } else if (value < low) {
      isOverThreshold = true;
      msg = `Độ ẩm dưới ngưỡng (${value}% so với ${low}%)!`;
      //if (!currentState[userId] || currentState[userId] !== "LOW") {
      currentState[userId] = "LOW";
      await sendNotification(userId, msg, "THẤP");
      io.to(`user-${userId}`).emit("sensor-update", {
        sensorType: "humidity",
        value,
        msg,
        isOverThreshold,
      });
      if (hangClotheStatus === "ON") {
        adafruitService.client.publish(
          `${process.env.ADAFRUIT_USERNAME}/feeds/button-hang-clothe`,
          "OFF",
          (err) => {
            if (err) {
              console.error("Lỗi khi publish OFF cho button-hang-clothe:", err);
            } else {
              console.log("Đã publish OFF cho button-hang-clothe");
            }
          }
        );
      }
      //}
    } else {
      //if (currentState[userId] && currentState[userId] !== "NORMAL") {
      msg = `Độ ẩm ổn định: ${value}%.`;
      currentState[userId] = "NORMAL";
      // await sendNotification(userId, msg);
      // io.to(`user-${userId}`).emit("sensor-update", {
      //   sensorType: "humidity",
      //   value,
      //   msg,
      //   isOverThreshold,
      // });
      if (hangClotheStatus === "OFF") {
        adafruitService.client.publish(
          `${process.env.ADAFRUIT_USERNAME}/feeds/button-hang-clothe`,
          "ON",
          (err) => {
            if (err) {
              console.error("Lỗi khi publish ON cho button-hang-clothe:", err);
            } else {
              console.log("Đã publish ON cho button-hang-clothe");
            }
          }
        );
      }
      //}
    }
  }
};

export default { checkHumidity };
