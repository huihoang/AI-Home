import express from 'express';
import deviceController from '../controllers/device.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Lấy tất cả thiết bị
router.get('/', auth, deviceController.getAllDevices);

// Lấy thống kê thiết bị
router.get('/stats', auth, deviceController.getDeviceStats);

// Lấy thiết bị theo ID
router.get('/:deviceId', auth, deviceController.getDeviceById);

// Lấy thiết bị của một người dùng cụ thể
router.get('/user/:userId', auth, deviceController.getDevicesByUser);

// Lấy tất cả cảm biến của thiết bị
router.get('/:deviceId/sensors', auth, deviceController.getDeviceSensors);

// Tạo thiết bị mới
router.post('/', auth, deviceController.createDevice);

// Thêm cảm biến vào thiết bị
router.post('/:deviceId/sensors', auth, deviceController.addSensorToDevice);

// Cập nhật thiết bị
router.put('/:deviceId', auth, deviceController.updateDevice);

// Cập nhật trạng thái thiết bị
router.put('/:deviceId/status', auth, deviceController.updateDeviceStatus);

// Xóa thiết bị
router.delete('/:deviceId', auth, deviceController.deleteDevice);

export default router;