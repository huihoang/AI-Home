import mqttClient from "../utils/adafruitService.js";

const updatedVoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Xác định feed tương ứng với lệnh
    let targetFeed;
    let payload;
    
    if (status.includes('bật đèn') || status.includes('tắt đèn')) {
      targetFeed = 'led-control';
      payload = status.includes('bật đèn') ? '1' : '0';
    } 
    else if (status.includes('bật quạt') || status.includes('tắt quạt')) {
      targetFeed = 'fan-control';
      payload = status.includes('bật quạt') ? 'ON' : 'OFF';
      
      // Xử lý tốc độ quạt nếu có
      const fanLevelMatch = status.match(/quạt mức (\d)/);
      if (fanLevelMatch) {
        const level = parseInt(fanLevelMatch[1]);
        if (level >= 1 && level <= 4) {
          await publishToFeed('fan-speed', level.toString());
        }
      }
    }
    else if (status.includes('mở cửa') || status.includes('đóng cửa')) {
      targetFeed = 'door-control';
      payload = status.includes('mở cửa') ? 'OPEN' : 'CLOSE';
    }
    
    if (targetFeed) {
      await publishToFeed(targetFeed, payload);
      await publishToFeed('log-voice', `Command: ${status}`);
      
      return res.json({
        success: true,
        message: `Đã gửi lệnh ${status} đến thiết bị`,
        device: targetFeed.split('-')[0],
        deviceStatus: payload
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Không nhận diện được lệnh điều khiển thiết bị'
    });
    
  } catch (error) {
    console.error("Lỗi khi xử lý lệnh thoại:", error);
    return res.status(500).json({ 
      success: false,
      message: "Lỗi hệ thống khi xử lý lệnh thoại" 
    });
  }
};

// Hàm helper để publish dữ liệu
const publishToFeed = (feedName, value) => {
  return new Promise((resolve, reject) => {
    mqttClient.client.publish(
      `${process.env.ADAFRUIT_USERNAME}/feeds/${feedName}`,
      value,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

export default { updatedVoiceStatus };