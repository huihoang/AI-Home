import Image from "../models/image.model.js";
import logService from "../utils/log.service.js";

// Lấy tất cả hình ảnh, sắp xếp theo timestamp mới nhất
const getAllImages = async (req, res) => {
    try {
        const {limit = 10, page = 1} = req.query;
        const skip  = (parseInt(page) - 1) * parseInt(limit);

        const images = await Image.find().sort({timestamp: -1}).skip(skip).limit(parseInt(limit));

        const total  = await Image.countDocuments();

        await logService.createLog(
            'get_images',
            `User ${req.user.user_id} fetched images`,
            {user_id: req.user.user_id}
        )

        res.status(200).json({
            success:true,
            count: images.length,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: images
        })
    } catch (error) {
        console.error("Error fetching images: ", error);
        res.status(500).json({ message: "Error fetching images",
            error: error.message,
            success: false
         });
    }
}

// Lấy hình ảnh theo ID
const getImageById = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hình ảnh"
            });
        }
        
        // Lưu log
        await logService.createLog(
            'get_image_detail',
            `User ${req.user.user_id} viewed image ${req.params.id}`,
            { user_id: req.user.user_id }
        );
        
        res.status(200).json({
            success: true,
            data: image
        });
    } catch (error) {
        console.error('Error getting image by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy hình ảnh',
            error: error.message
        });
    }
};

// Lấy hình ảnh theo phân loại (vd: "Have person")
const getImagesByClassification = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const { classification } = req.params;
        
        const images = await Image.find({ classification })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Image.countDocuments({ classification });
        
        // Lưu log
        await logService.createLog(
            'get_images_by_classification',
            `User ${req.user.user_id} fetched images with classification "${classification}"`,
            { user_id: req.user.user_id }
        );
        
        res.status(200).json({
            success: true,
            count: images.length,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: images
        });
    } catch (error) {
        console.error('Error getting images by classification:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy hình ảnh theo phân loại',
            error: error.message
        });
    }
};

// Lấy danh sách các loại phân loại (vd: "Have person", "No person", etc.)
const getClassifications = async (req, res) => {
    try {
        const classifications = await Image.distinct('classification');
        
        res.status(200).json({
            success: true,
            data: classifications
        });
    } catch (error) {
        console.error('Error getting classifications:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách phân loại',
            error: error.message
        });
    }
};

// Lưu ảnh mới khi camera phát hiện người
const addImage = async (req, res) => {
    try {
        const { image, timestamp, classification } = req.body;

        if (!image || !timestamp || !classification) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin hình ảnh, thời gian hoặc phân loại'
            });
        }

        const newImage = new Image({
            image,
            timestamp,
            classification
        });

        await newImage.save();
        
        // Lưu log
        await logService.createLog(
            'add_image',
            `New image added with classification "${classification}"`,
            { classification }
        );
        
        res.status(201).json({
            success: true,
            message: 'Thêm hình ảnh thành công',
            data: newImage
        });
    } catch (error) {
        console.error('Error adding image:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể thêm hình ảnh',
            error: error.message
        });
    }
};

// Xóa hình ảnh theo ID
const deleteImage = async (req, res) => {
    try {
        const image = await Image.findByIdAndDelete(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hình ảnh'
            });
        }
        
        // Lưu log
        await logService.createLog(
            'delete_image',
            `User ${req.user.user_id} deleted image ${req.params.id}`,
            { user_id: req.user.user_id }
        );
        
        res.status(200).json({
            success: true,
            message: 'Xóa hình ảnh thành công'
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa hình ảnh',
            error: error.message
        });
    }
};

export default {
    getAllImages,
    getImageById,
    getImagesByClassification,
    getClassifications,
    addImage,
    deleteImage
}