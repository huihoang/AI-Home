import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import auth from "../middleware/auth.js"
const router = express.Router();
router.get("/",auth, notificationController.getAllNotifications);
router.delete("/",auth,  notificationController.deleteAllNotifications)

export default router