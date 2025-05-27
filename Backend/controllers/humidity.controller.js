import mqttClient from "../utils/adafruitService.js";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";
const checkHumidity = async (req, res) => {
  let isOverThreshold = false;
  let msg = "";
  try {
    mqttClient.client.on("message", async (topic, message) => {
      if (topic.includes("sensor-humidity")) {
        const humidity = parseFloat(message.toString());
        const userId = req.query.user_id;
        // const userId = "67d8458df526a4418561a65d";
        const userConfig = await UserConfig.findOne({ user_id: userId });
        if (!userConfig) return;

        const { high, low } = userConfig.thresholds.humidity;
        console.log("high, low: ", high, low);
        if (humidity > high) {
          console.log("Độ ẩm vượt ngưỡng!");
          isOverThreshold = true;
          msg = `Độ ẩm vượt ngưỡng (${humidity}-${high}%)!`;
          const notification = new Notification({
            user_id: userConfig.user_id,
            message: msg,
            status: "unread",
          });
          await notification.save();
          mqttClient.client.publish(
            `${process.env.ADAFRUIT_USERNAME}/feeds/button-hang-clothe`,
            "OFF"
          );
        } else if (humidity < low) {
          console.log("Độ ẩm dưới ngưỡng!");
          isOverThreshold = true;
          msg = `Độ ẩm dưới ngưỡng (${low}-${humidity}%)!`;
          const notification = new Notification({
            user_id: userConfig.user_id,
            message: msg,
            status: "unread",
          });
          await notification.save();
          mqttClient.client.publish(
            `${process.env.ADAFRUIT_USERNAME}/feeds/button-hang-clothe`,
            "OFF"
          );
        } else {
          console.log("Độ ẩm ở ngưỡng an toàn");
        }
      }
    });
    res.json({ isOverThreshold: isOverThreshold, msg: msg });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).json({ message: "Không thể lấy dữ liệu" });
  }
};

export default { checkHumidity };
