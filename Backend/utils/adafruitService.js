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
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button-door`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button-fan`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button-hang-clothe`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/button-led`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor-camera`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor-humidity`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor-light`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor-motion`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/sensor-temperature`);
});


export default { client };
