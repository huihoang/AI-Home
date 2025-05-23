import express from "express";
import userRoutes from "../routes/user.routes.js";
import deviceRoutes from "../routes/device.routes.js";
import sensorRoutes from "../routes/sensor.routes.js";
import feedRoutes from "../routes/feed.routes.js";
import ledRoutes from "./led.routes.js";
import fanRoutes from "./fan.routes.js";
import hangClothRoutes from "./hangClothe.routes.js";
import userConfig from "./userConfig.routes.js"
import imageRoutes from "./image.routes.js"
import voiceRoutes from './voice.routes.js';
// import mqttClient from "../utils/adafruitService.js";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/devices", deviceRoutes);
router.use("/sensors", sensorRoutes);
router.use("/feeds", feedRoutes);
router.use("/led", ledRoutes);
router.use("/fan", fanRoutes);
router.use("/hangclothe", hangClothRoutes);
router.use("/config", userConfig)
router.use("/voice", voiceRoutes);
router.use("/images",imageRoutes)
export default router;
