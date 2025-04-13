import mqttClient from "../utils/adafruitService.js";

const checkTemperature = async (req, res) => {
  let ledStatus = "OFF";
  try {
    mqttClient.client.on("message", (topic, message) => {
      if (topic.includes("bbc-temp")) {
        console.log("OK");
        const temperature = parseFloat(message.toString());
        console.log(`Nhiệt độ nhận được: ${temperature}`);

        // Kiểm tra ngưỡng an toàn
        const safeThreshold = 37; // Ngưỡng nhiệt độ an toàn
        if (temperature > safeThreshold) {
          console.log("Nhiệt độ vượt ngưỡng an toàn! Bật LED.");
          ledStatus = "ON";
          mqttClient.client.publish(
            `${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.bbc-led`,
            "ON"
          );
        } else {
          console.log("Nhiệt độ trong ngưỡng an toàn");
          ledStatus = "OFF";
          mqttClient.client.publish(
            `${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.bbc-led`,
            "OFF"
          );
        }
      }
    });

    res.json({ status: ledStatus });
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái LED:", error);
    res.status(500).json({ message: "Không thể lấy trạng thái LED." });
  }
};

const updatedTemperature = async (req, res) => {
  try {
    const { value } = req.body;

    // Publish trạng thái lên Adafruit IO
    await new Promise((resolve, reject) => {
      mqttClient.client.publish(
        `${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.bbc-temp`,
        value,
        (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        }
      );
    });

    console.log(`Đã gửi trạng thái ${value} lên Adafruit IO.`);
    return res.json({
      message: `Trạng thái ${value} đã được gửi thành công!`,
    });
  } catch (error) {
    console.error("Lỗi khi gửi dữ liệu đến Adafruit IO:", error);
    return res
      .status(500)
      .json({ message: "Không thể gửi trạng thái lên Adafruit IO." });
  }
};

export default { checkTemperature, updatedTemperature };
