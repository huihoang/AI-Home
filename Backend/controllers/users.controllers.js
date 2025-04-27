import bcrypt from 'bcryptjs'
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/users.model.js'
import emailService from '../utils/emailService.js';
import { error } from 'console';
import { truncateSync } from 'fs';

const registerUser = async (req, res) => {
  const { user_name, password, role, email, full_name, phoneNum, identification, address } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }


    const newUser = new User({
      user_name,
      password,
      role,
      email,
      full_name,
      phoneNum,
      identification,
      address
    });



    await newUser.save();


    if (!newUser._id || !newUser.email) {
      return res.status(500).json({ message: 'Required user information missing' });
    }

    const token = jwt.sign(
      { user_id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const loginUser = async (req, res) => {

  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing' });
  }

  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { user_id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {

    const userId = req.user.user_id;

    const { user_name, email, fullName, phoneNum, address } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (user_name) user.user_name = user_name;
    if (fullName) user.fullName = fullName;
    if (phoneNum) user.phoneNum = phoneNum;
    if (address) user.address = address;

    const updatedUser = await user.save();
    await logService.createLog(
      'user_update',
      `Người dùng cập nhật thông tin cá nhân`,
      { user_id: userId }
    );

    const userResponse = {
      _id: updatedUser._id,
      user_name: updatedUser.user_name,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNum: updatedUser.phoneNum,
      address: updatedUser.address,
      role: updatedUser.role
    };

    res.status(200).json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailSent = await emailService.sendEmailPasswordEmail(email, resetLink);

    if (emailSent) {
      res.status(200).json({
        message: "Email reset password sent successfully",
        token: resetToken,
        success: true,
        error: false
      })
    }
    else {
      res.status(500).json({
        message: "Error sending email",
        
      })
    }
  } catch (error) {
    console.error("Error forgot passsword", error);
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ message: 'Token and password is required' })
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({message:'Reset password token is expired or incorrect'});
    }

    
    if (new_password) {
      user.password = new_password
    }

    user.resetPasswordToken = null;
    user.resetPasswordExpires =null;

    await user.save();


    res.status(200).json({
      message: 'Password is updated successfully',
    })
  } catch (error) {
    console.error('Error reset password', error);
    res.status(500).json({
      message: error.message
    })
  }
}

export default {
  registerUser,
  loginUser,
  updateUser,
  forgotPassword,
  resetPassword
};

