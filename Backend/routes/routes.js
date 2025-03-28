import express from 'express';
import userRoutes from '../routes/user.routes.js';  
import deviceRoutes from '../routes/device.routes.js';
import sensorRoutes from '../routes/device.routes.js';
import feedRoutes from '../routes/feed.routes.js';     

const router = express.Router();

router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);
router.use('/sensors', sensorRoutes);
router.use('/feeds', feedRoutes);  
export default router;
