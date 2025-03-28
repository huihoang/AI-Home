import mongoose from "mongoose";
import Sensor from "../models/sensors.model.js";
import { getFeedModel } from "../utils/feed-models.js";

// Cấu hình Adafruit IO API
const ADAFRUIT_USERNAME = 'hoangbk4';
const BASE_URL = 'https://io.adafruit.com/api/v2';

/**
 * Đồng bộ dữ liệu từ một feed (với feedKey từ URL parameter)
 */
const syncFeedData = async (req, res) => {
  try {
    const { feedKey } = req.params;
    const limit = req.query.limit || 50;
    
    // Kiểm tra feed key hợp lệ
    const validFeeds = ['bbc-bright', 'bbc-camera', 'bbc-humidity', 'bbc-led', 'bbc-motion', 'bbc-temp'];
    if (!validFeeds.includes(feedKey)) {
      return res.status(400).json({ message: 'Invalid feed key' });
    }

    // Lấy model tương ứng với feed
    const FeedModel = getFeedModel(feedKey);

    // Lấy dữ liệu từ Adafruit IO
    const apiUrl = `${BASE_URL}/${ADAFRUIT_USERNAME}/feeds/${feedKey}/data`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log(`Received ${data.length} records from API`);
    
    const savedData = [];

    for (const item of data) {
      try {
        const existingData = await FeedModel.findOne({
          feed_id: item.id
        });

        if (!existingData) {
          const feedDataItem = new FeedModel({
            feed_id: item.id,
            value: item.value,
            created_epoch: new Date(item.created_at).getTime() / 1000,
            expiration: item.expiration ? new Date(item.expiration) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            create_at: new Date(item.created_at)
          });

          const saved = await feedDataItem.save();
          savedData.push(saved);
        }
      } catch (error) {
        console.log(`Error processing feed ${feedKey}:`, error);
      }
    }
    
    res.status(200).json({
      message: `Synced ${savedData.length} new records for feed ${feedKey}`,
      data: savedData
    });
  } catch (error) {
    console.error('Error syncing feed data:', error);
    res.status(500).json({
      message: 'Failed to sync feed data',
      error: error.message
    });
  }
};

/**
 * Lấy dữ liệu feed từ database
 */
