import express from "express";
import fanController from "../controllers/fan.controller.js";

const router = express.Router();

router.post("/update-status", fanController.updatedFanStatus);
router.post('/', (req, res) => {
    const { status } = req.body;
    // tương tự xử lý
    res.json({ success: true, status });
  });
export default router;
