import express from 'express';
import feedController from '../controllers/feed.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Lưu ý: Các route cụ thể phải đặt trước route với tham số động (:feedKey)
// Nếu không, Express sẽ hiểu '/latest/all' là một tham số của ':feedKey'

// Lấy dữ liệu feed mới nhất (tất cả các feed)
router.get('/latest/all', auth, feedController.getLatestFeedData);

// Lấy dữ liệu feed mới nhất cho một feed cụ thể
router.get('/latest/:feedKey', auth, feedController.getLatestOneFeedData);

// Lấy thống kê feed
router.get('/stats/all', auth, feedController.getFeedStats);

// Lấy dữ liệu feed (với phân trang và lọc)
router.get('/:feedKey', auth, feedController.getFeedData);

// Đồng bộ dữ liệu từ Adafruit IO
router.post('/sync/:feedKey', auth, feedController.syncFeedData);

// Đồng bộ tất cả feed
router.post('/sync', auth, feedController.syncAllFeeds);

// Xóa dữ liệu cũ
router.delete('/cleanup', auth, feedController.cleanupOldData);

export default router;