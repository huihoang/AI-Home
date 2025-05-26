import express from 'express'
import configController from '../controllers/userConfig.controller.js'
import auth from '../middleware/auth.js'

const router = express.Router();


router.get('/',auth, configController.getUserConfig);
router.put('/',auth,configController.updateUserConfig);

router.post('/schedules', auth, configController.addSchedule);
router.delete('/schedules/:scheduleId', auth, configController.removeSchedule);
router.post('/automation/rules', auth, configController.addAutomationRule);
router.delete('/automation/rules/:ruleId', auth, configController.removeAutomationRule);


export default router   