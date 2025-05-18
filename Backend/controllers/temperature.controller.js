import mqttClient from "../utils/adafruitService.js";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";
const checkTemperature = async (req, res) => {
  let isOverThreshold = false;
  let msg = "";
  try {
    mqttClient.client.on("message", async (topic, message) => {
      if (topic.includes("sensor-temperature")) {
        const temperature = parseFloat(message.toString());
        const userId = req.query.user_id;
        // const userId = "67d8458df526a4418561a65d";
        const userConfig = await UserConfig.findOne({ user_id: userId });
        if (!userConfig) return;

        const { high, low } = userConfig.thresholds.temperature;
        console.log("high, low: ", high, low);
        if (temperature > high) {
          console.log("Nhiệt độ vượt ngưỡng!");
          isOverThreshold = true;
          msg = `Nhiệt độ vượt ngưỡng (${temperature}-${high}°C)!`;

          const notification = new Notification({
            user_id: userConfig.user_id,
            message: msg,
            status: "unread",
          });
          await notification.save();
        } else if (temperature < low) {
          console.log("Nhiệt độ dưới ngưỡng! Gửi thông báo...");
          isOverThreshold = true;
          msg = `Nhiệt độ dưới ngưỡng (${low}-${temperature}°C)!`;

          const notification = new Notification({
            user_id: userConfig.user_id,
            message: msg,
            status: "unread",
          });
          await notification.save();
        } else {
          console.log("Nhiệt độ ở ngưỡng an toàn");
        }
      }
    });
    res.json({ isOverThreshold: isOverThreshold, msg: msg });
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái:", error);
    res.status(500).json({ message: "Không thể lấy trạng thá." });
  }
};

export default { checkTemperature };
