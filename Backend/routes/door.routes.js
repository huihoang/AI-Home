import express from "express";
import doorController from "../controllers/door.controller.js";

const router = express.Router();

router.post("/update-status", doorController.updatedDoorStatus);

export default router;
