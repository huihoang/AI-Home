import axios from "axios";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";

const checkTemperature = async (req, res) => {
  let isOverThreshold = false;
  let msg = "";

  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu user_id trong request." });
    }

    const response = await axios.get(
      "https://io.adafruit.com/api/v2/hoangbk4/feeds/sensor-temperature/data"
    );
    const latestData = response.data[0];
    const temperature = parseFloat(latestData.value);

    // Lấy ngưỡng nhiệt độ từ database
    const userConfig = await UserConfig.findOne({ user_id: userId });
    if (!userConfig) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cấu hình người dùng." });
    }

    const { high, low } = userConfig.thresholds.temperature;

    if (temperature > high) {
      console.log("Nhiệt độ vượt ngưỡng!");
      isOverThreshold = true;
      msg = `Nhiệt độ vượt ngưỡng (${temperature}°C so với ngưỡng đã cấu hình ${high}°C)!`;

      // Lưu thông báo vào database
      // const notification = new Notification({
      //   user_id: userConfig.user_id,
      //   message: msg,
      //   status: "unread",
      // });
      // await notification.save();
    } else if (temperature < low) {
      console.log("Nhiệt độ dưới ngưỡng!");
      isOverThreshold = true;
      msg = `Nhiệt độ dưới ngưỡng (${temperature}°C so với ngưỡng đã cấu hình ${low}°C)!`;

      // Lưu thông báo vào database
      // const notification = new Notification({
      //   user_id: userConfig.user_id,
      //   message: msg,
      //   status: "unread",
      // });
      // await notification.save();
    } else {
      console.log("Nhiệt độ ở ngưỡng an toàn.");
    }

    res.json({ isOverThreshold, msg });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ Adafruit IO:", error);
    res.status(500).json({ message: "Không thể lấy trạng thái nhiệt độ." });
  }
};

export default { checkTemperature };
