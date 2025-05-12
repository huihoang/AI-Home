
import express from 'express';
import UserController from '../controllers/users.controllers.js';
import auth from '../middleware/auth.js';
import usersControllers from '../controllers/users.controllers.js';

const router = express.Router();
  
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.put('/',auth, usersControllers.updateUser)

router.get('/profile', auth, (req, res) => {
  res.status(200).json({
    message: 'This is a protected route',
    user: req.user,  
  });
});

export default router;
