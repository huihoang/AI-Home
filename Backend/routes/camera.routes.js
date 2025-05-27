import express from "express";
import cameraController from "../controllers/camera.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/update-status", auth, cameraController.updateCameraStatus);

export default router;
