import express from "express";
import temperatureController from "../controllers/temperature.controller.js";
import humidityController from "../controllers/humidity.controller.js";
import brightController from "../controllers/bright.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.get("/temperature/status", temperatureController.checkTemperature);
router.get("/humidity/status", humidityController.checkHumidity);
router.get("/bright/status", brightController.checkBright);
export default router;
