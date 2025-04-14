import express from "express";
import ledController from "../controllers/led.controller.js";
import temperatureController from "../controllers/temperature.controller.js";
const router = express.Router();

router.post("/update-status", ledController.updatedLedStatus);
router.get("/status", temperatureController.checkTemperature);
router.post("/temp", temperatureController.updatedTemperature);
router.post('/', (req, res) => {
    console.log("POST /api/led", req.body);
    const { status } = req.body;
    res.json({ success: true, status });
});
    
export default router;
