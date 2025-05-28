import axios from "axios";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";
import mqttClient from "../utils/adafruitService.js";
const checkBright = async (req, res) => {
  let isOverThreshold = false;
  let msg = "";
  let bright = -1;
  try {
    const userId = req.query.user_id;
    // const userId = "67d8458df526a4418561a65d";
    const userConfig = await UserConfig.findOne({ user_id: userId });
    if (!userConfig) return;
    const { high, low } = userConfig.thresholds.brightness;
    mqttClient.client.on("message", async (topic, message) => {
      if (topic.includes("sensor-light")) {
        bright = parseFloat(message.toString());
      }
    });
    if (bright > high) {
      console.log("Ánh sáng vượt ngưỡng!");
      isOverThreshold = true;
      msg = `Ánh sáng vượt ngưỡng cho phép (${bright}% - so với ngưỡng${high}%)!`;
      const notification = new Notification({
        user_id: userConfig.user_id,
        message: msg,
        status: "unread",
      });
      await notification.save();
    } else if (bright < low && bright > 0) {
      console.log("Ánh sáng dưới ngưỡng!");
      isOverThreshold = true;
      msg = `Ánh sáng dưới ngưỡng cho phép (${low}% - so với ngưỡng${bright})!`;
      const notification = new Notification({
        user_id: userConfig.user_id,
        message: msg,
        status: "unread",
      });
      await notification.save();
    } else {
      console.log("Ánh sáng ở ngưỡng an toàn");
    }
    res.json({ isOverThreshold: isOverThreshold, msg: msg, bright: bright });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ Adafruit IO:", error);
    res.status(500).json({ message: "Không thể lấy trạng thái nhiệt độ." });
  }
};

export default { checkBright };
