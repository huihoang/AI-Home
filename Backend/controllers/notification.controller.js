import Notification from "../models/notification.model.js";

const getAllNotificationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ user_id: userId }).sort({
      time: -1,
    });

    res.json({ notifications });
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error);
    res.status(500).json({ message: "Không thể lấy thông báo." });
  }
};

export default { getAllNotificationByUserId };
