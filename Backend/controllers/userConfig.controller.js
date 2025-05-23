import { configDotenv } from "dotenv";
import UserConfig from "../models/userConfig.model.js";
import User from "../models/users.model.js";
import logService from "../utils/log.service.js";

const getUserConfig  = async (req, res) => {
    try {
        let config = await UserConfig.findOne({user_id: req.user.user_id});
        if(!config){
            config = new UserConfig({
                user_id: req.user.user_id 
            })
        }
        await config.save();

        res.status(200).json({
            message: 'User configuration retrieved successfully',
            config
        })

    } catch (error) {
        console.log('Error getting user config: ', error);
        res.status(500).json({
            message: 'Failed to get user configuration',
            error: error.message
        })
    }
}

const updateUserConfig = async (req,res) => {
    try {
        const  { thresholds, automation, notification, schedules } = req.body;

        let config = await UserConfig.findOne({user_id: req.user.user_id});
        if(!config){
            config = new UserConfig({
                user_id: req.user.user_id,  
                ...req.body
            });
        } else {
            if (thresholds) config.thresholds = thresholds;
            if (automation) config.automation = automation;
            if (notification) config.notification = notification;
            if (schedules) config.schedules = schedules;
        }
        await logService.createLog(
            `User_update_config`,
            `User ${req.user.user_id} have update system config`
        )

        await config.save();

        res.status(200).json({
            message: 'User configuration update successfully!',
            config
        });

    } catch (error) {
        res.status(500).json({
            message:'Failed to update user configuration',
            error: error.message
        });
    }
}






const addSchedule = async (req, res) => {
    try {
        const {device, status, time, days, enable} = req.body;
        if (!device || !status||! time || !days){
            return res.status(400).json({
                message: 'missing field'
            })
        }

        let config = await UserConfig.findOne({user_id: req.user.user_id})

        if (!config) {
            config = new UserConfig({
                user_id : req.user.user_id,
                schedules: []
            })
        }

        config.schedules.push({
            device,
            status,
            time, 
            days: days || [], 
            enable: enable || false
        })
        await config.save();
        await logService.createLog(
            `add_schedule`,
            `User ${req.user.user_id} have added new schedule`
        )
        res.status(500).json({
            message: 'Schedule added successfully',
            schedule: config.schedules[config.schedules.length - 1],
            schedules: config.schedules
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Error adding schedule",
            error: error.message
        })
    }
}

// Xóa lịch trình
const removeSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        
        let config = await UserConfig.findOne({ user_id: req.user.user_id });
        if (!config) {
            return res.status(404).json({
                message: "User configuration not found"
            });
        }
        
        // Tìm vị trí của lịch trình trong mảng
        const scheduleIndex = config.schedules.findIndex(schedule => 
            schedule._id.toString() === scheduleId
        );
        
        if (scheduleIndex === -1) {
            return res.status(404).json({
                message: "Schedule not found"
            });
        }
        
        // Xóa lịch trình khỏi mảng
        config.schedules.splice(scheduleIndex, 1);
        await logService.createLog(
            `delete_schedule`,
            `User ${req.user.user_id} have deleted schedule`
        )
        await config.save();
        
        res.status(200).json({
            message: "Schedule deleted successfully",
            schedules: config.schedules
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error removing schedule",
            error: error.message
        });
    }
};


const addAutomationRule = async (req, res) => {
    try {
        const { condition, action } = req.body;
        
        if (!condition || !action) {
            return res.status(400).json({
                message: "Both condition and action are required"
            });
        }
        
        if (!condition.sensor || !condition.operator || condition.value === undefined) {
            return res.status(400).json({
                message: "Condition requires sensor, operator and value fields"
            });
        }
        
        if (!action.feedId || !action.status) {
            return res.status(400).json({
                message: "Action requires feedId and status fields"
            });
        }
        
        let config = await UserConfig.findOne({ user_id: req.user.user_id });
        if (!config) {
            config = new UserConfig({
                user_id: req.user.user_id,
                automation: {
                    enable: true,
                    rules: []
                }
            });
        } else if (!config.automation) {
            config.automation = {
                enable: true,
                rules: []
            };
        }
        
        // Thêm quy tắc mới vào mảng rules
        config.automation.rules.push({ condition, action });
        
        await config.save();
        
        res.status(201).json({
            message: "Automation rule added successfully",
            rule: config.automation.rules[config.automation.rules.length - 1],
            rules: config.automation.rules
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error adding automation rule",
            error: error.message
        });
    }
};

// Xóa quy tắc tự động
const removeAutomationRule = async (req, res) => {
    try {
        const { ruleId } = req.params;
        
        let config = await UserConfig.findOne({ user_id: req.user.user_id });
        if (!config || !config.automation || !config.automation.rules) {
            return res.status(404).json({
                message: "Automation rules not found"
            });
        }
        
        // Tìm vị trí của quy tắc cần xóa
        const ruleIndex = config.automation.rules.findIndex(rule => 
            rule._id.toString() === ruleId
        );
        
        if (ruleIndex === -1) {
            return res.status(404).json({
                message: "Automation rule not found"
            });
        }
        
        // Xóa quy tắc khỏi mảng
        config.automation.rules.splice(ruleIndex, 1);
        
        await config.save();
        
        res.status(200).json({
            message: "Automation rule removed successfully",
            rules: config.automation.rules
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error removing automation rule",
            error: error.message
        });
    }
};

 

export default {
    getUserConfig,
    updateUserConfig,
    addSchedule,
    removeSchedule,
    addAutomationRule,
    removeAutomationRule
}