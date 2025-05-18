import mqttClient from "../utils/adafruitService.js";

const updatedLedStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log(`status: ${typeof status}`);
    // Publish trạng thái lên Adafruit IO
    await new Promise((resolve, reject) => {
      mqttClient.client.publish(
        `${process.env.ADAFRUIT_USERNAME}/feeds/button-led`,
        status,
        (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        }
      );
    });

    console.log(`Đã gửi trạng thái đèn (${status}) lên Adafruit IO.`);
    return res.json({
      message: `Trạng thái đèn (${status}) đã được gửi thành công!`,
    });
  } catch (error) {
    console.error("Lỗi khi gửi dữ liệu đến Adafruit IO:", error);
    return res
      .status(500)
      .json({ message: "Không thể gửi trạng thái lên Adafruit IO." });
  }
};

export default { updatedLedStatus };
