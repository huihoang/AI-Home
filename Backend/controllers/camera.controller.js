import mqttClient from "../utils/adafruitService.js";

const updateCameraStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log("Camera status:", status);

    await new Promise((resolve, reject) => {
      mqttClient.client.publish(
        `${process.env.ADAFRUIT_USERNAME}/feeds/bbc-camera`, // feed camera trên Adafruit
        status,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    console.log(`Đã gửi trạng thái camera (${status}) lên Adafruit IO.`);
    return res.json({ message: `Camera (${status}) đã được gửi thành công!` });
  } catch (error) {
    console.error("Lỗi khi gửi dữ liệu camera:", error);
    return res.status(500).json({ message: "Không thể gửi trạng thái camera lên Adafruit IO." });
  }
};

export default { updateCameraStatus };
