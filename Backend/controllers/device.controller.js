import mongoose from "mongoose";
import Device from "../models/device.model.js"; // Cần thêm .js
import Sensor from "../models/sensors.model.js";
import logService from "../utils/log.service.js";

/**
 * Tạo thiết bị mới
 */
const createDevice = async (req, res) => {
  try {
    const { name, type, location, status, user_id } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!name || !type) {
      return res.status(400).json({ message: "Device name and type are required" });
    }

    // Tạo thiết bị mới
    const device = new Device({
      name,
      type,
      location: location || "Unknown",
      status: status || "offline",
      user_id: user_id || req.user.user_id 
    });
    await logService.createLog(
      `Add_device`,
      `Divide ${name} have added by user ${req.user.user_id} `
    )
    const savedDevice = await device.save();
    
    res.status(201).json({
      message: "Device created successfully",
      device: savedDevice
    });
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({
      message: 'Failed to create device',
      error: error.message
    });
  }
};

/**
 * Lấy tất cả thiết bị
 */
const getAllDevices = async (req, res) => {
  try {
    // Lọc theo người dùng nếu cần
    const filter = {};
    
    // Nếu không phải admin, chỉ lấy thiết bị của người dùng hiện tại
    if (!req.user.isAdmin) {
      filter.user_id = req.user.user_id;
    }
    
    // Lấy các thiết bị có phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Thêm các tùy chọn lọc khác
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.location) filter.location = req.query.location;
    
    // Đếm tổng số thiết bị
    const total = await Device.countDocuments(filter);
    
    // Lấy danh sách thiết bị
    const devices = await Device.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id', 'username email');
    
    res.status(200).json({
      message: "Devices retrieved successfully",
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      devices
    });
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({
      message: 'Failed to get devices',
      error: error.message
    });
  }
};

/**
 * Lấy thiết bị theo ID
 */
const getDeviceById = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }
    
    const device = await Device.findById(deviceId)
      .populate('user_id', 'username email');
    
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    // Kiểm tra quyền truy cập (nếu không phải admin)
    if (!req.user.isAdmin && device.user_id.toString() !== req.user.user_id.toString()) {
      return res.status(403).json({ message: "You don't have permission to access this device" });
    }
    
    res.status(200).json({
      message: "Device retrieved successfully",
      device
    });
  } catch (error) {
    console.error('Error getting device:', error);
    res.status(500).json({
      message: 'Failed to get device',
      error: error.message
    });
  }
};

/**
 * Cập nhật thiết bị
 */
const updateDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { name, type, location, status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }
    
    // Tìm thiết bị cần cập nhật
    const device = await Device.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    // Kiểm tra quyền cập nhật (nếu không phải admin)
    if (!req.user.isAdmin && device.user_id.toString() !== req.user.user_id.toString()) {
      return res.status(403).json({ message: "You don't have permission to update this device" });
    }
    
    // Cập nhật các trường
    if (name) device.name = name;
    if (type) device.type = type;
    if (location) device.location = location;
    if (status) device.status = status;
    
    const updatedDevice = await device.save();
    await logService.createLog(
      `Update_device`,
      `Divide ${name} have updated by user ${req.user.user_id} `
    )
    
    res.status(200).json({
      message: "Device updated successfully",
      device: updatedDevice
    });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({
      message: 'Failed to update device',
      error: error.message
    });
  }
};

/**
 * Xóa thiết bị
 */
const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }
    
    // Tìm thiết bị cần xóa
    const device = await Device.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    // Kiểm tra quyền xóa (nếu không phải admin)
    if (!req.user.isAdmin && device.user_id.toString() !== req.user.user_id.toString()) {
      return res.status(403).json({ message: "You don't have permission to delete this device" });
    }
    
    // Xóa tất cả cảm biến liên quan
    await Sensor.deleteMany({ device_id: deviceId });
    
    // Xóa thiết bị
    await Device.findByIdAndDelete(deviceId);
    await logService.createLog(
      `Add_device`,
      `Divide ${x} have added by user ${req.user.user_id} `
    )
    res.status(200).json({
      message: "Device and associated sensors deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({
      message: 'Failed to delete device',
      error: error.message
    });
  }
};

/**
 * Lấy tất cả cảm biến của thiết bị
 */