const getFeedData = async (req, res) => {
  try {
    const { feedKey } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    
    // Nếu feedKey là 'all', cần truy vấn tất cả các collection
    if (feedKey === 'all') {
      // Trường hợp đặc biệt - lấy dữ liệu từ tất cả các feed
      const feeds = ['bbc-bright', 'bbc-camera', 'bbc-humidity', 'bbc-led', 'bbc-motion', 'bbc-temp'];
      const allData = {};
      
      for (const feed of feeds) {
        const FeedModel = getFeedModel(feed);
        const query = {};
        
        // Lọc theo khoảng thời gian
        if (req.query.startDate && req.query.endDate) {
          query.create_at = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
          };
        }

        const data = await FeedModel.find(query)
          .sort({ create_at: -1 })
          .limit(limit)
          .populate('sensor_id', 'name type location unit');
          
        allData[feed] = data;
      }
      
      return res.status(200).json({
        message: 'Data from all feeds',
        data: allData
      });
    }
    
    // Trường hợp thông thường - lấy dữ liệu từ một feed cụ thể
    const FeedModel = getFeedModel(feedKey);
    
    // Tạo các điều kiện lọc
    const query = {};
    
    // Lọc theo khoảng thời gian
    if (req.query.startDate && req.query.endDate) {
      query.create_at = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Đếm tổng số records
    const total = await FeedModel.countDocuments(query);

    // Lấy dữ liệu với phân trang
    const feedData = await FeedModel.find(query)
      .sort({ create_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sensor_id', 'name type location unit');
    
    res.status(200).json({
      total,
      count: feedData.length,
      page: Math.floor(skip / limit) + 1,
      limit,
      data: feedData
    });
  } catch (error) {
    console.error('Error getting feed data:', error);
    res.status(500).json({
      message: 'Failed to get feed data',
      error: error.message
    });
  }
};


const getLatestOneFeedData = async (req, res) => {
  try {
    const { feedKey } = req.params;
    
    // Kiểm tra feed key hợp lệ
    const validFeeds = ['bbc-bright', 'bbc-camera', 'bbc-humidity', 'bbc-led', 'bbc-motion', 'bbc-temp'];
    if (!validFeeds.includes(feedKey)) {
      return res.status(400).json({ message: 'Invalid feed key' });
    }
    
    const FeedModel = getFeedModel(feedKey);
    
    const data = await FeedModel.findOne()
      .sort({ create_at: -1 })
      .populate('sensor_id', 'name type location unit');
    
    if (!data) {
      return res.status(404).json({ message: `No data found for feed ${feedKey}` });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error getting latest data for feed ${req.params.feedKey}:`, error);
    res.status(500).json({
      message: `Failed to get latest data for feed ${req.params.feedKey}`,
      error: error.message
    });
  }
};

/**
 * Lấy dữ liệu feed mới nhất
 */
const getLatestFeedData = async (req, res) => {
  try {
    const feeds = [
      'bbc-bright', 
      'bbc-camera', 
      'bbc-humidity', 
      'bbc-led', 
      'bbc-motion', 
      'bbc-temp'
    ];
    
    const latestData = {};
    
    for (const feed of feeds) {
      const FeedModel = getFeedModel(feed);
      
      const data = await FeedModel.findOne()
        .sort({ create_at: -1 })
        .populate('sensor_id', 'name type location unit');
      
      if (data) {
        latestData[feed] = data;
      }
    }
    
    res.status(200).json(latestData);
  } catch (error) {
    console.error('Error getting latest feed data:', error);
    res.status(500).json({
      message: 'Failed to get latest feed data',
      error: error.message
    });
  }
};

/**
 * Lấy thống kê feed
 */
const getFeedStats = async (req, res) => {
  try {
    const feeds = [
      'bbc-bright', 
      'bbc-camera', 
      'bbc-humidity', 
      'bbc-led', 
      'bbc-motion', 
      'bbc-temp'
    ];
    
    const stats = {};
    let totalRecords = 0;
    
    for (const feed of feeds) {
      const FeedModel = getFeedModel(feed);
      
      // Đếm số lượng bản ghi
      const count = await FeedModel.countDocuments();
      
      // Lấy bản ghi đầu tiên và mới nhất
      const firstRecord = await FeedModel.findOne().sort({ create_at: 1 });
      const lastRecord = await FeedModel.findOne().sort({ create_at: -1 });
      
      // Tính giá trị min/max/avg nếu là dữ liệu số
      let minValue = null;
      let maxValue = null;
      let avgValue = null;
      
      if (['bbc-bright', 'bbc-humidity', 'bbc-temp'].includes(feed)) {
        const aggregateResult = await FeedModel.aggregate([
          {
            $group: {
              _id: null,
              minValue: { $min: { $toDouble: "$value" } },
              maxValue: { $max: { $toDouble: "$value" } },
              avgValue: { $avg: { $toDouble: "$value" } }
            }
          }
        ]);
        
        if (aggregateResult.length > 0) {
          minValue = aggregateResult[0].minValue;
          maxValue = aggregateResult[0].maxValue;
          avgValue = aggregateResult[0].avgValue;
        }
      }
      
      stats[feed] = {
        count,
        firstRecord: firstRecord ? firstRecord.create_at : null,
        lastRecord: lastRecord ? lastRecord.create_at : null,
        minValue,
        maxValue,
        avgValue
      };
      
      totalRecords += count;
    }
    
    res.status(200).json({
      total: totalRecords,
      feedStats: stats
    });
  } catch (error) {
    console.error('Error getting feed stats:', error);
    res.status(500).json({
      message: 'Failed to get feed statistics',
      error: error.message
    });
  }
};

/**
 * Đồng bộ tất cả feed
 */
const syncAllFeeds = async (req, res) => {
  try {
    const feeds = [
      'bbc-bright', 
      'bbc-camera', 
      'bbc-humidity', 
      'bbc-led', 
      'bbc-motion', 
      'bbc-temp'
    ];
    
    const results = {};
    
    for (const feed of feeds) {
      try {
        // Lấy model tương ứng với feed
        const FeedModel = getFeedModel(feed);
        
        // Lấy dữ liệu từ Adafruit IO
        const apiUrl = `${BASE_URL}/${ADAFRUIT_USERNAME}/feeds/${feed}/data`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        let newRecords = 0;
        
        // Lưu dữ liệu vào database
        for (const item of data) {
          // Kiểm tra xem dữ liệu đã tồn tại chưa
          const existingData = await FeedModel.findOne({
            feed_id: item.id
          });
          
          if (!existingData) {
            const feedDataItem = new FeedModel({
              feed_id: item.id,
              value: item.value,
              created_epoch: new Date(item.created_at).getTime() / 1000,
              expiration: item.expiration ? new Date(item.expiration) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              create_at: new Date(item.created_at)
            });
            
            await feedDataItem.save();
            newRecords++;
          }
        }
        
        results[feed] = {
          success: true,
          newRecords
        };
      } catch (error) {
        console.error(`Error processing feed ${feed}:`, error);
        results[feed] = {
          success: false,
          error: error.message
        };
      }
    }
    
    res.status(200).json({
      message: 'Sync completed',
      results
    });
  } catch (error) {
    console.error('Error syncing all feeds:', error);
    res.status(500).json({
      message: 'Failed to sync feeds',
      error: error.message
    });
  }
};

/**
 * Xóa dữ liệu cũ
 */
const cleanupOldData = async (req, res) => {
  try {
    const { days } = req.body;
    const daysToKeep = days || 30; 
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const feeds = [
      'bbc-bright', 
      'bbc-camera', 
      'bbc-humidity', 
      'bbc-led', 
      'bbc-motion', 
      'bbc-temp'
    ];
    
    const results = {};
    let totalDeleted = 0;
    
    for (const feed of feeds) {
      const FeedModel = getFeedModel(feed);
      
      const result = await FeedModel.deleteMany({
        create_at: { $lt: cutoffDate }
      });
      
      results[feed] = result.deletedCount;
      totalDeleted += result.deletedCount;
    }
    
    res.status(200).json({
      message: `Deleted ${totalDeleted} old records`,
      deletedCount: totalDeleted,
      details: results
    });
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    res.status(500).json({
      message: 'Failed to clean up old data',
      error: error.message
    });
  }
};

export default {
  syncFeedData,
  getFeedData,
  getLatestFeedData,
  getLatestOneFeedData, 
  getFeedStats,
  syncAllFeeds,
  cleanupOldData
};