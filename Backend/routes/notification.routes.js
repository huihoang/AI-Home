import express from "express";
import notificationController from "../controllers/notification.controller.js";
const router = express.Router();

router.get(
  "/get-all/:userId",
  notificationController.getAllNotificationByUserId
);

export default router;