const getDeviceSensors = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }
    
    // Tìm thiết bị
    const device = await Device.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    // Kiểm tra quyền truy cập (nếu không phải admin)
    if (!req.user.isAdmin && device.user_id.toString() !== req.user.user_id.toString()) {
      return res.status(403).json({ message: "You don't have permission to access this device's sensors" });
    }
    
    // Lấy tất cả cảm biến của thiết bị
    const sensors = await Sensor.find({ device_id: deviceId });
    
    res.status(200).json({
      message: "Device sensors retrieved successfully",
      deviceName: device.name,
      sensors
    });
  } catch (error) {
    console.error('Error getting device sensors:', error);
    res.status(500).json({
      message: 'Failed to get device sensors',
      error: error.message
    });
  }
};

/**
 * Thêm cảm biến vào thiết bị
 */
const addSensorToDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { name, type, unit, sensorId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }
    
    // Tìm thiết bị
    const device = await Device.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    // Kiểm tra quyền (nếu không phải admin)
    if (!req.user.isAdmin && device.user_id.toString() !== req.user.user_id.toString()) {
      return res.status(403).json({ message: "You don't have permission to add sensors to this device" });
    }
    
    // Tạo cảm biến mới
    const sensor = new Sensor({
      name,
      type,
      unit: unit || '',
      sensor_id: sensorId || `${device.name.toLowerCase().replace(/\s+/g, '-')}-${type}-${Date.now()}`,
      device_id: deviceId,
      user_id: device.user_id
    });
    
    const savedSensor = await sensor.save();
    
    res.status(201).json({
      message: "Sensor added to device successfully",
      sensor: savedSensor
    });
  } catch (error) {
    console.error('Error adding sensor to device:', error);
    res.status(500).json({
      message: 'Failed to add sensor to device',
      error: error.message
    });
  }
};

/**
 * Cập nhật trạng thái thiết bị
 */
const updateDeviceStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }
    
    if (!status || !['online', 'offline', 'maintenance', 'error'].includes(status)) {
      return res.status(400).json({ message: "Valid status is required (online, offline, maintenance, error)" });
    }
    
    // Tìm thiết bị
    const device = await Device.findById(deviceId);
    
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    // Cập nhật trạng thái
    device.status = status;
    device.last_online = status === 'online' ? new Date() : device.last_online;
    
    const updatedDevice = await device.save();
    
    res.status(200).json({
      message: "Device status updated successfully",
      device: updatedDevice
    });
  } catch (error) {
    console.error('Error updating device status:', error);
    res.status(500).json({
      message: 'Failed to update device status',
      error: error.message
    });
  }
};

/**
 * Lấy thiết bị theo người dùng
 */
const getDevicesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Kiểm tra quyền (nếu không phải admin hoặc chủ sở hữu)
    if (!req.user.isAdmin && userId !== req.user.user_id.toString()) {
      return res.status(403).json({ message: "You don't have permission to view these devices" });
    }
    
    const devices = await Device.find({ user_id: userId });
    
    res.status(200).json({
      message: "User's devices retrieved successfully",
      devices
    });
  } catch (error) {
    console.error('Error getting user devices:', error);
    res.status(500).json({
      message: 'Failed to get user devices',
      error: error.message
    });
  }
};

/**
 * Tổng hợp thông tin thiết bị
 */
const getDeviceStats = async (req, res) => {
  try {
    // Lọc theo người dùng nếu cần
    const filter = {};
    
    if (!req.user.isAdmin) {
      filter.user_id = req.user.user_id;
    }
    
    // Đếm thiết bị theo trạng thái
    const statusStats = await Device.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Đếm thiết bị theo loại
    const typeStats = await Device.aggregate([
      { $match: filter },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    
    // Đếm tổng số thiết bị
    const totalDevices = await Device.countDocuments(filter);
    
    // Đếm tổng số cảm biến liên kết
    const totalSensors = await Sensor.countDocuments(
      !req.user.isAdmin ? { user_id: req.user.user_id } : {}
    );
    
    res.status(200).json({
      message: "Device statistics retrieved successfully",
      totalDevices,
      totalSensors,
      byStatus: statusStats,
      byType: typeStats
    });
  } catch (error) {
    console.error('Error getting device stats:', error);
    res.status(500).json({
      message: 'Failed to get device statistics',
      error: error.message
    });
  }
};

export default {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
  getDeviceSensors,
  addSensorToDevice,
  updateDeviceStatus,
  getDevicesByUser,
  getDeviceStats
};