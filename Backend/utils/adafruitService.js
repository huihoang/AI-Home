import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

const brokerUrl = "mqtt://io.adafruit.com";

const client = mqtt.connect(brokerUrl, {
  username: process.env.ADAFRUIT_USERNAME,
  password: process.env.AIO_KEY,
});

client.on("connect", () => {
  console.log("Kết nối thành công với Adafruit IO");
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button_door`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button_fan`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button_hang_clothe`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button_led`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor_camera`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor_humidity`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor_light`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor_motion`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor-temperature`);
});

export default { client };
