import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import { initializeSocket } from "./middleware/socket.js";
dotenv.config();
import connectDB from "./config/db.js";
import router from "./routes/routes.js";
import voiceRoutes from "./routes/voice.routes.js";
import handleSensor from "./utils/handleSensor.js";
const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan());
app.use(router);
app.use((req, res, next) => {
  req.io = io;
  next();
});

handleSensor.initSensorHandling();
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
