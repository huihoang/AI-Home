import mqttClient from "../utils/adafruitService.js";
const checkHumidity = async (req, res) => {
  let ledStatus = "OFF";
  try {
    mqttClient.client.on("message", (topic, message) => {
      if (topic.includes("bbc-temp")) {
        const temperature = parseFloat(message.toString());
        console.log(`Độ ẩm nhận được: ${temperature}`);

        // Kiểm tra ngưỡng an toàn
        const safeThreshold = 35; // Ngưỡng nhiệt độ an toàn
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
