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
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/bbc_led`);
  // client.subscribe(
  //   `${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.sensor-motion`
  // );
  // client.subscribe(
  //   `${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.sensor_humidity`
  // );
  // client.subscribe(
  //   `${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.sensor_camera`
  // );
  // client.subscribe(
  //   `${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.sensor_temperature`
  // );
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button-fan`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button_hang_clothe`);
});


export default { client };
