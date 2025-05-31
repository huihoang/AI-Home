import mqttClient from "../utils/adafruitService.js";
import Device from "../models/device.model.js";
import Log from '../models/log.model.js';

const updatedVoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user_id = req.user.user_id;

    // Update infor lên server
    await new Promise((resolve, reject) => {
      mqttClient.client.publish(
        `${process.env.ADAFRUIT_USERNAME}/feeds/log-voice`,
        status,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // Tạo Promise chờ message đúng trong 10 giây
    let success = false;
    const { latestTopic, latestMessage } = await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        mqttClient.client.removeListener("message", messageHandler);
        resolve({
          latestTopic: "Không nhận được phản hồi",
          latestMessage: "Timeout sau 10 giây",
        });
      }, 10000);

      const messageHandler = async (topic, message) => {
        if (
          topic.includes("button-door") ||
          topic.includes("button-led") ||
          topic.includes("button-fan")
        ) {
          clearTimeout(timeout);
          mqttClient.client.removeListener("message", messageHandler);
          success = true;

          const latestTopic = topic.toString().split("/").at(-1);
          const latestMessage = message.toString().split("/").at(-1);

          const device = topic.split("-")[1];
          const device_id = await Device.findOne({
            user_id: user_id,
            type: device,
          }, { _id: 1 });

          await Log.create({
            event: "Voice control",
            message: `Nội dung nói: "${status}" -> Được hiểu là: "${latestTopic} ${latestMessage}"`,
            user_id: user_id,
            device_id: device_id,
          });

          resolve({ latestTopic, latestMessage });
        }
      };

      mqttClient.client.on("message", messageHandler);
    });

    return res.json({
      message: `Lệnh được hiểu từ giọng nói là: ${latestTopic} ${latestMessage}`,
      success: success,
      device: latestTopic.split("-")[1], // led/fan/door
      deviceStatus: latestMessage.toUpperCase() // ON/OFF
    });

  } catch (error) {
    console.error("Lỗi khi xử lý voice:", error);
    return res.status(500).json({ message: "Lỗi xử lý voice." });
  }
};

export default { updatedVoiceStatus };