import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import { initializeSocket } from "./middleware/socket.js";
dotenv.config();
import connectDB from "./config/db.js";
import router from "./routes/routes.js";
import voiceRoutes from "./routes/voice.routes.js";
import handleSensor from "./utils/handleSensor.js";
import feedController from './controllers/feed.controller.js';
import User from './models/users.model.js'; 

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan());
app.use(router);
app.use((req, res, next) => {
  req.io = io;
  next();
});

handleSensor.initSensorHandling();
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const syncFeedsAutomatically = async () => {
  try {
    // Find a default user (could be the admin or a system user)
    // You might want to create a dedicated system user for this purpose
    const defaultUser = await User.findOne({ role: 'admin' }); // Or another query to find your default user
    
    if (!defaultUser) {
      console.error('No default user found for automatic syncing');
      return;
    }

    // Create a mock request object with user authentication
    const mockReq = {
      user: {
        user_id: defaultUser._id
      }
    };

    // Create a mock response object
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 200) {
            console.log(`✅ Auto sync completed at ${new Date().toLocaleTimeString()}`);
          } else {
            console.error(`❌ Auto sync failed with code ${code}:`, data);
          }
        }
      })
    };

    // Call the syncAllFeeds function
    await feedController.syncAllFeeds(mockReq, mockRes);
  } catch (error) {
    console.error('Error in automatic feed sync:', error);
  }
};

setInterval(syncFeedsAutomatically, 300000);

console.log('🔄 Automatic feed syncing enabled (every 5 minutes)');