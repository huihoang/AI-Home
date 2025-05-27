import axios from "axios";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";
import mqttClient from "../utils/adafruitService.js";
const checkHumidity = async (req, res) => {
  let isOverThreshold = false;
  let msg = "";

  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "Thiếu user_id trong request. Vui lòng đăng nhập" });
    }

    const response = await axios.get(
      "https://io.adafruit.com/api/v2/hoangbk4/feeds/sensor-humidity/data"
    );

    const latestData = response.data[0];
    const humidity = parseFloat(latestData.value);
    console.log(`Độ ẩm hiện tại: ${humidity}°C`);
    const hangClotheStatus = await axios.get(
      "https://io.adafruit.com/api/v2/hoangbk4/feeds/button-hang-clothe/data"
    );

    const statusLastData = hangClotheStatus.data[0].value;
    console.log(typeof statusLastData, statusLastData);

    // Lấy ngưỡng nhiệt độ từ database
    const userConfig = await UserConfig.findOne({ user_id: userId });
    if (!userConfig) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cấu hình người dùng." });
    }

    const { high, low } = userConfig.thresholds.humidity;

    console.log(`Ngưỡng độ ẩm: Cao (${high}%) - Thấp (${low}%)`);

    if (humidity > high && statusLastData == "ON") {
      console.log("Độ ẩm vượt ngưỡng!");
      isOverThreshold = true;
      msg = `Độ ẩm vượt ngưỡng (${humidity}% so với cấu hình người dùng ${high}%)!`;

      //Lưu thông báo vào database
      // const notification = new Notification({
      //   user_id: userConfig.user_id,
      //   message: msg,
      //   status: "unread",
      // });
      // await notification.save();
      mqttClient.client.publish(
        `${process.env.ADAFRUIT_USERNAME}/feeds/button-hang-clothe`,
        "OFF"
      );
    } else if (humidity < low && statusLastData == "ON") {
      console.log("Độ ẩm dưới ngưỡng!");
      isOverThreshold = true;
      msg = `Độ ẩm dưới ngưỡng (${humidity}% so với cấu hình người dùng ${low}%)!`;

      // Lưu thông báo vào database
      // const notification = new Notification({
      //   user_id: userConfig.user_id,
      //   message: msg,
      //   status: "unread",
      // });
      // await notification.save();
      mqttClient.client.publish(
        `${process.env.ADAFRUIT_USERNAME}/feeds/button-hang-clothe`,
        "OFF"
      );
    } else {
      console.log("Độ ẩm ở ngưỡng an toàn.");
    }

    res.json({ isOverThreshold, msg });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ Adafruit IO:", error);
    res.status(500).json({ message: "Không thể lấy trạng thái nhiệt độ." });
  }
};

export default { checkHumidity };
