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
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/set-led`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.bbc-motion`);
  client.subscribe(
    `${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.bbc-humidity`
  );
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.bbc-camera`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.bbc-temp`);
  client.subscribe(`${process.env.ADAFRUIT_USERNAME}/feeds/ai-home.bcc-fan`);
});

export default { client };
