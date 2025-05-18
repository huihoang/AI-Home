import express from "express";
import hangClotheController from "../controllers/hangCloth.conrtroller.js";

const router = express.Router();

router.post("/update-status", hangClotheController.updatedHangCloth);

export default router;
