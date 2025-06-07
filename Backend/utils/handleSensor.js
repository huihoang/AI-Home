import humidityController from "../controllers/humidity.controller.js";
import temperatureController from "../controllers/temperature.controller.js";
import brightnessController from "../controllers/bright.controller.js";

const initSensorHandling = () => {
  setInterval(async () => {
    try {
      await humidityController.checkHumidity();
    } catch (error) {
      console.error("Lỗi khi xử lý độ ẩm:", error);
    }
    try {
      await temperatureController.checkTemperature();
    } catch (error) {
      console.error("Lỗi khi xử lý nhiệt độ:", error);
    }
    try {
      await brightnessController.checkBright();
    } catch (error) {
      console.error("Lỗi khi xử lý độ sáng:", error);
    }
  }, 10000);
};

export default { initSensorHandling };
