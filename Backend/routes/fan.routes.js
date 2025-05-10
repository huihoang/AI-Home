import express from "express";
import fanController from "../controllers/fan.controller.js";

const router = express.Router();

router.post("/update-status", fanController.updatedFanStatus);

export default router;
