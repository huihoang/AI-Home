import axios from "axios";
import mqttClient from "../utils/adafruitService.js";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";

const checkHumidity = async (req, res) => {
  let isOverThreshold = false;
  let msg = "";
  let humidity = -1;
  try {
    const userId = req.query.user_id;
    // const userId = "67d8458df526a4418561a65d";
    const userConfig = await UserConfig.findOne({ user_id: userId });
    if (!userConfig) return;

    const { high, low } = userConfig.thresholds.humidity;

    const hangClotheStatus = await axios.get(
      "https://io.adafruit.com/api/v2/hoangbk4/feeds/button-hang-clothe/data"
    );
    const statusLastData = hangClotheStatus.data[0].value;
    mqttClient.client.on("message", async (topic, message) => {
      if (topic.includes("sensor-humidity")) {
        humidity = parseFloat(message.toString());
      }
    });
    if (humidity > high && statusLastData == "ON") {
      console.log("Độ ẩm vượt ngưỡng!");
      isOverThreshold = true;
      msg = `Độ ẩm vượt ngưỡng ${humidity}% - so với ngưỡng ${high}%!`;

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
    } else if (humidity < low && statusLastData == "ON" && humidity > 0) {
      console.log("Độ ẩm dưới ngưỡng!");
      isOverThreshold = true;
      msg = `Độ ẩm dưới ngưỡng ${low}% - so với ngưỡng ${humidity}%!`;

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
    res.json({
      isOverThreshold: isOverThreshold,
      msg: msg,
      humidity: humidity,
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ Adafruit IO:", error);
    res.status(500).json({ message: "Không thể lấy trạng thái nhiệt độ." });
  }
};

export default { checkHumidity };
