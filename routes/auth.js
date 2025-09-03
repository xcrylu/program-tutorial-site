const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, guest } = require('../middleware/auth');

const router = express.Router();

// 注册路由
router.get('/register', guest, authController.showRegisterForm);
router.post('/register', guest, [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度不能少于6个字符'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('两次输入的密码不一致');
      }
      return true;
    })
], authController.register);

// 登录路由
router.get('/login', guest, authController.showLoginForm);
router.post('/login', guest, [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('请输入用户名或邮箱'),
  body('password')
    .notEmpty()
    .withMessage('请输入密码')
], authController.login);

// 登出路由
router.get('/logout', authenticate, authController.logout);

// 个人资料路由
router.get('/profile', authenticate, authController.showProfile);

module.exports = router;
