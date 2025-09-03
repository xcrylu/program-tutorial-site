const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const authConfig = require('../config/auth');

// 显示注册页面
exports.showRegisterForm = (req, res) => {
  res.render('auth/register', {
    title: '注册 - 编程教程网',
    errors: [],
    oldInput: {}
  });
};

// 处理注册请求
exports.register = async (req, res, next) => {
  try {
    // 验证表单数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/register', {
        title: '注册 - 编程教程网',
        errors: errors.array(),
        oldInput: req.body
      });
    }
    
    // 注册用户
    const user = await userModel.register({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    
    // 注册成功后重定向到登录页
    res.redirect('/login?registered=true');
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode || 500 ).render('auth/register', {
        title: '注册 - 编程教程网',
        errors: [{ msg: error.message }],
        oldInput: req.body
      });
    }
    next(error);
  }
};

// 显示登录页面
exports.showLoginForm = (req, res) => {
  const registered = req.query.registered === 'true';
  
  res.render('auth/login', {
    title: '登录 - 编程教程网',
    errors: [],
    registered,
    oldInput: { identifier: '' },
    message: registered ? '注册成功，请登录' : null
  });
};

// 处理登录请求
exports.login = async (req, res, next) => {
  try {
    // 验证表单数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/login', {
        title: '登录 - 编程教程网',
        errors: errors.array(),
        oldInput: {identifier: req.body.identifier} 
      });
    }
    
    // 登录验证
    const { user, token } = await userModel.login({
      identifier: req.body.identifier,
      password: req.body.password
    });
    
    // 设置Cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: parseInt(authConfig.jwt.cookieExpires) * 24 * 60 * 60 * 1000, // 转换为毫秒
      //secure: process.env.NODE_ENV === 'production' // 生产环境使用HTTPS
    });
    
    // 登录成功后重定向
    if (req.body.redirect) {
      return res.redirect(req.body.redirect);
    }
    
    // 管理员跳转到管理页面，普通用户跳转到首页
    res.redirect(user.role_name === 'admin' ? '/admin' : '/');
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode || 500).render('auth/login', {
        title: '登录 - 编程教程网',
        errors:[{ message: error.message}],
        oldInput: req.body.identifier
      });
    }
    next(error);
  }
};

// 处理登出请求
exports.logout = (req, res) => {
  // 清除Cookie
  res.clearCookie('token');
  res.redirect('/');
};

// 显示用户个人资料页面
exports.showProfile = (req, res) => {
  res.render('auth/profile', {
    title: '个人资料 - 编程教程网',
    user: req.user
  });
};
