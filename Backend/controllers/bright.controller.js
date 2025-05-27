import axios from "axios";
import UserConfig from "../models/userConfig.model.js";
import Notification from "../models/notification.model.js";

const checkBright = async (req, res) => {
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
      "https://io.adafruit.com/api/v2/hoangbk4/feeds/sensor-light/data"
    );
    const latestData = response.data[0];
    const bright = parseFloat(latestData.value);

    console.log(`Ánh sáng hiện tại: ${bright}%`);

    // Lấy ngưỡng nhiệt độ từ database
    const userConfig = await UserConfig.findOne({ user_id: userId });
    if (!userConfig) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cấu hình người dùng." });
    }

    const { high, low } = userConfig.thresholds.brightness;

    console.log(`Ngưỡng ánh sáng: Cao (${high}%) - Thấp (${low}%)`);

    if (bright > high) {
      console.log("Ánh sáng vượt ngưỡng!");
      isOverThreshold = true;
      msg = `Ánh sáng vượt ngưỡng (${bright}% so với ngưỡng ${high}%)!`;

      // Lưu thông báo vào database
      // const notification = new Notification({
      //   user_id: userConfig.user_id,
      //   message: msg,
      //   status: "unread",
      // });
      await notification.save();
    } else if (bright < low) {
      console.log("Ánh sáng dưới ngưỡng!");
      isOverThreshold = true;
      msg = `Ánh sáng dưới ngưỡng (${bright}% so với ngưỡng ${low}%)!`;

      //Lưu thông báo vào database
      // const notification = new Notification({
      //   user_id: userConfig.user_id,
      //   message: msg,
      //   status: "unread",
      // });
      await notification.save();
    } else {
      console.log("Ánh sáng ở ngưỡng an toàn.");
    }

    res.json({ isOverThreshold, msg });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ Adafruit IO:", error);
    res.status(500).json({ message: "Không thể lấy trạng thái nhiệt độ." });
  }
};

export default { checkBright };
