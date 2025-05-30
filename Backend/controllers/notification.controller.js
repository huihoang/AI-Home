import mongoose from "mongoose";
import Notification from "../models/notification.model.js";


const getAllNotifications = async (req, res) => {

    try {
        const userId = req.user.user_id;
        const filter = {user_id: userId};
    if (req.query.status) {
        filter.status = req.query.status;
    }

    const notifications = await Notification.find(filter)
            .sort({creatAt: -1});
    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    })
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            messsage: "cannot get notifications",
            error: error.messsage
        })
    }
    
}

const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        await Notification.deleteMany({ user_id: userId });
        
        res.status(200).json({
            success: true,
            message: 'Đã xóa tất cả thông báo'
        });
    } catch (error) {
        console.error('Error deleting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa thông báo',
            error: error.message
        });
    }
};


export default {
    getAllNotifications,
    deleteAllNotifications
}