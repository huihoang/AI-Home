import axios from "axios";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";
import { getIO } from "../middleware/socket.js";

let lastThresholdState = {};

const checkTemperature = async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu user_id trong request." });
    }

    // Lấy dữ liệu nhiệt độ mới nhất từ API Adafruit IO
    const response = await axios.get(
      "https://io.adafruit.com/api/v2/hoangbk4/feeds/sensor-temperature/data"
    );
    const latestData = response.data[0];
    const temperature = parseFloat(latestData.value);

    console.log(`Nhiệt độ hiện tại: ${temperature}°C`);

    const userConfig = await UserConfig.findOne({ user_id: userId });
    if (!userConfig) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cấu hình người dùng." });
    }

    const { high, low } = userConfig.thresholds.temperature;

    console.log(`Ngưỡng nhiệt độ: Cao (${high}°C) - Thấp (${low}°C)`);

    let isOverThreshold = false;
    let msg = "";

    // Kiểm tra trạng thái trước đó
    if (!lastThresholdState[userId]) {
      lastThresholdState[userId] = "NORMAL";
    }

    if (temperature > high && lastThresholdState[userId] !== "HIGH") {
      console.log("Nhiệt độ vượt ngưỡng! Gửi thông báo...");
      isOverThreshold = true;
      msg = `Nhiệt độ vượt ngưỡng (${temperature}°C - Cao ${high}°C)!`;

      lastThresholdState[userId] = "HIGH";
    } else if (temperature < low && lastThresholdState[userId] !== "LOW") {
      console.log("Nhiệt độ dưới ngưỡng! Gửi thông báo...");
      isOverThreshold = true;
      msg = `Nhiệt độ dưới ngưỡng (${temperature}°C - Thấp ${low}°C)!`;

      lastThresholdState[userId] = "LOW";
    } else if (
      temperature >= low &&
      temperature <= high &&
      lastThresholdState[userId] !== "NORMAL"
    ) {
      console.log("Nhiệt độ trở lại bình thường.");
      msg = `Nhiệt độ ổn định ở mức ${temperature}°C.`;
      lastThresholdState[userId] = "NORMAL";
    }

    // Gửi thông báo qua WebSocket
    const io = getIO();
    io.to(`user-${userId}`).emit("new-notification", {
      isOverThreshold,
      msg,
      temperature,
    });

    res.json({ isOverThreshold, msg, temperature });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ Adafruit IO:", error);
    res.status(500).json({ message: "Không thể lấy trạng thái nhiệt độ." });
  }
};

export default { checkTemperature };
