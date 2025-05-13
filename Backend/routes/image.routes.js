import express from 'express';
import imageController from '../controllers/image.controller.js';
import auth  from '../middleware/auth.js';

const router = express.Router();

// Lấy tất cả hình ảnh (có phân trang)
router.get('/', auth, imageController.getAllImages);

// Lấy danh sách các loại phân loại
router.get('/classifications', auth, imageController.getClassifications);

// Lấy hình ảnh theo phân loại
router.get('/classification/:classification', auth, imageController.getImagesByClassification);

// Lấy hình ảnh theo ID
router.get('/:id', auth, imageController.getImageById);

// Thêm hình ảnh mới
router.post('/', auth, imageController.addImage);

// Xóa hình ảnh
router.delete('/:id', auth, imageController.deleteImage);

export default router;