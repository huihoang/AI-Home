import express from "express";
import ledController from "../controllers/led.controller.js";

const router = express.Router();

router.post("/update-status", ledController.updatedLedStatus);

export default router;
