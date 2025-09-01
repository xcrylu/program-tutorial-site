const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const userModel = require('../models/userModel');

// 验证用户是否已登录
exports.authenticate = async (req, res, next) => {
  try {
    // 从请求头或Cookie中获取令牌
    let token;
    
    // 检查请求头
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // 检查Cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).render('auth/login', {
        title: '登录 - 编程教程网',
        error: '请先登录'
      });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    // 检查用户是否存在
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).render('auth/login', {
        title: '登录 - 编程教程网',
        error: '用户不存在或已被删除'
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    res.locals.user = user; // 供模板使用
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).render('auth/login', {
        title: '登录 - 编程教程网',
        error: '无效的令牌'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).render('auth/login', {
        title: '登录 - 编程教程网',
        error: '令牌已过期，请重新登录'
      });
    }
    
    next(error);
  }
};

// 验证用户是否具有特定角色
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).render('auth/login', {
        title: '登录 - 编程教程网',
        error: '请先登录'
      });
    }
    
    // 检查用户角色是否在允许的角色列表中
    if (!roles.includes(req.user.role_name)) {
      return res.status(403).render('error', {
        title: '权限不足',
        message: '您没有足够的权限执行此操作'
      });
    }
    
    next();
  };
};

// 检查用户是否为游客（未登录）
exports.guest = (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    
    if (token) {
      // 验证令牌是否有效
      jwt.verify(token, authConfig.jwt.secret);
      // 如果有效，则说明用户已登录，重定向到首页
      return res.redirect('/');
    }
    
    next();
  } catch (error) {
    // 令牌无效或已过期，视为未登录
    next();
  }
};
