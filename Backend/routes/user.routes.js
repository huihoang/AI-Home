
import express from 'express';
import UserController from '../controllers/users.controllers.js';
import auth from '../middleware/auth.js';

const router = express.Router();
  
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.put('/',auth, UserController.updateUser)
router.post('/forgot-password',UserController.forgotPassword);
router.post('/reset-password',UserController.resetPassword)

export default router;
