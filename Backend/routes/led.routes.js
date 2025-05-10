import express from "express";
import ledController from "../controllers/led.controller.js";
import temperatureController from "../controllers/temperature.controller.js";
const router = express.Router();

router.post("/update-status", ledController.updatedLedStatus);
router.get("/status", temperatureController.checkTemperature);
router.post("/temp", temperatureController.updatedTemperature);
export default router;
